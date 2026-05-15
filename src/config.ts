import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export interface CliConfig {
  apiKey?: string;
  apiUrl?: string;
}

export function configPath(): string {
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'htmlhost', 'config.json');
}

export function readConfig(): CliConfig {
  const path = configPath();
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8')) as CliConfig;
}

export function writeConfig(config: CliConfig): void {
  const path = configPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

export function getApiKey(): string | undefined {
  return process.env.HTMLHOST_API_KEY || readConfig().apiKey;
}

export function getApiUrl(): string {
  return process.env.HTMLHOST_API_URL || readConfig().apiUrl || 'https://htmlhost.ai/api/deploy';
}
