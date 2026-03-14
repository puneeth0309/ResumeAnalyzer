import { describe, expect, test } from '@jest/globals';

describe('app root', () => {
  test('GET / returns status ok', async () => {
    const request = (await import('supertest')).default;
    const { default: app } = await import('../src/index.js');

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
  });
});
