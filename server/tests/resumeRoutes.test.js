import { jest } from '@jest/globals';
import path from 'path';

beforeAll(async () => {
  await jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
    default: (req, res, next) => { req.user = { id: 1 }; next(); }
  }));

  await jest.unstable_mockModule('multer', () => {
    const fn = () => ({
      single: () => (req, res, next) => {
        req.file = { path: path.join(process.cwd(), 'temp', 'test.pdf'), originalname: 'test.pdf' };
        next();
      }
    });
    fn.diskStorage = () => ({});
    return { default: fn };
  });

  await jest.unstable_mockModule('fs', () => ({
    default: {
      existsSync: () => true,
      mkdirSync: () => {},
      readFileSync: () => new Uint8Array([1,2,3]),
      unlinkSync: () => {}
    }
  }));

  await jest.unstable_mockModule('pdfjs-dist/legacy/build/pdf.js', () => ({
    default: {
      GlobalWorkerOptions: { workerSrc: null },
      getDocument: () => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: async () => ({ getTextContent: async () => ({ items: [{ str: 'sample text' }] }) })
        })
      })
    }
  }));

  await jest.unstable_mockModule('cloudinary', () => ({
    v2: {
      config: () => {},
      uploader: { 
        upload: jest.fn().mockResolvedValue({ secure_url: 'http://cloud/resume.pdf' }),
        destroy: jest.fn().mockResolvedValue({ result: 'ok' })
      }
    }
  }));

  await jest.unstable_mockModule('../src/services/geminiService.js', () => ({
    analyzeResume: jest.fn().mockResolvedValue({ skills: ['node', 'react'] })
  }));

  await jest.unstable_mockModule('../src/db.js', () => ({
    default: { query: jest.fn().mockResolvedValue({ rows: [] }) }
  }));
});

test('GET /api/resume/history returns resumes from DB', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');
  pool.query.mockResolvedValueOnce({ rows: [{ id: 1, original_name: 'test.pdf', file_url: 'u', created_at: new Date(), analysis_result: {} }] });

  const request = (await import('supertest')).default;
  const res = await request(app).get('/api/resume/history').set('Authorization', 'Bearer token');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('POST /api/resume/upload processes an uploaded file', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');
  pool.query.mockResolvedValueOnce({});

  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/resume/upload').set('Authorization', 'Bearer token');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(res.body).toHaveProperty('file_url');
});

test('POST /api/resume/upload returns 500 when cloudinary upload fails', async () => {
  const { default: app } = await import('../src/index.js');
  const { v2: cloudinary } = await import('cloudinary');
  const { default: pool } = await import('../src/db.js');

  cloudinary.uploader.upload.mockRejectedValueOnce(new Error('cloud fail'));
  pool.query.mockResolvedValueOnce({});

  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const request = (await import('supertest')).default;
  const res = await request(app).post('/api/resume/upload').set('Authorization', 'Bearer token');
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('DELETE /api/resume/:id deletes when found and authorized', async () => {
  const { default: app } = await import('../src/index.js');
  const { v2: cloudinary } = await import('cloudinary');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockReset();
  pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 1, file_url: 'http://cloud/resume.pdf' }] });
  pool.query.mockResolvedValueOnce({ rowCount: 1 });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/1').set('Authorization', 'Bearer token');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
});

test('DELETE /api/resume/:id returns 404 when not found', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');
  pool.query.mockReset();
  pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/999').set('Authorization', 'Bearer token');
  expect(res.status).toBe(404);
});

test('DELETE /api/resume/:id returns 403 when not authorized', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');
  pool.query.mockReset();
  pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2, user_id: 2, file_url: '' }] });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/2').set('Authorization', 'Bearer token');
  expect(res.status).toBe(403);
});


afterAll(async () => {
  try {
    const fs = await import('fs');
    if (fs?.default?.unlinkSync) fs.default.unlinkSync(path.join(process.cwd(), 'temp', 'test.pdf'));
  } catch (e) {
    
  }
  jest.resetModules();
  jest.restoreAllMocks();
});

test('DELETE /api/resume/:id deletes when found and authorized', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');
  const { v2: cloudinary } = await import('cloudinary');

  pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 1, file_url: 'http://cloud/resume.pdf' }] });
  pool.query.mockResolvedValueOnce({});

  cloudinary.uploader.destroy = jest.fn().mockResolvedValueOnce({ result: 'ok' });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/1').set('Authorization', 'Bearer token');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
});

test('DELETE /api/resume/:id returns 404 when not found', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/999').set('Authorization', 'Bearer token');
  expect(res.status).toBe(404);
});

test('DELETE /api/resume/:id returns 403 when not authorized', async () => {
  const { default: app } = await import('../src/index.js');
  const { default: pool } = await import('../src/db.js');

  pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2, user_id: 2, file_url: '' }] });

  const request = (await import('supertest')).default;
  const res = await request(app).delete('/api/resume/2').set('Authorization', 'Bearer token');
  expect(res.status).toBe(403);
});