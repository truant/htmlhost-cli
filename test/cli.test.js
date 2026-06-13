import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseArgs } from '../dist/args.js';
import { pageIdFromTarget } from '../dist/deploy.js';

test('parseArgs collects positional arguments', () => {
  assert.deepEqual(parseArgs(['report.html']), { positional: ['report.html'], options: {} });
});

test('parseArgs supports --site and --project in both forms', () => {
  assert.deepEqual(parseArgs(['report.html', '--site', 'demo']).options, { site: 'demo' });
  assert.deepEqual(parseArgs(['--site=demo', 'report.html']).options, { site: 'demo' });
  assert.deepEqual(parseArgs(['report.html', '--project', 'Sprint Review']).options, { project: 'Sprint Review' });
  assert.deepEqual(parseArgs(['--project=sprint-review', 'report.html']).options, { project: 'sprint-review' });
  const both = parseArgs(['report.html', '--site', 'demo', '--project', 'docs']);
  assert.deepEqual(both.positional, ['report.html']);
  assert.deepEqual(both.options, { site: 'demo', project: 'docs' });
});

test('parseArgs rejects missing values and unknown options', () => {
  assert.throws(() => parseArgs(['--site']), /Missing value for --site/);
  assert.throws(() => parseArgs(['--project']), /Missing value for --project/);
  assert.throws(() => parseArgs(['--nope', 'x']), /Unknown option: --nope/);
});

test('pageIdFromTarget extracts the id from hosted URLs', () => {
  assert.equal(pageIdFromTarget('https://demo.htmlhost.ai/p/abc123/report.html'), 'abc123');
  assert.equal(pageIdFromTarget('abc123'), 'abc123');
});

test('pageIdFromTarget rejects hosted URLs without a page path', () => {
  assert.throws(() => pageIdFromTarget('https://demo.htmlhost.ai/other/path'), /must contain/);
});
