# OpenClaw QA Orchestrator

OpenClaw is the local control plane for this QA project. It accepts a simple
QA request, delegates the work once to the Hermes QA Agent over A2A v1.0, and
summarizes Hermes' result for the user.

```text
User
  ↓
OpenClaw
  ↓ A2A v1.0
Hermes QA Agent
  ├── Playwright Test
  ├── Playwright MCP
  └── GitHub Draft Pull Requests
  ↓
OpenClaw summary
  ↓
User
```

## Responsibilities

OpenClaw owns request interpretation, one bounded delegation, task-status
handling, and the final human-readable summary. Hermes owns test execution,
browser investigation, failure classification, controlled repair, Git, and
Draft Pull Request creation.

OpenClaw does not duplicate Hermes' Playwright MCP or GitHub MCP configuration.
It must not edit tests, Page Objects, or actions; run Playwright directly;
inspect the browser; create commits; or create Pull Requests.

## Local A2A connection

- Peer name: `hermes`
- Hermes Agent Card: `http://127.0.0.1:9900/.well-known/agent-card.json`
- Hermes JSON-RPC endpoint: `http://127.0.0.1:9900/`
- Protocol: A2A v1.0 over JSON-RPC
- Exposure: localhost only

OpenClaw's gateway token and A2A peer-token setting use private environment
variables outside this repository. Hermes currently advertises no A2A token
requirement and remains protected by its localhost-only binding. No credential
value is stored in these project files.

## Run a request

Use a unique session key for each human request:

```bash
openclaw agent --agent main --channel a2a \
  --session-key agent:main:qa-<unique-name> \
  --message "Run OrangeHRM smoke tests." \
  --json --timeout 900
```

The user message stays human-readable. OpenClaw translates it into one bounded
Hermes task.

## Example requests

```text
Run OrangeHRM smoke tests.
Run OrangeHRM critical tests.
Run OrangeHRM regression tests.
Run the OrangeHRM valid login test.
Run smoke and investigate failures.
Run regression and repair automation issues if safe.
Run smoke, repair automation issues, and prepare a Draft PR if needed.
Show the latest report.
Show report details.
Show failed tests.
```

OpenClaw translates these requests into one A2A task for Hermes. If Hermes
returns a working task, OpenClaw follows that task until it reaches a terminal
state; it does not submit the request again.

The installed OpenClaw outbound channel has a 30-second client timeout, while
the installed Hermes endpoint holds `SendMessage` open until the agent finishes.
The allowlisted `hermes-a2a-task.js` client therefore sends one native A2A v1.0
task with a longer bounded wait. It can also follow an existing task ID with
native `GetTask`. It is not a custom server, REST bridge, or message broker.

## Result handling

OpenClaw distinguishes a Playwright test failure from an A2A orchestration
error. A test failure means Hermes ran Playwright and reported a failed test.
An orchestration error means Hermes could not be reached or the A2A task could
not complete; OpenClaw must not describe that as a test failure.

Detailed evidence remains in Playwright/Allure reports, screenshots, videos,
traces, Hermes findings, Git diffs, and Draft Pull Requests. OpenClaw provides
only the concise operational summary.

For latest-report requests, Perrona delegates report reading to Hermes. Hermes
uses the machine-readable `reports/playwright/results.json` through the project
report reader and returns structured facts. Perrona presents those facts as a
short text summary. Requests such as `lihat report` do not send
`index.html`; an explicit request to deliver the report artifact is a separate
intent.

Messaging channels and scheduling are intentionally not configured in this
phase.
