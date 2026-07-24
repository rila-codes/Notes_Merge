import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'notemerge_store.json');

// Default initial state
let state = {
  users: [],
  history: [],
  user_stats: []
};

// Load existing data if file exists
function load() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      state = JSON.parse(raw);
    } else {
      save();
    }
  } catch (err) {
    console.error('Failed to load database JSON file:', err);
  }
}

// Persist data to file
function save() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database JSON file:', err);
  }
}

load();

console.log('⚡ Pure-JS Database Initialized at:', dbFilePath);

// Compatible DB interface mimicking SQLite prepared statements
const db = {
  prepare(sql) {
    const s = sql.trim();

    // SELECT user by email
    if (s.startsWith('SELECT * FROM users WHERE email = ?')) {
      return {
        get(email) {
          return state.users.find(u => u.email === email) || null;
        }
      };
    }

    // SELECT user by id
    if (s.startsWith('SELECT id, email, created_at FROM users WHERE id = ?')) {
      return {
        get(id) {
          const u = state.users.find(x => x.id === id);
          return u ? { id: u.id, email: u.email, created_at: u.created_at } : null;
        }
      };
    }

    // INSERT into users
    if (s.startsWith('INSERT INTO users')) {
      return {
        run(id, email, password_hash) {
          state.users.push({ id, email, password_hash, created_at: new Date().toISOString() });
          save();
        }
      };
    }

    // SELECT user_stats
    if (s.startsWith('SELECT * FROM user_stats WHERE user_id = ?') || s.startsWith('SELECT topics_compiled, streak_days FROM user_stats WHERE user_id = ?')) {
      return {
        get(userId) {
          return state.user_stats.find(st => st.user_id === userId) || null;
        }
      };
    }

    // INSERT user_stats
    if (s.startsWith('INSERT INTO user_stats')) {
      return {
        run(userId, topics_compiled = 0, streak_days = 1) {
          const existing = state.user_stats.find(st => st.user_id === userId);
          if (!existing) {
            state.user_stats.push({ user_id: userId, topics_compiled, streak_days, last_active: new Date().toISOString() });
            save();
          }
        }
      };
    }

    // UPDATE user_stats
    if (s.startsWith('UPDATE user_stats SET topics_compiled')) {
      return {
        run(userId) {
          const st = state.user_stats.find(x => x.user_id === userId);
          if (st) {
            st.topics_compiled += 1;
            st.last_active = new Date().toISOString();
          } else {
            state.user_stats.push({ user_id: userId, topics_compiled: 1, streak_days: 1, last_active: new Date().toISOString() });
          }
          save();
        }
      };
    }

    // SELECT history by user_id
    if (s.startsWith('SELECT * FROM history WHERE user_id = ?')) {
      return {
        all(userId) {
          return state.history
            .filter(h => h.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      };
    }

    // INSERT into history
    if (s.startsWith('INSERT INTO history')) {
      return {
        run(id, user_id, title, notes_json, summary_json, quiz_json, compression = 'medium') {
          state.history.push({
            id,
            user_id,
            title,
            notes_json: typeof notes_json === 'string' ? notes_json : JSON.stringify(notes_json),
            summary_json: typeof summary_json === 'string' ? summary_json : JSON.stringify(summary_json),
            quiz_json: quiz_json ? (typeof quiz_json === 'string' ? quiz_json : JSON.stringify(quiz_json)) : null,
            compression,
            created_at: new Date().toISOString()
          });
          save();
        }
      };
    }

    // DELETE from history
    if (s.startsWith('DELETE FROM history WHERE id = ?')) {
      return {
        run(id) {
          state.history = state.history.filter(h => h.id !== id);
          save();
        }
      };
    }

    // Fallback stub
    return {
      get() { return null; },
      all() { return []; },
      run() { save(); }
    };
  }
};

export default db;
