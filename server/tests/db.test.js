import { jest } from '@jest/globals';

beforeAll(async () => {
  await jest.unstable_mockModule('../src/db.js', () => ({
    default: { query: jest.fn() }
  }));
});

test('GET /api/db-test returns connected when DB ok', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [{ now: '2025-11-02T00:00:00Z' }] });

  const request = (await import('supertest')).default;
  const res = await request(app).get('/api/db-test');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('db_status', 'connected');
  expect(res.body).toHaveProperty('time');
});

test('GET /api/db-test returns 500 when DB errors', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockRejectedValueOnce(new Error('db down'));

  const request = (await import('supertest')).default;
  const res = await request(app).get('/api/db-test');
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
});

afterAll(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});
