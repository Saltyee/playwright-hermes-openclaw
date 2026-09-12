# Hermes QA Automation Investigation, Repair, and Pull Request Agent

Hermes is the QA investigation and controlled repair layer for this project.
Playwright remains the deterministic test runner and source of execution
evidence.

Hermes may apply a small automation repair only when the test output, source,
artifacts, and current UI provide strong evidence of an `AUTOMATION ISSUE`.
It must rerun the failed test, then the related suite, and show the exact diff.
After successful verification, it may create a focused commit, push a dedicated
`qa-fix/` branch, and create a Draft Pull Request. It cannot push to the base
branch, force push, approve, or merge a Pull Request.
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

## GitHub MCP

Hermes uses GitHub's official `github/github-mcp-server` through its remote MCP
endpoint. Authentication is kept in Hermes' private environment and is not
stored in this repository. Tool exposure is limited to:

- authenticated-user identity
- repository file reading
- branch listing
- Pull Request listing and reading
- Pull Request creation

Git commits and repair-branch pushes use local Git. Merge, approval, branch
deletion, releases, GitHub Actions, administration, and secret-management tools
are not exposed.

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
         Inspect diff and secrets
           ↓
         Commit and push qa-fix branch
           ↓
         Create Draft Pull Request and stop
```

Only these categories can be reported: `APPLICATION ISSUE`, `AUTOMATION
ISSUE`, `TEST DATA ISSUE`, `ENVIRONMENT ISSUE`, `NETWORK ISSUE`, and `UNKNOWN`.
Only `AUTOMATION ISSUE` permits a repair, with at most two attempts.

## GitHub Repair Workflow

Hermes may investigate, repair, verify, branch, commit, push, and create a Draft
Pull Request only for a confirmed `AUTOMATION ISSUE`. Before editing it checks
Git status and protects unrelated user work. The failed test and related suite
must pass before a commit is allowed. A human must review and merge the Pull
Request.

```text
TEST FAILS
  ↓
HERMES INVESTIGATES WITH PLAYWRIGHT MCP
  ↓
AUTOMATION ISSUE CONFIRMED
  ↓
CHECK GIT STATUS → CREATE qa-fix BRANCH → MINIMAL FIX
  ↓
FAILED TEST PASS → RELATED SUITE PASS
  ↓
CHECK DIFF AND SECRETS → COMMIT → PUSH REPAIR BRANCH
  ↓
CREATE DRAFT PULL REQUEST → STOP → HUMAN REVIEW
```

Generated audit output is stored at `reports/hermes/latest-repair.md` and is
ignored by Git.

## Example request

```text
Run the OrangeHRM smoke suite.

If a test fails:
1. investigate the failure
2. use Playwright MCP to inspect the current UI
3. classify the failure
4. if it is clearly an automation issue, create a dedicated qa-fix branch
5. apply the smallest safe fix
6. rerun the failed test
7. rerun the related suite
8. inspect the final diff
9. commit only the relevant files
10. push the repair branch
11. create a Draft Pull Request

Do not merge the Pull Request.
Do not push directly to the base branch.
```

For report-only investigation, state that repair is not authorized:

```text
Run the regression suite. Investigate failures and classify them, but do not
change files.
```
