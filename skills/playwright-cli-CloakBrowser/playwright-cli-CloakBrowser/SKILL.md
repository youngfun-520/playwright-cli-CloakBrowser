---
name: playwright-cli-CloakBrowser
description: Browser automation with playwright-cli and CloakBrowser. Use this skill whenever the user wants to open or see a browser, control a webpage, click buttons, fill forms, scrape page content, capture screenshots/PDFs, inspect page state, debug web apps, run Playwright-style browser code, mock requests, record traces/videos, generate Playwright tests, or review UI in a live browser — even when the user does not explicitly say "playwright", "CloakBrowser", or "browser automation".
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(node:*) Bash(cat:*) Bash(ls:*) Bash(mkdir:*) Bash(cp:*) Bash(rm:*) Bash(pwd:*) Bash(test:*)
---

# playwright-cli-CloakBrowser

Use `playwright-cli` to control CloakBrowser or another Playwright-supported browser from the terminal. Treat this as an execution skill: decide the browser mode, open the session, inspect the page, interact through stable refs, verify results, and clean up.

## Trigger and mode selection

Use this skill for any task involving a real webpage or browser state: navigation, clicking, typing, form submission, screenshots, scraping, UI review, web-app debugging, network inspection, request mocking, test generation, tracing, or recording.

Choose the browser visibility before opening:

| User intent | Start command | Rationale |
|---|---|---|
| User wants to see the browser: "打开浏览器", "open browser", "show me", "visible", "headed", "让我看看", UI review | `playwright-cli open --headed [url]` | A visible window is expected. |
| Background automation, scraping, testing, extraction, no visual request | `playwright-cli open [url]` | Default headless mode is faster and less intrusive. |
| Ambiguous but human visual feedback is likely | Ask briefly, or choose `--headed` when proceeding is better than blocking. | Avoid surprising the user with an invisible browser. |

After every `open`, run `playwright-cli list` and verify the `headed` value matches the selected mode.

## Core workflow

Follow this loop for ordinary browser tasks:

```bash
playwright-cli open --headed https://example.com   # or omit --headed for background tasks
playwright-cli list                                # verify headed/headless and active session
playwright-cli snapshot                            # inspect page and get refs such as e1, e2
playwright-cli click e3                            # interact using refs from snapshot
playwright-cli snapshot                            # verify the result
playwright-cli close                               # clean up when finished
```

Do not interact blindly. Take a `snapshot` before clicks, fills, selects, uploads, checks, drags, or assertions unless you already have a fresh ref from the immediately preceding output.

## Required operating rules

1. **Verify sessions after opening.** Always run `playwright-cli list` after `open`; check browser, URL, session name, and headed/headless state.
2. **Snapshot before action.** Prefer refs from `snapshot` (`e1`, `e2`, …). Use selectors or locators only when refs are unavailable or when a test requires stable locator design.
3. **Verify after meaningful action.** After navigation, submit, click, upload, mock, or storage changes, run `snapshot`, `eval`, `requests`, or another relevant command to confirm outcome.
4. **Close what you open.** Use `playwright-cli close` for the current session, `close-all` for multiple skill-created sessions, and `kill-all` only for stuck/zombie browsers.
5. **Prefer in-memory profiles.** Use persistent profiles only when the task requires login/session reuse across restarts or the user explicitly asks.
6. **Do not leak secrets.** Never print passwords, tokens, cookies, or storage state in the final answer. Redact sensitive values when reporting findings.
7. **Keep generated artifacts explicit.** When saving screenshots, PDFs, traces, videos, storage state, or test files, specify filenames and tell the user where they were saved.

## Common tasks

### Open or navigate

```bash
playwright-cli open --headed https://example.com
playwright-cli list
playwright-cli goto https://example.com/dashboard
playwright-cli go-back
playwright-cli go-forward
playwright-cli reload
```

### Interact with page elements

```bash
playwright-cli snapshot
playwright-cli click e5
playwright-cli dblclick e8
playwright-cli hover e4
playwright-cli fill e2 "user@example.com"
playwright-cli fill e3 "password" --submit
playwright-cli type "freeform keyboard text"
playwright-cli press Enter
playwright-cli select e9 "option-value"
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli drag e2 e8
playwright-cli upload ./document.pdf
playwright-cli resize 1440 1000
playwright-cli snapshot
```

### Extract page information

```bash
playwright-cli eval "document.title"
playwright-cli eval "location.href"
playwright-cli eval "el => el.textContent" e5
playwright-cli --raw eval "JSON.stringify([...document.querySelectorAll('a')].map(a => a.href))" > links.json
```

### Capture output

```bash
playwright-cli screenshot --filename=page.png
playwright-cli screenshot e5 --filename=element.png
playwright-cli pdf --filename=page.pdf
playwright-cli snapshot --filename=after-action.yml
```

### Work with multiple tabs or sessions

```bash
playwright-cli tab-list
playwright-cli tab-new https://example.com/other
playwright-cli tab-select 0
playwright-cli tab-close 1

playwright-cli -s=auth open --headed https://app.example.com/login
playwright-cli -s=data open https://app.example.com/data
playwright-cli -s=auth snapshot
playwright-cli -s=data eval "document.title"
playwright-cli close-all
```

### UI review with user annotation

Use the annotation dashboard when the user asks for UI review, design feedback, wants to point at something visually, or asks you to ask them what they mean.

```bash
playwright-cli open --headed https://example.com
playwright-cli list
playwright-cli show --annotate
```

The user can draw on the live page and leave notes; use the returned annotation, screenshot, and snapshot to continue.

## Command reference pointers

Keep this SKILL.md short and use references for details:

- `references/commands.md` — complete command cheat sheet and examples.
- `references/sessions-and-state.md` — named sessions, persistent profiles, attach/CDP, cookies, storage state.
- `references/debugging-and-observability.md` — console logs, network requests, request mocking, raw output, tracing, video, running code.
- `references/testing-workflows.md` — Playwright test debugging, test generation, spec-driven testing and healing.
- `references/element-targeting.md` — refs, CSS selectors, Playwright locators, test IDs, element attributes.

Read the relevant reference when the task mentions those topics or when the basic workflow is insufficient.

## Installation and fallback

If `playwright-cli` is unavailable:

```bash
npx --no-install playwright-cli --version
```

When a local version exists, use `npx playwright-cli ...` for commands. Otherwise install the CloakBrowser-enabled fork when appropriate for the environment:

```bash
npm install -g https://github.com/youngfun-520/playwright-cli-CloakBrowser/archive/refs/heads/main.tar.gz
```

Set `PLAYWRIGHT_CLI_SKIP_CLOAKBROWSER_INSTALL=1` only when the environment must skip the CloakBrowser binary download.
