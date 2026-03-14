import { describe, expect, test } from '@jest/globals';
import { similarityScore, safeJsonParse } from '../src/utils/matchUtils.js';

describe('similarityScore', () => {
  test('returns 100 when job has no required skills', () => {
    expect(similarityScore(['node', 'react'], [])).toBe(100);
  });

  test('calculates basic overlap correctly', () => {
    const resume = ['JavaScript', 'Node', 'React', 'Docker'];
    const job = ['react', 'aws', 'node'];
    expect(similarityScore(resume, job)).toBe(67);
  });

  test('is case and whitespace insensitive', () => {
    const resume = ['  Python', 'Flask', 'SQL  '];
    const job = ['python', ' sql', 'docker'];
    expect(similarityScore(resume, job)).toBe(67);
  });

  test('no overlap returns 0', () => {
    expect(similarityScore(['a', 'b'], ['c', 'd'])).toBe(0);
  });
});

describe('safeJsonParse', () => {
  test('parses plain JSON', () => {
    const raw = '{"a":1, "b": 2}';
    expect(safeJsonParse(raw)).toEqual({ a: 1, b: 2 });
  });

  test('parses JSON wrapped in ```json fences', () => {
    const raw = '```json\n{"job": {"reasoning": "ok"}}\n```';
    expect(safeJsonParse(raw)).toEqual({ job: { reasoning: 'ok' } });
  });

  test('returns error object for invalid JSON', () => {
    const raw = '```json\n{ not valid json }\n```';
    const res = safeJsonParse(raw);
    expect(res).toHaveProperty('error');
    expect(res).toHaveProperty('raw_text_sample');
  });

  test('empty string returns error object', () => {
    const res = safeJsonParse('');
    expect(res).toHaveProperty('error');
  });
});

describe('similarityScore edge cases', () => {
  test('empty resume skills returns 0 when job has skills', () => {
    expect(similarityScore([], ['node', 'react'])).toBe(0);
  });
});
