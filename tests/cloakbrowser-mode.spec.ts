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

import fs from 'fs/promises';
import path from 'path';
import { test, expect } from '@playwright/test';

const { maybeApplyCloakBrowserMode } = require('../lib/cloakbrowserMode');

const fakeLaunchOptions = {
  executablePath: path.join('C:', 'cloak', 'chrome.exe'),
  headless: true,
  args: [
    '--no-sandbox',
    '--fingerprint=12345',
    '--disable-blink-features=AutomationControlled',
  ],
  ignoreDefaultArgs: ['--enable-automation', '--enable-unsafe-swiftshader'],
  proxy: { server: 'http://proxy.example:8080' },
};

async function readConfig(configPath: string): Promise<any> {
  return JSON.parse(await fs.readFile(configPath, 'utf8'));
}

test('open without browser defaults to CloakBrowser launch config', async ({}, testInfo) => {
  const argv = [process.execPath, 'playwright-cli.js', 'open', 'data:text/html,hello'];
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async () => fakeLaunchOptions,
    tempRoot: testInfo.outputPath('tmp'),
  });

  expect(result.applied).toBe(true);
  expect(argv).toContain('open');
  expect(argv).not.toContain('--browser=CloakBrowser');

  const configArg = argv.find((arg: string) => arg.startsWith('--config='));
  expect(configArg).toBeTruthy();
  const config = await readConfig(configArg!.slice('--config='.length));
  expect(config.browser.browserName).toBe('chromium');
  expect(config.browser.launchOptions.executablePath).toBe(fakeLaunchOptions.executablePath);
  expect(config.browser.launchOptions.ignoreDefaultArgs).toEqual(fakeLaunchOptions.ignoreDefaultArgs);
  expect(config.browser.launchOptions.args).toContain('--fingerprint=12345');
  expect(config.browser.launchOptions.args).not.toContain('--disable-blink-features=AutomationControlled');
  expect(config.browser.launchOptions.args).toContain('--disable-blink-features=');
});

test('explicit CloakBrowser browser flag is case-insensitive and removed before delegation', async ({}, testInfo) => {
  const argv = [process.execPath, 'playwright-cli.js', '-s=agent', 'open', '--browser=cloakbrowser'];
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async () => fakeLaunchOptions,
    tempRoot: testInfo.outputPath('tmp'),
  });

  expect(result.applied).toBe(true);
  expect(argv).toContain('-s=agent');
  expect(argv).not.toContain('--browser=cloakbrowser');
  expect(argv.some((arg: string) => arg.startsWith('--config='))).toBe(true);
});

test('stock browser selection is left unchanged', async ({}, testInfo) => {
  const argv = [process.execPath, 'playwright-cli.js', 'open', '--browser=chrome'];
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async () => {
      throw new Error('CloakBrowser should not be loaded for stock browsers');
    },
    tempRoot: testInfo.outputPath('tmp'),
  });

  expect(result.applied).toBe(false);
  expect(argv).toEqual([process.execPath, 'playwright-cli.js', 'open', '--browser=chrome']);
});

test('headed open asks CloakBrowser for headed launch options', async ({}, testInfo) => {
  const argv = [process.execPath, 'playwright-cli.js', 'open', '--headed'];
  let receivedOptions: any;
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async (options: any) => {
      receivedOptions = options;
      return fakeLaunchOptions;
    },
    tempRoot: testInfo.outputPath('tmp'),
  });

  expect(result.applied).toBe(true);
  expect(receivedOptions).toEqual({ headless: false });
});

test('existing config is merged with CloakBrowser launch config', async ({}, testInfo) => {
  const configPath = testInfo.outputPath('user-config.json');
  await fs.writeFile(configPath, JSON.stringify({
    browser: {
      contextOptions: {
        viewport: { width: 900, height: 700 },
        userAgent: 'Agent/1.0',
      },
      launchOptions: {
        slowMo: 25,
      },
    },
    outputDir: 'artifacts',
  }));

  const argv = [process.execPath, 'playwright-cli.js', 'open', '--config', configPath];
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async () => fakeLaunchOptions,
    tempRoot: testInfo.outputPath('tmp'),
  });

  expect(result.applied).toBe(true);
  expect(argv).not.toContain(configPath);
  const configArg = argv.find((arg: string) => arg.startsWith('--config='));
  const config = await readConfig(configArg!.slice('--config='.length));
  expect(config.outputDir).toBe('artifacts');
  expect(config.browser.contextOptions).toEqual({
    viewport: { width: 900, height: 700 },
    userAgent: 'Agent/1.0',
  });
  expect(config.browser.launchOptions.slowMo).toBe(25);
  expect(config.browser.launchOptions.executablePath).toBe(fakeLaunchOptions.executablePath);
});

test('existing headless config is passed to CloakBrowser and preserved', async ({}, testInfo) => {
  const configPath = testInfo.outputPath('headless-config.json');
  await fs.writeFile(configPath, JSON.stringify({
    browser: {
      launchOptions: {
        headless: false,
      },
    },
  }));

  const argv = [process.execPath, 'playwright-cli.js', 'open', '--config', configPath];
  let receivedOptions: any;
  const result = await maybeApplyCloakBrowserMode(argv, {
    buildLaunchOptions: async (options: any) => {
      receivedOptions = options;
      return fakeLaunchOptions;
    },
    tempRoot: testInfo.outputPath('tmp'),
  });

  const configArg = argv.find((arg: string) => arg.startsWith('--config='));
  const config = await readConfig(configArg!.slice('--config='.length));
  expect(result.applied).toBe(true);
  expect(receivedOptions).toEqual({ headless: false });
  expect(config.browser.launchOptions.headless).toBe(false);
});
