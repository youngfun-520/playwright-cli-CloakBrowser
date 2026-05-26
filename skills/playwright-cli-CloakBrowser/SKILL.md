---
name: playwright-cli-CloakBrowser
description: Browser automation with playwright-cli and CloakBrowser. Use this skill whenever the user wants to open or see a browser, control a webpage, move the mouse, click buttons, fill forms, scrape page content, capture screenshots/PDFs, inspect page state, debug web apps, run Playwright-style browser code, mock requests, record traces/videos, generate Playwright tests, or review UI in a live browser — even when the user does not explicitly say "playwright", "CloakBrowser", or "browser automation".
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(node:*) Bash(cat:*) Bash(ls:*) Bash(mkdir:*) Bash(cp:*) Bash(rm:*) Bash(pwd:*) Bash(test:*)
---

# playwright-cli-CloakBrowser

Use `playwright-cli` to control CloakBrowser or another Playwright-supported browser from the terminal. Treat this as an execution skill: decide the browser mode, open the session, inspect the page, interact through stable refs, verify results, and clean up.


## Command discovery and anti-guessing policy

Before using or explaining any CLI command, prefer terminal help over memory. Do not guess command names, arguments, flags, or categories from intuition.

Required discovery order:

1. Run `playwright-cli --help` at the start of any non-trivial session, when the installed CLI version is unknown, or when the user asks what the CLI can do.
2. Run `playwright-cli --help <command>` before using an unfamiliar command, a command with optional arguments, or a command whose syntax matters.
3. Use the help output as the source of truth. If installed help differs from this file or a reference file, follow the installed help and mention the difference when relevant.
4. For capability questions, answer from the complete command list below plus current `--help` output. Do not answer from memory, common Playwright knowledge, or partial categories.
5. If a command is not visible in `--help`, do not invent it. Use `references/commands.md` only as a local reference, and verify with `--help` when possible.

The CLI help summary known to this skill is copied here so the agent sees the full command surface before choosing an approach.

### CLI help command surface

Usage:

```bash
playwright-cli <command> [args] [options]
playwright-cli -s=<session> <command> [args] [options]
```

Core commands:

```text
open [url]                         open the browser
attach [name]                      attach to a running playwright browser
close                              close the browser
detach                             detach from an attached browser
goto <url>                         navigate to a url
type <text>                        type text into editable element
click <target> [button]            perform click on a web page
dblclick <target> [button]         perform double click on a web page
fill <target> <text>               fill text into editable element
drag <startTarget> <endTarget>     perform drag and drop between two elements
drop <target>                      drop files or data onto an element
hover <target>                     hover over element on page
select <target> <val>              select an option in a dropdown
upload <file>                      upload one or multiple files
check <target>                     check a checkbox or radio button
uncheck <target>                   uncheck a checkbox or radio button
snapshot [target]                  capture page snapshot to obtain element ref
eval <func> [target]               evaluate javascript expression on page or element
dialog-accept [prompt]             accept a dialog
dialog-dismiss                     dismiss a dialog
resize <w> <h>                     resize the browser window
delete-data                        delete session data
```

Navigation commands:

```text
go-back                            go back to the previous page
go-forward                         go forward to the next page
reload                             reload the current page
```

Keyboard commands:

```text
press <key>                        press a key on the keyboard
keydown <key>                      press a key down on the keyboard
keyup <key>                        press a key up on the keyboard
```

Mouse commands:

```text
mousemove <x> <y>                  move mouse to a given position
mousedown [button]                 press mouse down
mouseup [button]                   press mouse up
mousewheel <dx> <dy>               scroll mouse wheel
```

Save commands:

```text
screenshot [target]                screenshot of the current page or element
pdf                                save page as pdf
```

Tab commands:

```text
tab-list                           list all tabs
tab-new [url]                      create a new tab
tab-close [index]                  close a browser tab
tab-select <index>                 select a browser tab
```

Storage commands:

```text
state-load <filename>              loads browser storage/authentication state from a file
state-save [filename]              saves the current storage/authentication state to a file
cookie-list                        list all cookies
cookie-get <name>                  get a specific cookie by name
cookie-set <name> <value>          set a cookie with optional flags
cookie-delete <name>               delete a specific cookie
cookie-clear                       clear all cookies
localstorage-list                  list all localStorage key-value pairs
localstorage-get <key>             get a localStorage item by key
localstorage-set <key> <value>     set a localStorage item
localstorage-delete <key>          delete a localStorage item
localstorage-clear                 clear all localStorage
sessionstorage-list                list all sessionStorage key-value pairs
sessionstorage-get <key>           get a sessionStorage item by key
sessionstorage-set <key> <value>   set a sessionStorage item
sessionstorage-delete <key>        delete a sessionStorage item
sessionstorage-clear               clear all sessionStorage
```

