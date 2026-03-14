import { Pool } from 'pg';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  test('skipping SQL integration tests because DATABASE_URL is not set', () => {
    expect(true).toBe(true);
  });
} else {
  const pool = new Pool({ connectionString: databaseUrl });
  let schema = `test_schema_${Date.now()}`;

  beforeAll(async () => {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await pool.query(`SET search_path TO ${schema}`);

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        skills_required TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        original_name TEXT,
        file_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        analysis_result JSONB,
        CONSTRAINT fk_resumes_user FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE matches (
        id SERIAL PRIMARY KEY,
        resume_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        match_score INTEGER,
        reasoning JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_matches_resume FOREIGN KEY(resume_id) REFERENCES resumes(id),
        CONSTRAINT fk_matches_job FOREIGN KEY(job_id) REFERENCES jobs(id)
      );
    `);

    await pool.query(`CREATE INDEX idx_resumes_user_id ON resumes(user_id);`);
    await pool.query(`CREATE INDEX idx_resumes_created_at ON resumes(created_at);`);
    await pool.query(`CREATE INDEX idx_matches_resume_id ON matches(resume_id);`);
    await pool.query(`CREATE INDEX idx_matches_match_score ON matches(match_score);`);
  });

  afterAll(async () => {
    try {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    } finally {
      await pool.end();
    }
  });

  describe('SQL integration: schema, FKs and indexes', () => {
    test('tables were created', async () => {
      const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1`, [schema]);
      const names = res.rows.map(r => r.table_name).sort();
      expect(names).toEqual(expect.arrayContaining(['users', 'jobs', 'resumes', 'matches']));
    });

    test('foreign keys exist for resumes and matches', async () => {
      const fkRes = await pool.query(`
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = $1
      `, [schema]);
      const fks = fkRes.rows.map(r => r.constraint_name);
      expect(fks.length).toBeGreaterThanOrEqual(2);
    });

    test('recommended indexes exist', async () => {
      const idxRes = await pool.query(`SELECT indexname FROM pg_indexes WHERE schemaname = $1`, [schema]);
      const idxs = idxRes.rows.map(r => r.indexname);
      expect(idxs).toEqual(expect.arrayContaining([
        expect.stringContaining('idx_resumes_user_id'),
        expect.stringContaining('idx_resumes_created_at'),
        expect.stringContaining('idx_matches_resume_id'),
        expect.stringContaining('idx_matches_match_score')
      ]));
    });

    test('basic query behavior: insert and select resumes by user', async () => {
      const u = await pool.query(`INSERT INTO users(name,email) VALUES($1,$2) RETURNING id`, ['T', 't@example.com']);
      const userId = u.rows[0].id;
      await pool.query(`INSERT INTO resumes(user_id, original_name, file_url, analysis_result) VALUES($1,$2,$3,$4)`, [userId, 'r.pdf', 'http://u', JSON.stringify({ skills: ['node'] })]);

      const res = await pool.query(`SELECT id FROM resumes WHERE user_id = $1`, [userId]);
      expect(res.rows.length).toBeGreaterThanOrEqual(1);
    });
  });
}
