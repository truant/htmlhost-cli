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

Deploy to a custom subdomain you have already created:

```bash
htmlhost deploy report.html --site customer-preview
```

Group related pages into a project folder. Unknown project names are created automatically, and every project gets a shareable index URL like `https://yourname.htmlhost.ai/proj/sprint-review/`:

```bash
htmlhost deploy report.html --project sprint-review
```

List the pages you have published, with their projects and view counts:

```bash
htmlhost list
```

Update an existing page without changing its public URL:

```bash
htmlhost update https://yourname.htmlhost.ai/p/abc123/report.html report.html
```

You can also pass the page ID from the URL:

```bash
htmlhost update abc123 report.html
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
4. For revisions, agent runs htmlhost update <url> report.html and returns the same URL
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
