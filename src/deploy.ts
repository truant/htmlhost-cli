import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { getApiKey, getApiUrl } from './config.js';

export interface DeployResult {
  ok: boolean;
  siteId: string;
  pageId?: string;
  pageRecordId?: string;
  filename: string;
  path: string;
  url: string;
  title?: string | null;
  versionNumber?: number;
  project?: { slug: string; name: string; url: string } | null;
  risk?: { score: number; findings: string[] };
}

export interface DeployOptions {
  site?: string;
  project?: string;
}

export interface PageListing {
  pages: Array<{
    id: string;
    pageId?: string | null;
    siteId: string;
    path: string;
    filename?: string | null;
    title?: string | null;
    url: string;
    project?: { slug: string; name: string } | null;
    viewCount?: number;
    createdAt: string;
    updatedAt?: string | null;
  }>;
}

export async function deployFile(filePath: string, apiUrl = getApiUrl(), options: DeployOptions = {}): Promise<DeployResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Run `htmlhost login` or set HTMLHOST_API_KEY.');
  }

  const html = await readFile(filePath, 'utf8');
  const headers: Record<string, string> = {
    authorization: `Bearer ${apiKey}`,
    'content-type': 'text/html; charset=utf-8',
    'x-htmlhost-filename': basename(filePath),
  };
  if (options.site) headers['x-htmlhost-slug'] = options.site;
  if (options.project) headers['x-htmlhost-project'] = options.project;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
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

export async function listPages(apiUrl = getApiUrl()): Promise<PageListing> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Run `htmlhost login` or set HTMLHOST_API_KEY.');
  }

  const url = new URL(apiUrl);
  url.pathname = '/api/pages';
  url.search = '';
  const response = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${apiKey}`, accept: 'application/json' },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : `List failed with ${response.status}`;
    throw new Error(message);
  }
  return data as unknown as PageListing;
}

export function pageIdFromTarget(target: string): string {
  try {
    const url = new URL(target);
    const match = url.pathname.match(/^\/p\/([^/]+)/);
    if (!match) throw new Error('Hosted URL must contain /p/<pageId>/...');
    return decodeURIComponent(match[1]);
  } catch (error) {
    if (error instanceof TypeError) return target;
    throw error;
  }
}

function updateUrlForPage(target: string, apiUrl: string): string {
  const pageId = pageIdFromTarget(target);
  const url = new URL(apiUrl);
  url.pathname = `/api/pages/${encodeURIComponent(pageId)}/update`;
  url.search = '';
  return url.toString();
}

export async function updateFile(target: string, filePath: string, apiUrl = getApiUrl()): Promise<DeployResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Run `htmlhost login` or set HTMLHOST_API_KEY.');
  }

  const html = await readFile(filePath, 'utf8');
  const response = await fetch(updateUrlForPage(target, apiUrl), {
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
    const message = typeof data.error === 'string' ? data.error : `Update failed with ${response.status}`;
    throw new Error(message);
  }
  return data as unknown as DeployResult;
}
