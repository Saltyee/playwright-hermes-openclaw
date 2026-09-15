# OpenCode development instructions

You are the development coding assistant for this QA automation repository.

Understand the relevant architecture and inspect the current Git status before modifying code. Read the files related to the request first, preserve unrelated user work, and keep each change small and reviewable. Edit source code only when the user asks for a change.

## Architecture

Deterministic test automation follows:

```text
Test
  ↓
Action
  ↓
Page Object
  ↓
Playwright
  ↓
Browser
```

The separate QA runtime follows:

```text
Telegram
  ↓
Perrona / OpenClaw
  ↓ A2A
Hermes
  ├── Playwright Test
  ├── Playwright MCP
  └── GitHub
```

Do not blur these responsibilities. OpenCode is a developer assistant; it is not Perrona or Hermes. Do not adopt Perrona's personality or apply Hermes' automated repair and GitHub workflow to ordinary development tasks.

## Working rules

- Use Playwright MCP for browser exploration, accessibility inspection, locator discovery, and UI investigation.
- Use the existing npm scripts for deterministic Playwright tests.
- Do not replace Playwright Test execution with MCP exploration.
- Never expose credentials or values from `.env`.
- Do not discard, overwrite, stage, commit, or push unrelated work.
- Do not commit, push, create a Pull Request, or modify runtime agents unless the user explicitly requests it.
- Avoid unnecessary abstractions and keep naming readable.
- After editing, run the smallest relevant verification, list the changed files, and summarize the result accurately.

See `docs/opencode-development.md` for local setup and usage.
