# Element targeting

## Preferred order

1. Use refs from a fresh `snapshot` (`e1`, `e2`, ...).
2. Use accessible Playwright locators when stable behavior matters.
3. Use CSS selectors for precise technical targeting.
4. Use JavaScript evaluation for hidden attributes or bulk extraction.

## Refs from snapshot

```bash
playwright-cli snapshot
playwright-cli click e15
playwright-cli fill e3 "hello"
```

Refs are generated from the current page state. If the page changes, take a new snapshot before reusing refs.

## CSS selectors and locators

```bash
playwright-cli click "#main > button.submit"
playwright-cli click "getByRole('button', { name: 'Submit' })"
playwright-cli click "getByTestId('submit-button')"
playwright-cli snapshot "#main"
```

Use role locators for user-facing behavior and CSS for implementation details.

## Inspect hidden attributes

```bash
playwright-cli eval "el => el.id" e5
playwright-cli eval "el => el.className" e5
playwright-cli eval "el => el.getAttribute('aria-label')" e5
playwright-cli eval "el => el.getAttribute('data-testid')" e5
playwright-cli eval "el => Object.fromEntries([...el.attributes].map(a => [a.name, a.value]))" e5
```

## Highlights and locator generation

```bash
playwright-cli highlight e5
playwright-cli highlight e5 --style="outline: 3px dashed red"
playwright-cli highlight e5 --hide
playwright-cli highlight --hide
playwright-cli generate-locator e5 --raw
```

Use highlights for visual confirmation in headed sessions. Use generated locators as candidates, then prefer readable locators in final tests.

## Coordinates versus elements

Use element refs for normal web UI and coordinate primitives for surfaces that do not expose stable DOM targets.

```bash
playwright-cli snapshot
playwright-cli hover e5              # DOM element hover
playwright-cli mousemove 240 360     # exact viewport coordinate
playwright-cli mousedown
playwright-cli mousemove 500 360
playwright-cli mouseup
```

Choose `mousemove <x> <y>` for canvas, map widgets, drawing tools, custom sliders, gesture debugging, or when the user gives coordinates. Choose `hover <target>` when the user names a visible page element and a snapshot ref is available.
