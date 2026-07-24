import React from 'react';
import { Sparkles, Layers, History, Settings, Sun, Moon, UserCheck, LogIn, Flame } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('compiler')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          id="nav-logo"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Note<span style={{ color: 'var(--accent-light)' }}>Merge</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                background: 'var(--accent-glow)',
                color: 'var(--accent-light)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                border: '1px solid var(--accent-primary)'
              }}>AI COMPILER</span>
            </h1>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            id="tab-compiler-btn"
            onClick={() => setActiveTab('compiler')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'compiler' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'compiler' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={16} /> Compiler
          </button>

          <button
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'history' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <History size={16} /> History
          </button>

          <button
            id="tab-settings-btn"
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'settings' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>

        {/* Right Tools & User Authentication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Study Streak Counter */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-bg)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--warning)',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <Flame size={16} fill="var(--warning)" />
              <span>{user.streakDays || 1} Day Streak</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* User Account / Guest Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}>
                <UserCheck size={16} color="var(--success)" />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              id="login-modal-open-btn"
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <LogIn size={16} /> Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
