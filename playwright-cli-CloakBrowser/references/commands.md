# Command cheat sheet

Use this reference when the top-level workflow is not enough. It mirrors the CLI help categories so the skill does not lose available commands. Prefer refs from `snapshot`; fall back to CSS selectors or Playwright locators when needed.

## Usage and global options

```bash
playwright-cli <command> [args] [options]
playwright-cli -s=<session> <command> [args] [options]
playwright-cli --help
playwright-cli --help open
playwright-cli --json list
playwright-cli --raw eval "document.title"
playwright-cli --version
```

Guidance:
- Use `-s=<session>` for named sessions or parallel browser contexts.
- Use `--json` when structured output is useful for scripts or validation.
- Use `--raw` when you need only the command result without status/code wrappers.

## Core browser lifecycle

```bash
playwright-cli open
playwright-cli open https://example.com
playwright-cli open --headed https://example.com
playwright-cli open --browser=CloakBrowser
playwright-cli open --browser=chrome
playwright-cli open --browser=firefox
playwright-cli open --browser=webkit
playwright-cli open --browser=msedge
playwright-cli open --persistent
playwright-cli open --profile=/path/to/profile
playwright-cli open --config=my-config.json
playwright-cli attach name
playwright-cli attach --extension=chrome
playwright-cli attach --cdp=chrome
playwright-cli attach --cdp=msedge
playwright-cli attach --cdp=http://localhost:9222
playwright-cli list
playwright-cli close
playwright-cli detach
playwright-cli close-all
playwright-cli kill-all
playwright-cli delete-data
```

Rules:
- Default browser for this fork is CloakBrowser when available.
- Default profile is in-memory. Use `--persistent` or `--profile` only for durable state.
- Run `list` after `open` to verify mode and active session.
- Use `detach` when attached to an external browser and you want to leave that browser running.
- Use `kill-all` only for stale or zombie browser processes.

## Navigation

```bash
playwright-cli goto https://example.com
playwright-cli go-back
playwright-cli go-forward
playwright-cli reload
```

## Snapshots

```bash
playwright-cli snapshot
playwright-cli snapshot e34
playwright-cli snapshot "#main"
playwright-cli snapshot --filename=state.yml
playwright-cli snapshot --depth=4
playwright-cli snapshot --boxes
playwright-cli --raw snapshot > before.yml
```

Use `snapshot` before element interactions to obtain refs such as `e1`, `e2`, and `e3`. Use `--depth` to reduce large pages, then snapshot a specific region or element for detail.

## Element interaction

```bash
playwright-cli click e15
playwright-cli click e15 right
playwright-cli dblclick e7
playwright-cli dblclick e7 right
playwright-cli hover e4
playwright-cli fill e5 "user@example.com"
playwright-cli fill e5 "search text" --submit
playwright-cli type "text sent to focused element"
playwright-cli select e9 "option-value"
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli drag e2 e8
playwright-cli drop e4 --path=./image.png
playwright-cli drop e4 --data="text/plain=hello world"
playwright-cli upload ./document.pdf
playwright-cli upload ./a.png ./b.png
playwright-cli resize 1920 1080
```

Guidance:
- Prefer element refs from a fresh snapshot.
- Use `type` when text should go to the currently focused editable element.
- Use `fill` for controlled form inputs.
- Use `upload` after targeting a file input or file chooser flow when supported by the page.
- Use `drop` for drag-and-drop file/data zones.

## Keyboard

```bash
playwright-cli press Enter
playwright-cli press Escape
playwright-cli press Tab
playwright-cli press ArrowLeft
playwright-cli keydown Shift
playwright-cli keyup Shift
```

Use keyboard primitives only when element-level actions are insufficient or when testing keyboard accessibility.

## Mouse

Mouse support has two layers:

- **Element-level movement:** use `hover <target>` when the goal is to move over a DOM element from `snapshot`.
- **Coordinate-level movement:** use `mousemove <x> <y>` when the user asks for a pixel/viewport coordinate, when testing canvas/maps, or when debugging a custom pointer gesture. Coordinates are page viewport coordinates, not the operating-system pointer outside the browser.

```bash
playwright-cli hover e4
playwright-cli mousemove 150 300
playwright-cli mousedown
playwright-cli mousedown right
playwright-cli mouseup
playwright-cli mouseup right
playwright-cli mousewheel 0 100
playwright-cli mousewheel 0 -100
```

Gesture examples:

