# Playwright MCP

Playwright MCP allows an AI agent to inspect and interact with a browser through Playwright. It is an additional browser exploration tool and does not replace the project's deterministic Playwright Test suite.

This project uses Microsoft's official `@playwright/mcp` server. The project-scoped Codex configuration is in `.codex/config.toml`. It starts an isolated Chromium-based browser session without saved authentication or browser profile data.

## Intended uses

- Exploring pages
- Finding elements by role, accessible name, label, or text
- Understanding the current UI state through accessibility snapshots
- Debugging failed tests
- Discovering better Playwright locators
- Investigating UI changes
- Assisting Hermes with current UI and failure investigation

Hermes connects directly to the same official package through its supported
`~/.hermes/config.yaml` MCP configuration. Its project instructions and
restricted browser tool list are documented in `agents/hermes/README.md`.

## Enable it in Codex

Trust this project and restart the Codex CLI or IDE extension after configuration changes. Check the configured server from the project directory:

```bash
codex mcp list
```

In an interactive Codex session, `/mcp` also shows active MCP servers.

## Example prompts

```text
Open the OrangeHRM login page and inspect the login form.

Identify the username field, password field, and Login button.

Find stable Playwright locators for the OrangeHRM login form.

Login to OrangeHRM and identify a stable element that proves the Dashboard has opened.

Try invalid credentials and identify the login error message.
```

These prompts are for MCP exploration and locator discovery only. The automated authentication tests continue to run through Playwright Test without MCP.
