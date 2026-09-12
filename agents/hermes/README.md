# Hermes QA Agent

Hermes is the QA investigation and controlled repair layer for this project.
Playwright remains the deterministic test runner and source of execution
evidence.

Hermes may apply a small automation repair only when the test output, source,
artifacts, and current UI provide strong evidence of an `AUTOMATION ISSUE`.
It must rerun the failed test, then the related suite, and show the exact diff.
It cannot commit, push, merge, or create a pull request.
It must never read or reveal credential values; credential evidence is reported
only as present, missing, valid, invalid, or expired.

The repository-level `.hermes.md` loads the full rules in
`qa-agent-instructions.md` when Hermes starts in this project.

## Playwright MCP

Hermes connects directly to Microsoft's `@playwright/mcp@latest` through its
supported `~/.hermes/config.yaml` configuration. The existing restricted
allowlist supports navigation, accessibility snapshots, element discovery,
clicking, filling, waiting, console/network inspection, tabs, and closing.
Arbitrary page JavaScript and unrelated browser capabilities remain excluded.

Check the connection with:

```bash
hermes mcp list
hermes mcp test playwright
```

Start Hermes from the project root:

```bash
hermes chat --in .
```

## Controlled repair workflow

```text
Failed Playwright test
  ↓
Read error, stack, source, and artifacts
  ↓
Inspect the current UI with Playwright MCP
  ↓
Classify the failure
  ↓
AUTOMATION ISSUE with strong evidence?
├── No  → Report only
└── Yes → Minimal automation patch
           ↓
         Rerun failed test
           ↓
         Rerun related suite
           ↓
         Show exact diff and stop
```

Only these categories can be reported: `APPLICATION ISSUE`, `AUTOMATION
ISSUE`, `TEST DATA ISSUE`, `ENVIRONMENT ISSUE`, `NETWORK ISSUE`, and `UNKNOWN`.
Only `AUTOMATION ISSUE` permits a repair, with at most two attempts.

This project currently has no Git metadata. Hermes must not initialize Git. It
uses a temporary pre-edit copy plus `git diff --no-index` to display the exact
repair while preserving the target file and all unrelated work.

Generated audit output is stored at `reports/hermes/latest-repair.md` and is
ignored by Git.

## Example request

```text
Run the OrangeHRM smoke tests.

If a test fails:
1. investigate the failure
2. use Playwright MCP to inspect the current UI
3. classify the root cause
4. if it is clearly an automation issue, apply the smallest safe fix
5. rerun the failed test
6. rerun the relevant suite
7. show me the exact diff

Do not commit or push anything.
```

For report-only investigation, state that repair is not authorized:

```text
Run the regression suite. Investigate failures and classify them, but do not
change files.
```