Network commands:

```text
requests                           list network requests since loading the page
request <index>                    show full request/response details
request-headers <index>            print request headers
request-body <index>               print request body
response-headers <index>           print response headers
response-body <index>              print response body; binary bodies are saved to a file
route <pattern>                    mock network requests matching a URL pattern
route-list                         list all active network routes
unroute [pattern]                  remove matching routes, or all routes
network-state-set <state>          set browser network state to online or offline
```

DevTools commands:

```text
console [min-level]                list console messages
run-code [code]                    run a Playwright code snippet
tracing-start                      start trace recording
tracing-stop                       stop trace recording
video-start [filename]             start video recording
video-stop                         stop video recording
video-chapter <title>              add a chapter marker to the video recording
show                               show Playwright dashboard
pause-at <location>                run the test up to a specific location and pause there
resume                             resume test execution
step-over                          step over the next call in the test
generate-locator <target>          generate a Playwright locator for an element
highlight [target]                 show or hide a highlight overlay for an element
```

Install commands:

```text
install                            initialize workspace
install-browser [browser]          install browser
```

Browser session commands:

```text
list                               list browser sessions
close-all                          close all browser sessions
kill-all                           forcefully kill stale/zombie browser sessions
```

Global options:

```text
--help [command]                   print help
--json                             output response as JSON
--raw                              output only the result value
--version                          print version
```

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
playwright-cli --help                              # inspect installed command surface
playwright-cli open --headed https://example.com   # or omit --headed for background tasks
playwright-cli list                                # verify headed/headless and active session
playwright-cli snapshot                            # inspect page and get refs such as e1, e2
playwright-cli click e3                            # interact using refs from snapshot
playwright-cli snapshot                            # verify the result
playwright-cli close                               # clean up when finished
```

Do not interact blindly. Take a `snapshot` before clicks, fills, selects, uploads, checks, drags, hovers, coordinate mouse moves, or assertions unless you already have a fresh ref from the immediately preceding output.

## Required operating rules

1. **Discover commands before assuming.** Prefer `playwright-cli --help` and `playwright-cli --help <command>` in the terminal before using or explaining commands. Do not guess from memory or common Playwright conventions.
2. **Verify sessions after opening.** Always run `playwright-cli list` after `open`; check browser, URL, session name, and headed/headless state.
3. **Snapshot before action.** Prefer refs from `snapshot` (`e1`, `e2`, …). Use selectors or locators only when refs are unavailable or when a test requires stable locator design.
4. **Verify after meaningful action.** After navigation, submit, click, upload, mock, or storage changes, run `snapshot`, `eval`, `requests`, or another relevant command to confirm outcome.
5. **Close what you open.** Use `playwright-cli close` for the current session, `close-all` for multiple skill-created sessions, and `kill-all` only for stuck/zombie browsers.
6. **Prefer in-memory profiles.** Use persistent profiles only when the task requires login/session reuse across restarts or the user explicitly asks.
7. **Do not leak secrets.** Never print passwords, tokens, cookies, or storage state in the final answer. Redact sensitive values when reporting findings.
8. **Keep generated artifacts explicit.** When saving screenshots, PDFs, traces, videos, storage state, or test files, specify filenames and tell the user where they were saved.
9. **Answer capability questions from the command set.** When the user asks what you can do in a category such as mouse, keyboard, network, storage, tabs, tracing, or video, consult `references/commands.md` and include both high-level commands and low-level primitives. Do not collapse mouse movement to only `hover`; mention coordinate primitives such as `mousemove <x> <y>` when relevant.

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

### Move the mouse

Use the right level of control. For ordinary element hover behavior, prefer `hover` with a fresh snapshot ref. For exact page coordinates, canvas/map interactions, custom gesture debugging, or when the user explicitly asks to move the mouse to coordinates, use the low-level mouse primitives.

```bash
playwright-cli snapshot
playwright-cli hover e4                  # element-level mouse move / hover
playwright-cli mousemove 150 300         # coordinate-level move inside the page viewport
playwright-cli mousedown                 # hold left mouse button
playwright-cli mousemove 450 300
playwright-cli mouseup                   # release left mouse button
playwright-cli mousewheel 0 600          # scroll down
playwright-cli mousewheel 0 -600         # scroll up
playwright-cli snapshot
```

When explaining mouse support, mention both `hover <target>` and `mousemove <x> <y>`; they solve different tasks.

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

- `references/commands.md` — complete CLI help coverage, command cheat sheet, and examples.
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

If the workspace or browser binary is missing, use:

```bash
playwright-cli install
playwright-cli install-browser CloakBrowser
playwright-cli install-browser chrome
```
