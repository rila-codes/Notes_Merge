import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/history
router.get('/history', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.json({ history: [] });
  }

  try {
    const rows = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const parsed = rows.map(r => ({
      id: r.id,
      title: r.title,
      notes: JSON.parse(r.notes_json),
      compilation: JSON.parse(r.summary_json),
      quiz: r.quiz_json ? JSON.parse(r.quiz_json) : null,
      compression: r.compression,
      createdAt: r.created_at
    }));
    res.json({ history: parsed });
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// POST /api/history
router.post('/history', (req, res) => {
  try {
    const { userId, title, notes, compilation, quiz, compression = 'medium' } = req.body;
    if (!userId || !compilation) {
      return res.status(400).json({ error: 'User ID and compilation data required.' });
    }

    const id = 'comp_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    db.prepare('INSERT INTO history (id, user_id, title, notes_json, summary_json, quiz_json, compression) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id,
      userId,
      title || compilation.topicTitle || 'Untitled Summary',
      JSON.stringify(notes || []),
      JSON.stringify(compilation),
      quiz ? JSON.stringify(quiz) : null,
      compression
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ error: 'Failed to save to history.' });
  }
});

// DELETE /api/history/:id
router.delete('/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM history WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history item.' });
  }
});

export default router;
