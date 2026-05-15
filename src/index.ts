#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readConfig, writeConfig } from './config.js';
import { deployFile } from './deploy.js';

function usage(): void {
  console.log(`HTMLHost.ai CLI

Usage:
  htmlhost login
  htmlhost deploy <file.html>

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
    const file = args[0];
    if (!file) throw new Error('Usage: htmlhost deploy <file.html>');
    const result = await deployFile(file);
    console.log(`Deployed: ${result.url}`);
    if (result.risk?.findings.length) {
      console.log(`Risk score: ${result.risk.score} (${result.risk.findings.join('; ')})`);
    }
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
