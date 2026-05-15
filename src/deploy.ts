import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { getApiKey, getApiUrl } from './config.js';

export interface DeployResult {
  ok: boolean;
  siteId: string;
  pageId: string;
  filename: string;
  path: string;
  url: string;
  title?: string | null;
  risk?: { score: number; findings: string[] };
}

export async function deployFile(filePath: string, apiUrl = getApiUrl()): Promise<DeployResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Run `htmlhost login` or set HTMLHOST_API_KEY.');
  }

  const html = await readFile(filePath, 'utf8');
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'text/html; charset=utf-8',
      'x-htmlhost-filename': basename(filePath),
    },
    body: html,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) as Record<string, unknown> : {};
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : `Deploy failed with ${response.status}`;
    throw new Error(message);
  }
  return data as unknown as DeployResult;
}
