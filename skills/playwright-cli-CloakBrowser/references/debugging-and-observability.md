# Debugging and observability

Use this reference for diagnosing web apps, mocking network behavior, collecting traces/videos, or running custom Playwright code.

## Console and network inspection

```bash
playwright-cli console
playwright-cli console warning
playwright-cli console error
playwright-cli requests
playwright-cli request 5
playwright-cli request-headers 5
playwright-cli request-body 5
playwright-cli response-headers 5
playwright-cli response-body 5
```

Workflow:

```bash
playwright-cli open --headed https://example.com
playwright-cli list
playwright-cli snapshot
playwright-cli click e4
playwright-cli console
playwright-cli requests
playwright-cli snapshot
playwright-cli close
```

Report user-relevant failures, URLs, statuses, and error messages. Avoid dumping sensitive headers, tokens, or cookies.

## Request mocking and blocking

```bash
playwright-cli route "**/*.jpg" --status=404
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli route-list
playwright-cli unroute "**/*.jpg"
playwright-cli unroute
playwright-cli network-state-set offline
playwright-cli network-state-set online
```

Use route mocking when the user asks to simulate API responses, block resources, test error states, or make tests deterministic. Verify mocks with `requests`, page behavior, or assertions.

## Running Playwright code

```bash
playwright-cli run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli run-code --filename=script.js
```

Use `run-code` when a task needs multi-step Playwright APIs that are awkward through one CLI command. Keep scripts small, task-specific, and safe.

## Tracing

```bash
playwright-cli tracing-start
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli tracing-stop
```

Use tracing for flaky flows, performance investigation, test debugging, or when a user asks for evidence of what happened.

## Video recording

```bash
playwright-cli video-start video.webm
playwright-cli video-chapter "Login" --description="Open login page and submit credentials" --duration=2000
playwright-cli video-stop
```

Use video when the user asks to demonstrate a workflow, capture a reproduction, or share a visual record.

## UI annotation dashboard

```bash
playwright-cli show --annotate
```

Use this in headed sessions for UI review, design feedback, or when the user needs to point to a region visually. Incorporate the returned notes and annotation in the next step.


## Dashboard and test stepping

```bash
playwright-cli show
playwright-cli show --annotate
playwright-cli pause-at "tests/example.spec.ts:42"
playwright-cli resume
playwright-cli step-over
```

Use `show` to inspect live automation state. Use `pause-at`, `resume`, and `step-over` only when debugging a supported Playwright test execution flow.
