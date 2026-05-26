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

import { test, expect } from '@playwright/test';

const { installCloakBrowser } = require('../scripts/install-cloakbrowser');

test('postinstall skips CloakBrowser binary download when requested', async () => {
  let called = false;
  const result = await installCloakBrowser({
    env: { PLAYWRIGHT_CLI_SKIP_CLOAKBROWSER_INSTALL: '1' },
    ensureBinary: async () => {
      called = true;
    },
  });

  expect(result).toEqual({ skipped: true });
  expect(called).toBe(false);
});

test('postinstall ensures CloakBrowser binary by default', async () => {
  let called = false;
  const result = await installCloakBrowser({
    env: {},
    ensureBinary: async () => {
      called = true;
      return 'C:\\cloak\\chrome.exe';
    },
  });

  expect(result).toEqual({ skipped: false, binaryPath: 'C:\\cloak\\chrome.exe' });
  expect(called).toBe(true);
});

test('postinstall skips git preparation lifecycle when CloakBrowser dependency is not installed yet', async () => {
  const moduleNotFoundError = Object.assign(
      new Error("Cannot find package 'cloakbrowser' imported from scripts/install-cloakbrowser.js"),
      { code: 'ERR_MODULE_NOT_FOUND' });

  const result = await installCloakBrowser({
    cwd: 'C:\\Users\\a1874\\AppData\\Local\\npm-cache\\_cacache\\tmp\\git-cloneabc123',
    env: {},
    ensureBinary: async () => {
      throw moduleNotFoundError;
    },
  });

  expect(result).toEqual({ skipped: true, reason: 'cloakbrowser-unavailable' });
});

test('postinstall fails when CloakBrowser dependency is missing outside git preparation', async () => {
  const moduleNotFoundError = Object.assign(
      new Error("Cannot find package 'cloakbrowser' imported from scripts/install-cloakbrowser.js"),
      { code: 'ERR_MODULE_NOT_FOUND' });

  await expect(installCloakBrowser({
    cwd: 'C:\\Users\\a1874\\Documents\\playwright-cli-CloakBrowser',
    env: {},
    ensureBinary: async () => {
      throw moduleNotFoundError;
    },
  })).rejects.toThrow("Cannot find package 'cloakbrowser'");
});
