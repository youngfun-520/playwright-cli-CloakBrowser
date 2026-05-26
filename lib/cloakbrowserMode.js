/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs/promises');
const os = require('os');
const path = require('path');

let tempConfigCounter = 0;

function isCloakBrowserName(value) {
  return typeof value === 'string' && value.toLowerCase() === 'cloakbrowser';
}

function splitLongOption(arg) {
  const index = arg.indexOf('=');
  if (index === -1)
    return { name: arg, value: undefined };
  return { name: arg.slice(0, index), value: arg.slice(index + 1) };
}

function parseCliArgs(argv) {
  const parsed = {
    commandIndex: -1,
    command: undefined,
    browser: undefined,
    config: undefined,
    headless: undefined,
  };
  const valueOptions = new Set(['--browser', '--config', '--session', '-s']);

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const { name, value } = splitLongOption(arg);
      if (name === '--browser')
        parsed.browser = value ?? argv[i + 1];
      if (name === '--config')
        parsed.config = value ?? argv[i + 1];
      if (name === '--headed')
        parsed.headless = false;
      if (value === undefined && valueOptions.has(name))
        i++;
      continue;
    }
    if (arg === '-s') {
      i++;
      continue;
    }
    if (arg.startsWith('-'))
      continue;
    if (parsed.commandIndex === -1) {
      parsed.commandIndex = i;
      parsed.command = arg;
    }
  }

  return parsed;
}

function removeOption(argv, optionName) {
  for (let i = argv.length - 1; i >= 2; i--) {
    const arg = argv[i];
    if (arg === optionName) {
      argv.splice(i, 2);
      continue;
    }
    if (arg.startsWith(`${optionName}=`))
      argv.splice(i, 1);
  }
}

async function loadJsonConfig(configPath, cwd) {
  if (!configPath)
    return {};
  const resolved = path.isAbsolute(configPath) ? configPath : path.resolve(cwd, configPath);
  const text = await fs.readFile(resolved, 'utf8');
  return JSON.parse(text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text);
}

function pickDefined(object) {
  return Object.fromEntries(Object.entries(object || {}).filter(([_, value]) => value !== undefined));
}

function mergeConfig(base, override) {
  return {
    ...pickDefined(base),
    ...pickDefined(override),
    browser: {
      ...pickDefined(base.browser),
      ...pickDefined(override.browser),
      launchOptions: {
        ...pickDefined(base.browser && base.browser.launchOptions),
        ...pickDefined(override.browser && override.browser.launchOptions),
      },
      contextOptions: {
        ...pickDefined(base.browser && base.browser.contextOptions),
        ...pickDefined(override.browser && override.browser.contextOptions),
      },
    },
  };
}

function argKey(arg) {
  return arg.split('=', 1)[0];
}

function dedupeArgs(args) {
  const seen = new Map();
  for (const arg of args || [])
    seen.set(argKey(arg), arg);
  return [...seen.values()];
}

function removeAutomationControlled(args) {
  const result = [];
  for (const arg of args || []) {
    if (!arg.startsWith('--disable-blink-features=')) {
      result.push(arg);
      continue;
    }
    const features = arg.slice('--disable-blink-features='.length)
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature && feature !== 'AutomationControlled');
    if (features.length)
      result.push(`--disable-blink-features=${features.join(',')}`);
  }
  if (!result.some(arg => arg.startsWith('--disable-blink-features=')))
    result.push('--disable-blink-features=');
  return result;
}

function buildCloakConfig(existingConfig, cloakLaunchOptions, launchOptionOverrides = {}) {
  const existingLaunchOptions = existingConfig.browser && existingConfig.browser.launchOptions || {};
  const combinedArgs = removeAutomationControlled(dedupeArgs([
    ...(cloakLaunchOptions.args || []),
    ...(existingLaunchOptions.args || []),
  ]));
  const launchOptions = {
    ...existingLaunchOptions,
    ...cloakLaunchOptions,
    ...pickDefined(launchOptionOverrides),
    args: combinedArgs,
  };
  delete launchOptions.channel;

  return mergeConfig(existingConfig, {
    browser: {
      browserName: 'chromium',
      launchOptions,
    },
  });
}

async function defaultBuildLaunchOptions(options) {
  const cloakbrowser = await import('cloakbrowser');
  return await cloakbrowser.buildLaunchOptions(options);
}

function cloakBrowserOptions(parsed, existingConfig) {
  const options = {};
  const existingHeadless = existingConfig.browser && existingConfig.browser.launchOptions &&
    existingConfig.browser.launchOptions.headless;
  if (typeof existingHeadless === 'boolean')
    options.headless = existingHeadless;
  if (parsed.headless !== undefined)
    options.headless = parsed.headless;
  return options;
}

async function writeTempConfig(config, tempRoot) {
  const root = tempRoot || path.join(os.tmpdir(), 'playwright-cli-cloakbrowser');
  await fs.mkdir(root, { recursive: true });
  const file = path.join(root, `cloakbrowser-${process.pid}-${Date.now()}-${tempConfigCounter++}.json`);
  await fs.writeFile(file, JSON.stringify(config, null, 2));
  return file;
}

async function maybeApplyCloakBrowserMode(argv = process.argv, options = {}) {
  const parsed = parseCliArgs(argv);
  if (parsed.command !== 'open')
    return { applied: false };
  if (parsed.browser && !isCloakBrowserName(parsed.browser))
    return { applied: false };

  const cwd = options.cwd || process.cwd();
  const existingConfig = await loadJsonConfig(parsed.config, cwd);
  const buildLaunchOptions = options.buildLaunchOptions || defaultBuildLaunchOptions;
  const cloakOptions = cloakBrowserOptions(parsed, existingConfig);
  const hasCloakOptions = Object.keys(cloakOptions).length > 0;
  const cloakLaunchOptions = await buildLaunchOptions(hasCloakOptions ? cloakOptions : undefined);
  const config = buildCloakConfig(existingConfig, cloakLaunchOptions, cloakOptions);
  const configPath = await writeTempConfig(config, options.tempRoot);

  removeOption(argv, '--browser');
  removeOption(argv, '--config');
  argv.push(`--config=${configPath}`);

  return { applied: true, configPath, config };
}

module.exports = {
  maybeApplyCloakBrowserMode,
};
