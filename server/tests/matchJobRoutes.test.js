import { jest } from '@jest/globals';

jest.setTimeout(20000);

beforeAll(async () => {
  await jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
    default: (req, res, next) => { req.user = { id: 1 }; next(); }
  }));

  const mockQuery = jest.fn();
  await jest.unstable_mockModule('../src/db.js', () => ({
    default: { query: mockQuery }
  }));
  global.fetch = jest.fn();
});

test('returns existing matches when present', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [{ job_id: 1, match_score: 90, reasoning: { r: 'ok' }, title: 'Job 1' }] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 1 });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test('returns 404 if resume not found', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 999 });
  expect(res.status).toBe(404);
});

test('returns 400 when resume has no skills', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: {} }] });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 2 });
  expect(res.status).toBe(400);
});

test('happy path matches jobs and returns data', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: { skills: ['node', 'react'] } }] });
  pool.query.mockResolvedValueOnce({ rows: [ { id: 1, title: 'J1', skills_required: 'node,react' } ] });
  pool.query.mockResolvedValue({ rows: [] });

  const aiJson = JSON.stringify({ 1: { reasoning: 'ok', fit_skills: ['node'], missing_skills: ['react'] } });
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: aiJson }] } }] }) });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 3 });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0]).toHaveProperty('job_id', 1);
});

test('retries on 429 and succeeds', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: { skills: ['node'] } }] });
  pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'J1', skills_required: 'node' }] });
  pool.query.mockResolvedValue({ rows: [] });

  const aiJson = JSON.stringify({ 1: { reasoning: 'ok', fit_skills: ['node'], missing_skills: [] } });
  global.fetch.mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' })
               .mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: aiJson }] } }] }) });

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 10 });
  expect(res.status).toBe(200);
  expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
});

test('returns 500 when AI returns invalid JSON', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: { skills: ['node'] } }] });
  pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'J1', skills_required: 'node' }] });

  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'not valid json' }] } }] }) });

  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 11 });
  expect(res.status).toBe(500);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('returns 500 when AI service responds with non-retryable error (500)', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rows: [] });
  pool.query.mockResolvedValueOnce({ rows: [{ analysis_result: { skills: ['node'] } }] });
  pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'J1', skills_required: 'node' }] });

  global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });

  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({ resume_id: 12 });
  expect(res.status).toBe(500);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('returns 400 when resume_id is missing from request body', async () => {
  const { default: app } = await import('../src/index.js');
  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/get/job-matches').set('Authorization', 'Bearer token').send({});
  expect(res.status).toBe(400);
});

  afterAll(() => {
    try { delete global.fetch; } catch (e) {}
    jest.resetModules();
    jest.restoreAllMocks();
  });