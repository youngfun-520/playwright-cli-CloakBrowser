# Testing workflows

Use this reference when the user asks to test a web app, debug Playwright tests, generate tests, or turn a manual browser flow into repeatable tests.

## Running and debugging Playwright tests

General approach:

1. Inspect the test command in the project (`package.json`, README, existing scripts).
2. Run the narrowest relevant test first.
3. Use headed mode or tracing when visual diagnosis is helpful.
4. Reproduce failure with `playwright-cli` if the issue is interaction-specific.
5. Fix selectors or waits based on observable page state.
6. Re-run the narrow test, then a broader suite if needed.

Useful commands may include project-specific `npm test`, `npx playwright test`, or generated scripts. Use `playwright-cli` for interactive reproduction and inspection.

## Generate a test from manual exploration

```bash
playwright-cli open --headed https://example.com
playwright-cli list
playwright-cli snapshot
playwright-cli click e3
playwright-cli fill e5 "search term" --submit
playwright-cli snapshot
playwright-cli generate-locator e5 --raw
```

Then write a Playwright test that:
- uses readable locators (`getByRole`, `getByLabel`, `getByTestId`) where possible;
- asserts observable outcomes, not just that commands ran;
- avoids hard waits unless there is no better signal;
- keeps credentials and secrets outside the test file.

## Spec-driven testing

For user-provided specs:

1. Convert the spec into concrete browser behaviors and assertions.
2. Identify required test data, accounts, and environment assumptions.
3. Explore the live app with `snapshot` and stable locators.
4. Generate the tests.
5. Run them.
6. Heal selectors only after confirming the intended UI behavior.

## Test healing

When tests fail:

- Read the failure message and stack trace.
- Inspect current page with `snapshot` or headed mode.
- Check console and network if the page did not reach the expected state.
- Prefer updating locators to stable accessible selectors rather than brittle CSS paths.
- Add assertions for the state that matters to the user.
