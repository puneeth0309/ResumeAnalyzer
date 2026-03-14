import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/auth.js';
import matchJobRoutes from './routes/matchJobRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import pool from './db.js';

const PORT = process.env.PORT || 5000;
const app = express();

// CORS origin handling: allow a single origin or a comma-separated list in FRONTEND_URL
// Fallback to CLIENT_ORIGIN for older env files. If none are set, allow all origins (useful for local dev).
const corsOriginsEnv = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || '';
const allowedOrigins = corsOriginsEnv.split(',').map((s) => s.trim()).filter(Boolean);
if (!corsOriginsEnv) {
  console.warn('No FRONTEND_URL / CLIENT_ORIGIN set — CORS will allow all origins (development mode)');
} else {
  console.log('Allowed CORS origins:', allowedOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests like Postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Evaluator backend running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db_status: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/get', matchJobRoutes);

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You reached a protected route',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
