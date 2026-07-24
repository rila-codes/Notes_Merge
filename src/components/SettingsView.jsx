import React, { useState } from 'react';
import { Settings, Moon, Sun, Key, Flame, BookOpen, Shield, Trash2, Check } from 'lucide-react';

export default function SettingsView({
  theme,
  toggleTheme,
  user,
  customApiKey,
  setCustomApiKey
}) {
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey || '');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setCustomApiKey(apiKeyInput);
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={26} color="var(--accent-light)" /> App Settings & Profile
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Customize your experience, manage API key preferences, and track your study progress.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* User Study Stats Widget */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Study Activity & Stats
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                <Flame size={18} fill="var(--warning)" /> Daily Study Streak
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user ? user.streakDays || 1 : 1} Days
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Active study record</p>
            </div>

            <div style={{ padding: '1.1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-light)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                <BookOpen size={18} /> Topics Compiled
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user ? user.topicsCompiled || 0 : 0} Summaries
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Total notes compiled</p>
            </div>
          </div>
        </div>

        {/* Theme Setting */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Appearance & Theme
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Dark mode is active by default. You can toggle between dark and light themes anytime.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
              <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Custom Gemini API Key Configuration */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Key size={18} color="var(--accent-light)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Google Gemini API Key (Optional)
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            NoteMerge includes a smart built-in fallback compiler engine. If you wish to use your own Google Gemini API key, enter it below.
          </p>

          <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: savedKeySuccess ? 'var(--success-bg)' : 'var(--accent-primary)',
                color: savedKeySuccess ? 'var(--success)' : '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {savedKeySuccess ? <Check size={16} /> : null}
              {savedKeySuccess ? 'Saved Key!' : 'Save Key'}
            </button>
          </form>
        </div>

        {/* Account Details */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Account Session Status
          </h3>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="var(--success)" />
            <span>Currently logged in as: <strong>{user ? user.email : 'Guest User'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
