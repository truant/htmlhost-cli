#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { parseArgs } from './args.js';
import { readConfig, writeConfig } from './config.js';
import { deployFile, listPages, updateFile } from './deploy.js';

function usage(): void {
  console.log(`HTMLHost.ai CLI

Usage:
  htmlhost login
  htmlhost deploy <file.html> [--site <subdomain>] [--project <name>]
  htmlhost update <url-or-page-id> <file.html>
  htmlhost list

Environment:
  HTMLHOST_API_KEY   API key from https://htmlhost.ai/
  HTMLHOST_API_URL   Override deploy endpoint for development
`);
}

async function login(): Promise<void> {
  console.log('Create an API key at https://htmlhost.ai/, then paste it here.');
  const rl = createInterface({ input, output });
  const apiKey = (await rl.question('API key: ')).trim();
  rl.close();
  if (!apiKey.startsWith('hh_')) throw new Error('Invalid API key format. Expected key starting with hh_.');
  writeConfig({ ...readConfig(), apiKey });
  console.log('Saved API key. Try: htmlhost deploy report.html');
}

async function main(argv: string[]): Promise<void> {
  const [command, ...args] = argv;
  if (!command || command === '--help' || command === '-h') return usage();

  if (command === 'login') {
    await login();
    return;
  }

  if (command === 'deploy') {
    const { positional, options } = parseArgs(args);
    const file = positional[0];
    if (!file) throw new Error('Usage: htmlhost deploy <file.html> [--site <subdomain>] [--project <name>]');
    const result = await deployFile(file, undefined, { site: options.site, project: options.project });
    console.log(`Deployed: ${result.url}`);
    if (result.project) {
      console.log(`Project: ${result.project.name} (${result.project.url})`);
    }
    if (result.risk?.findings.length) {
      console.log(`Risk score: ${result.risk.score} (${result.risk.findings.join('; ')})`);
    }
    return;
  }

  if (command === 'update') {
    const [target, file] = args;
    if (!target || !file) throw new Error('Usage: htmlhost update <url-or-page-id> <file.html>');
    const result = await updateFile(target, file);
    const version = result.versionNumber ? ` (v${result.versionNumber})` : '';
    console.log(`Updated: ${result.url}${version}`);
    if (result.risk?.findings.length) {
      console.log(`Risk score: ${result.risk.score} (${result.risk.findings.join('; ')})`);
    }
    return;
  }

  if (command === 'list') {
    const listing = await listPages();
    if (!listing.pages.length) {
      console.log('No pages published yet. Try: htmlhost deploy report.html');
      return;
    }
    for (const page of listing.pages) {
      const label = page.title || page.filename || page.path;
      const project = page.project?.name ? `  [${page.project.name}]` : '';
      const views = typeof page.viewCount === 'number' ? `  ${page.viewCount} views` : '';
      console.log(`${page.url}\n  ${label}${project}${views}`);
    }
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
