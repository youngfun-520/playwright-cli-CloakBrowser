# Sessions and state

Use named sessions when a task needs separate browser contexts or parallel flows. Use persistent state only when required.

## Named sessions

```bash
playwright-cli -s=auth open --headed https://app.example.com/login
playwright-cli -s=auth list
playwright-cli -s=auth snapshot
playwright-cli -s=auth close
```

Multiple sessions:

```bash
playwright-cli -s=admin open --headed https://app.example.com/admin
playwright-cli -s=user open --headed https://app.example.com/user
playwright-cli -s=admin snapshot
playwright-cli -s=user snapshot
playwright-cli close-all
```

## Persistent profiles

```bash
playwright-cli open --persistent
playwright-cli open --profile=/path/to/profile
playwright-cli -s=work open --persistent https://example.com
playwright-cli -s=work delete-data
```

Guidance:
- Prefer in-memory sessions for one-off tasks.
- Use `--persistent` when login state or browser state must survive restarts.
- Use `--profile` only when the user requests a specific location or reproducibility requires it.
- Run `delete-data` only when the user wants persistent state removed.

## Attach to existing browsers

```bash
playwright-cli attach --extension=chrome
playwright-cli attach --cdp=chrome
playwright-cli attach --cdp=msedge
playwright-cli attach --cdp=http://localhost:9222
playwright-cli -s=msedge detach
```

`detach` leaves the external browser running. `close` stops sessions opened by the CLI.

## Storage state

```bash
playwright-cli state-save
playwright-cli state-save auth.json
playwright-cli state-load auth.json
```

Use storage state for repeatable authenticated runs. Treat saved state as sensitive.

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

Do not reveal cookie values in user-facing output unless the user explicitly asks and it is safe.

## LocalStorage and SessionStorage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete theme
playwright-cli localstorage-clear

playwright-cli sessionstorage-list
playwright-cli sessionstorage-get step
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```
