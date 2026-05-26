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

async function defaultEnsureBinary() {
  const { ensureBinary } = await import('cloakbrowser');
  return await ensureBinary();
}

async function installCloakBrowser(options = {}) {
  const env = options.env || process.env;
  if (env.PLAYWRIGHT_CLI_SKIP_CLOAKBROWSER_INSTALL === '1' ||
      env.PLAYWRIGHT_CLI_SKIP_CLOAKBROWSER_INSTALL === 'true') {
    console.log('Skipping CloakBrowser binary install.');
    return { skipped: true };
  }

  const ensureBinary = options.ensureBinary || defaultEnsureBinary;
  const binaryPath = await ensureBinary();
  console.log(`CloakBrowser binary ready: ${binaryPath}`);
  return { skipped: false, binaryPath };
}

if (require.main === module) {
  installCloakBrowser().catch(error => {
    console.error(`CloakBrowser install failed: ${error.message}`);
    console.error('Set PLAYWRIGHT_CLI_SKIP_CLOAKBROWSER_INSTALL=1 to skip binary download during install.');
    process.exit(1);
  });
}

module.exports = {
  installCloakBrowser,
};
