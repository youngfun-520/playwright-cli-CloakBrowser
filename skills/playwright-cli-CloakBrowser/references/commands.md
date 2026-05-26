# Command cheat sheet

Use this reference when the top-level workflow is not enough. Prefer refs from `snapshot`; fall back to CSS selectors or Playwright locators when needed.

## Session and browser startup

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
playwright-cli list
playwright-cli close
playwright-cli close-all
playwright-cli kill-all
playwright-cli delete-data
```

Rules:
- Default browser for this fork is CloakBrowser when available.
- Default profile is in-memory. Use `--persistent` or `--profile` only for durable state.
- Run `list` after `open` to verify mode and active session.

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
playwright-cli snapshot --filename=state.yml
playwright-cli snapshot e34
playwright-cli snapshot "#main"
playwright-cli snapshot --depth=4
playwright-cli snapshot --boxes
playwright-cli --raw snapshot > before.yml
```

Use `--depth` to reduce large pages, then snapshot a specific region or element for detail.

## Element interaction

```bash
playwright-cli click e15
playwright-cli dblclick e7
playwright-cli hover e4
playwright-cli fill e5 "user@example.com"
playwright-cli fill e5 "search text" --submit
playwright-cli type "text sent to focused element"
playwright-cli press Enter
playwright-cli press Escape
playwright-cli select e9 "option-value"
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli drag e2 e8
playwright-cli drop e4 --path=./image.png
playwright-cli drop e4 --data="text/plain=hello world"
playwright-cli upload ./document.pdf
playwright-cli resize 1920 1080
```

## Keyboard and mouse primitives

```bash
playwright-cli keydown Shift
playwright-cli keyup Shift
playwright-cli mousemove 150 300
playwright-cli mousedown
playwright-cli mousedown right
playwright-cli mouseup
playwright-cli mouseup right
playwright-cli mousewheel 0 100
```

Use primitives only when element-level actions are insufficient.

## Dialogs

```bash
playwright-cli dialog-accept
playwright-cli dialog-accept "confirmation text"
playwright-cli dialog-dismiss
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

## Save page output

```bash
playwright-cli screenshot
playwright-cli screenshot e5
playwright-cli screenshot --filename=page.png
playwright-cli pdf --filename=page.pdf
```

## Evaluate JavaScript

```bash
playwright-cli eval "document.title"
playwright-cli eval "location.href"
playwright-cli eval "el => el.textContent" e5
playwright-cli eval "el => el.id" e5
playwright-cli eval "el => el.getAttribute('data-testid')" e5
```

For machine-readable data, use `--raw`:

```bash
playwright-cli --raw eval "JSON.stringify([...document.querySelectorAll('a')].map(a => a.href))" > links.json
playwright-cli --raw eval "JSON.stringify(performance.timing)" > timing.json
```

## Raw and JSON output

```bash
playwright-cli --raw eval "document.title"
playwright-cli --raw cookie-get session_id
playwright-cli --json list
```

`--raw` removes page status, generated code, and snapshot sections. Use it for piping and scripts. `--json` wraps CLI output as JSON when supported.
