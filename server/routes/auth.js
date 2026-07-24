import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'notemerge-secret-key-2026-super-secure';

// Utility helper to generate UUID
function generateId() {
  return 'user_' + randomUUID().substring(0, 8) + Date.now().toString(36);
}

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const userId = generateId();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
      userId,
      email.toLowerCase(),
      hashedPassword
    );

    // Initialize user stats
    db.prepare('INSERT INTO user_stats (user_id, topics_compiled, streak_days) VALUES (?, 0, 1)').run(userId);

    const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: userId, email: email.toLowerCase(), topicsCompiled: 0, streakDays: 1 }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Fetch user stats
    let stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(user.id);
    if (!stats) {
      db.prepare('INSERT INTO user_stats (user_id, topics_compiled, streak_days) VALUES (?, 0, 1)').run(user.id);
      stats = { topics_compiled: 0, streak_days: 1 };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        topicsCompiled: stats.topics_compiled,
        streakDays: stats.streak_days
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate.' });
  }
});

// GET /api/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = db.prepare('SELECT topics_compiled, streak_days FROM user_stats WHERE user_id = ?').get(user.id) || { topics_compiled: 0, streak_days: 1 };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        topicsCompiled: stats.topics_compiled,
        streakDays: stats.streak_days
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
