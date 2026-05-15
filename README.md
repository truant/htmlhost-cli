# HTMLHost CLI

Publish local HTML files to HTMLHost.ai and get a shareable URL instantly.

HTMLHost is designed for agent workflows: when an AI agent creates an HTML report, dashboard, prototype, or visual artifact, the CLI gives it a simple way to publish that file and return a link.

## Install

```bash
npm install -g @htmlhost/cli
```

Or run without installing globally:

```bash
npx @htmlhost/cli deploy report.html
```

## Usage

Create an API key at [htmlhost.ai](https://htmlhost.ai/), then save it locally:

```bash
htmlhost login
```

Deploy an HTML file:

```bash
htmlhost deploy report.html
```

The CLI stores your API key at `~/.config/htmlhost/config.json` with user-only file permissions. You can also use environment variables:

```bash
export HTMLHOST_API_KEY=hh_...
export HTMLHOST_API_URL=https://htmlhost.ai/api/deploy
```

## Agent Workflow

```text
1. Agent creates report.html
2. Agent runs htmlhost deploy report.html
3. Agent returns the public URL
```

This works well with Codex, Claude Code, Cursor, and other shell-capable agents.

## Development

```bash
npm install
npm run check
npm run build
npm pack --dry-run
```

## License

MIT
