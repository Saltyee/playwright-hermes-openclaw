# OpenCode local development

OpenCode is the developer-facing coding assistant for this repository. It uses a local Ollama model and may use Playwright MCP to inspect the browser. It is separate from the Perrona, OpenClaw, and Hermes QA runtime.

## Responsibilities

```text
DEVELOPMENT

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

```text
QA RUNTIME

Telegram
  ↓
Perrona / OpenClaw
  ↓ A2A
Hermes
  ├── Playwright Test
  ├── Playwright MCP
  └── GitHub
```

OpenCode does not sit between Perrona and Hermes. Playwright MCP supports interactive investigation; the npm scripts remain the source of deterministic test results.

## Project configuration

`opencode.jsonc` uses native Ollama model discovery at `http://127.0.0.1:11434/v1` and starts Microsoft's Playwright MCP package as an isolated local stdio server. No API key or model is hardcoded.

OpenCode V2 automatically loads the repository-root `AGENTS.md` as its persistent project instructions. Although the V2 schema accepts an `instructions` array, current OpenCode V2 does not resolve those entries, so this project uses the supported `AGENTS.md` mechanism.

## Run locally

Start Ollama if it is not already running:

```bash
ollama serve
```

From the repository root, start OpenCode:

```bash
opencode
```

Use `/models` to select an installed Ollama model. Then try this safe MCP request:

```text
Use Playwright MCP to open the OrangeHRM login page. Inspect the Username field,
Password field, and Login button. Do not modify project source code.
```

Check MCP connectivity from another terminal with:

```bash
opencode mcp list
```

Run the deterministic smoke test independently:

```bash
npm run test:smoke
```

As an optional convenience, Ollama can prepare OpenCode configuration without launching it:

```bash
ollama launch opencode --config
```

Keep the checked-in `opencode.jsonc` as the reviewable project configuration.
