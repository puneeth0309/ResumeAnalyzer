import pool from '../db.js';

export async function createUser({ name, email, passwordHash, role = 'user' }) {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const values = [name, email, passwordHash, role];
  const res = await pool.query(query, values);
  return res.rows[0];
}

export async function getUserByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function getUserById(id) {
  const res = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

export async function updateUserPassword(id, newPasswordHash) {
  const query = `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    RETURNING id, name, email, role, created_at
  `;
  const values = [newPasswordHash, id];
  const res = await pool.query(query, values);
  return res.rows[0];
}
