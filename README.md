# Web Automation Agent

This project is a JavaScript Playwright web automation framework.

OrangeHRM Demo is currently used as the sample application while the framework is being developed. The current tests cover valid and invalid authentication only.

The framework includes Playwright MCP for browser exploration, Hermes as the QA
execution and controlled-repair agent, and OpenClaw as the local QA
orchestrator. OpenCode and Ollama provide a separate local development assistant.

## Architecture

Normal test execution remains deterministic:

```text
Playwright Test
  ↓
Actions
  ↓
Page Objects
  ↓
Browser
  ↓
Reports
```

AI browser exploration is separate:

```text
Hermes
  ↓
Playwright MCP
  ↓
Browser
```

Playwright MCP helps an AI agent inspect pages and discover locators. The automated tests do not depend on MCP when they run.

QA orchestration uses A2A v1.0:

```text
User
  ↓
OpenClaw
  ↓ A2A
Hermes
  ├── Playwright Test
  ├── Playwright MCP
  └── GitHub Draft Pull Requests
  ↓
OrangeHRM / Test Result / Repair / Draft PR
```

Local AI-assisted development is separate from the QA runtime:

```text
Developer
  ↓
OpenCode
  ↓
Ollama
  ├── Repository
  ├── Terminal
  └── Playwright MCP
        ↓
      Browser
```

## Folder structure

```text
web-automation-agent/
├── tests/authentication/  # Authentication test scenarios
├── pages/                 # Page elements and page interactions
├── actions/               # Reusable user and business actions
├── suites/                # Smoke, critical, and regression grouping notes
├── test-data/             # Reusable testing data
├── helpers/               # Shared utility functions
├── config/                # Framework configuration
├── reports/               # Playwright and Allure results
├── agents/hermes/         # Hermes QA instructions and operating guide
├── agents/openclaw/       # OpenClaw A2A orchestration instructions
├── mcp/                   # AI browser integration using Playwright MCP
├── .codex/config.toml     # Project-scoped MCP configuration for Codex
├── .hermes.md             # Project instructions automatically read by Hermes
├── docs/opencode-development.md
├── AGENTS.md              # OpenCode V2 project instructions
├── opencode.jsonc         # OpenCode, Ollama, and Playwright MCP configuration
├── playwright.config.js
└── package.json
```

Tests are grouped with Playwright tags. Test implementations are not copied into the `suites` folders.

## Installation

Install Node.js 20 or newer, then run:

```bash
npm install
npx playwright install
```

## Environment setup

Copy `.env.example` to `.env` and set the current OrangeHRM Demo credentials:

```dotenv
BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_USERNAME=your_demo_username
ORANGEHRM_PASSWORD=your_demo_password
```

The login page displays the current demo credentials. Keep working credentials only in `.env`; this file is ignored by Git.

## Run tests

Run all authentication tests:

```bash
npm test
```

Run with a visible browser:

```bash
npm run test:headed
```

Start Playwright Inspector for debugging:

```bash
npm run test:debug
```

Run the valid-login smoke coverage:

```bash
npm run test:smoke
```

Run the valid-login critical coverage:

```bash
npm run test:critical
```

Run all positive and negative regression coverage:

```bash
npm run test:regression
```

## Test reports

Each test run creates Playwright HTML and JSON reports plus Allure result data. Reporting is configured centrally in `playwright.config.js`; individual tests do not contain screenshot, video, trace, or report-generation code.

Generated output is organized as:

```text
reports/
├── playwright/
│   ├── html/         # Playwright HTML report
│   └── results.json  # Machine-readable Playwright result
├── test-results/     # Screenshots, videos, and traces
├── allure-results/   # Raw Allure result data
└── allure-report/    # Generated Allure HTML report
```

All generated report folders are ignored by Git.

### Playwright HTML Report

The Playwright HTML report is built into Playwright. It is fast to open locally and useful for checking passed and failed tests, duration, test files, errors, and failure attachments.

Open the latest report:

```bash
npm run report
```

Read the latest report as structured JSON without opening or sending the HTML
artifact:

```bash
npm run report:summary
npm run report:details
npm run report:failures
```

Hermes uses these reader commands when Perrona receives a natural-language
report request. Perrona summarizes the structured result as text; she does not
send `index.html` by default.

### Allure Report

The Allure report provides a richer suite overview and presentation. It is useful when reviewing suite coverage or presenting the project as a portfolio or demo.

Generate the saved Allure HTML report from the latest results:

```bash
npm run allure:generate
```

Open the generated report:

```bash
npm run allure:open
```

Generate and serve a temporary report directly from the results:

```bash
npm run allure:serve
```

### Failure evidence

Successful tests keep unnecessary artifacts to a minimum. When a test fails, Playwright retains a screenshot and video. If the test retries, the first retry also records a trace.

Open a trace with:

```bash
npx playwright show-trace reports/test-results/<test-result-folder>/trace.zip
```

Trace Viewer shows the test actions, page snapshots, console information, network activity, timing, and DOM state around the failure.

Use this practical debugging flow:

```text
Test fails
  ↓
Read test error
  ↓
Check screenshot
  ↓
Check video
  ↓
Open trace
  ↓
Inspect report
  ↓
Fix automation or application issue
  ↓
Rerun test
```

## Playwright MCP

Playwright is used for repeatable automated tests and assertions:

```text
Code → Playwright → Browser
```

Playwright MCP provides interactive browser access for an AI agent:

```text
AI Agent → Playwright MCP → Browser
```

The project-scoped configuration uses Microsoft's official `@playwright/mcp@latest` server with a fresh isolated browser session. Trust the project and restart Codex after configuration changes, then check the connection with:

```bash
codex mcp list
```

Example exploration requests:

```text
Open the OrangeHRM login page and inspect the login form.

Identify the username field, password field, and Login button.

Find stable Playwright locators for the OrangeHRM login form.

Login to OrangeHRM and identify a stable element that proves the Dashboard has opened.

Try invalid credentials and identify the login error message.
```

These are interactive exploration requests, not replacements for deterministic tests. See `mcp/playwright/README.md` for more details.

## Hermes Controlled Repair

Hermes is an AI-assisted QA investigation and controlled repair layer.
Playwright runs the actual automated tests and remains the source of execution
evidence. Hermes can inspect the test/action/page-object chain, artifacts, and
current OrangeHRM UI. When strong evidence proves an automation issue, Hermes
may apply one small relevant repair.

Regular automation remains:

```text
Playwright
  ↓
OrangeHRM
  ↓
Report
```

Failure investigation is:

```text
Playwright Failure
  ↓
Hermes
  ↓
Read Test / Action / Page Object / Evidence
  ↓
Playwright MCP
  ↓
Inspect OrangeHRM
  ↓
Root Cause Analysis
  ↓
Suggested Fix
```

Controlled repair is:

```text
Test Failure
  ↓
Hermes Investigation
  ↓
Playwright MCP Inspection
  ↓
Root Cause
  ↓
AUTOMATION ISSUE
  ↓
Minimal Code Repair
  ↓
Rerun Failed Test
  ↓
Rerun Related Suite
  ↓
Show Exact Diff
```

Hermes never repairs application, test-data, environment, network, or unknown
issues. It preserves unrelated work, keeps meaningful assertions, avoids
arbitrary sleeps, and stops after two repair attempts.

Start it from the project root with `hermes chat --in .`. The complete
evidence requirements, allowed files, validation order, audit format, and
example request are in `agents/hermes/README.md`.

## Automated Repair Pull Requests

Hermes can investigate certain Playwright failures and prepare a verified
repair. If the failure is clearly an automation issue, Hermes may create a
dedicated `qa-fix/` branch, update the automation, verify the failed test and
related suite, commit only the relevant change, push the repair branch, and
open a Draft Pull Request.

A human must review and merge the Pull Request. Hermes must not push directly
to the base branch, force push, approve or merge the Pull Request, delete the
branch, or include unrelated files.

```text
Playwright Failure
  ↓
Hermes
  ↓
Playwright MCP
  ↓
Root Cause
  ↓
Automation Repair
  ↓
Test Verification
  ↓
Git Branch
  ↓
Commit
  ↓
Draft Pull Request
  ↓
Human Review
```

The official GitHub MCP server is configured outside the repository. Its
allowlist contains only repository/branch reads and Pull Request
listing/reading/creation. Credentials remain in private environment storage;
they are never committed.

## OpenClaw QA Orchestration

OpenClaw acts as the control plane for this QA project. The user sends a simple
QA request to OpenClaw, which delegates the work once to Hermes through A2A
v1.0. Hermes performs test execution, Playwright MCP investigation, controlled
repair, and the GitHub Draft Pull Request workflow. Hermes returns the result,
and OpenClaw gives the user a concise summary.

OpenClaw does not have duplicate Playwright MCP or GitHub MCP integrations. Its
tool policy allows only reading its workspace instructions and executing the
single allowlisted native A2A task client. It cannot edit automation or execute
the QA/Git workflow itself.

The initial connection is local:

```text
OpenClaw peer: hermes
  ↓
http://127.0.0.1:9900/
  ↓
Hermes QA Agent
```

The A2A task lifecycle distinguishes working, completed, failed, and rejected
tasks so a long-running suite is followed instead of submitted twice. Test
failures are reported separately from orchestration failures.

See `agents/openclaw/README.md` for usage and
`agents/openclaw/qa-orchestrator-instructions.md` for the operating rules.

## Local AI Development

OpenCode is the coding agent, Ollama is the local model runtime, and Playwright
MCP gives OpenCode interactive browser access. Playwright Test remains the
deterministic automation runner. This development setup does not replace or sit
inside the Perrona, OpenClaw, and Hermes runtime.

Start the local tools from the project root:

```bash
ollama serve
opencode
```

Inside OpenCode, a safe first request is:

```text
Use Playwright MCP to inspect the OrangeHRM login page.
```

Run the normal smoke test separately:

```bash
npm run test:smoke
```

OpenCode V2 loads the repository `AGENTS.md` automatically. The project config
uses Ollama model discovery, so choose an installed model with `/models` rather
than committing a machine-specific model choice. Setup and verification details
are in `docs/opencode-development.md`. The existing `.codex/config.toml` remains
available while both development assistants are evaluated side by side.

## Test suites

- Smoke: the smallest valid-login check.
- Critical: authentication that must work for the application to be usable.
- Regression: valid and invalid authentication coverage.

Playwright tags control these groups through the npm scripts.

## Future roadmap

- Add more tests when new application areas enter scope.
- Add GitHub Actions for automated test runs.
- Expand reporting history when continuous test execution is introduced.
- Continue using Playwright MCP for UI investigation and locator discovery.
- Review and refine controlled Hermes repair Pull Requests before merge.
- Add an approved local user interface or messaging channel in a later phase.
- Add scheduling and notifications only after manual orchestration is stable.

The current agent flow is:

```text
OpenClaw
  ↓ A2A
Hermes
  ├── Playwright Test
  ├── Playwright MCP
  └── GitHub Draft Pull Requests
```
