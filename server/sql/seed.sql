-- Seed data for development and testing

-- Add a test user (password hash is placeholder; use proper hashing in production)
INSERT INTO users (name, email, password_hash, role)
VALUES
('Test User', 'test@example.com', 'hashed-password-placeholder', 'user')
ON CONFLICT (email) DO NOTHING;

-- Add some sample jobs
INSERT INTO jobs (title, description, skills_required)
VALUES
('Frontend Engineer', 'Build UI with React and TypeScript', 'react,typescript,html,css'),
('Backend Engineer', 'Build APIs with Node.js and Postgres', 'node,express,postgres,sql'),
('Data Scientist', 'Work on ML models and data pipelines', 'python,ml,statistics')
ON CONFLICT DO NOTHING;