```bash
# Move the browser mouse to an exact viewport coordinate.
playwright-cli mousemove 150 300

# Manual drag gesture when `drag <startTarget> <endTarget>` is too high-level.
playwright-cli mousemove 150 300
playwright-cli mousedown
playwright-cli mousemove 450 300
playwright-cli mouseup

# Scroll with the wheel. Positive dy usually scrolls down; negative dy scrolls up.
playwright-cli mousewheel 0 600
playwright-cli mousewheel 0 -600
```

Use mouse primitives for canvas, maps, custom drag gestures, coordinate-sensitive testing, and low-level interaction debugging. When asked "how would you move the mouse?", answer with both `hover <target>` and `mousemove <x> <y>` rather than only one of them.

## Dialogs

```bash
playwright-cli dialog-accept
playwright-cli dialog-accept "confirmation text"
playwright-cli dialog-dismiss
```

Prepare dialog handling before or immediately after actions that trigger alert, confirm, or prompt dialogs.

## Save page output

```bash
playwright-cli screenshot
playwright-cli screenshot e5
playwright-cli screenshot --filename=page.png
playwright-cli pdf
playwright-cli pdf --filename=page.pdf
```

## Tabs

```bash
playwright-cli tab-list
playwright-cli tab-new
playwright-cli tab-new https://example.com/page
playwright-cli tab-select 0
playwright-cli tab-close
playwright-cli tab-close 2
```

## Storage state

```bash
playwright-cli state-save
playwright-cli state-save auth.json
playwright-cli state-load auth.json
```

Treat saved state files as sensitive because they may contain authentication data.

## Cookies

```bash
playwright-cli cookie-list
playwright-cli cookie-list --domain=example.com
playwright-cli cookie-get session_id
playwright-cli cookie-set session_id abc123
playwright-cli cookie-set session_id abc123 --domain=example.com --httpOnly --secure
playwright-cli cookie-delete session_id
playwright-cli cookie-clear
```

Do not print cookie values in user-facing output unless the user explicitly asks and it is safe.

## LocalStorage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete theme
playwright-cli localstorage-clear
```

## SessionStorage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get step
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

## Network inspection

```bash
playwright-cli requests
playwright-cli request 5
playwright-cli request-headers 5
playwright-cli request-body 5
playwright-cli response-headers 5
playwright-cli response-body 5
```

Guidance:
- Use `requests` to get numbered network entries.
- Use `request <index>` for full details.
- Use the headers/body split commands when you need a narrower, safer output.
- Redact authorization headers, cookies, tokens, and personal data in final answers.
- Binary response bodies may be saved to a file by the CLI; report the path when relevant.

## Network mocking and state

```bash
playwright-cli route "**/*.jpg" --status=404
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli route-list
playwright-cli unroute "**/*.jpg"
playwright-cli unroute
playwright-cli network-state-set offline
playwright-cli network-state-set online
```

Use route mocking and network state changes to simulate API responses, block resources, test offline behavior, and make browser tests deterministic.

## DevTools, console, and custom code

```bash
playwright-cli console
playwright-cli console warning
playwright-cli console error
playwright-cli run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli run-code --filename=script.js
```

Use `run-code` when a multi-step Playwright API call is clearer or safer than many one-off CLI commands.

## Tracing and video

```bash
playwright-cli tracing-start
playwright-cli tracing-stop
playwright-cli video-start
playwright-cli video-start video.webm
playwright-cli video-chapter "Login"
playwright-cli video-stop
```

Use tracing for debugging flaky or complex flows. Use video when the user asks for a visual record or reproduction.

## Dashboard, annotation, and test stepping

```bash
playwright-cli show
playwright-cli show --annotate
playwright-cli pause-at "tests/example.spec.ts:42"
playwright-cli resume
playwright-cli step-over
playwright-cli generate-locator e5
playwright-cli generate-locator e5 --raw
playwright-cli highlight e5
playwright-cli highlight e5 --hide
playwright-cli highlight --hide
```

Guidance:
- Use `show --annotate` for UI review or when the user wants to point to a page region visually.
- Use `pause-at`, `resume`, and `step-over` for Playwright test debugging sessions that support dashboard/test execution control.
- Use `generate-locator` to get candidate Playwright locators, then prefer readable accessible locators in tests.
- Use `highlight` only in headed/visible contexts where visual confirmation helps.

## Installation commands

```bash
playwright-cli install
playwright-cli install-browser
playwright-cli install-browser chrome
playwright-cli install-browser firefox
playwright-cli install-browser webkit
playwright-cli install-browser msedge
playwright-cli install-browser CloakBrowser
```

Use `install` to initialize a workspace when required. Use `install-browser [browser]` when the selected browser binary is missing.
