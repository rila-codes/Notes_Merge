import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Compiler from './components/Compiler.jsx';
import HistoryView from './components/HistoryView.jsx';
import SettingsView from './components/SettingsView.jsx';
import AuthModal from './components/AuthModal.jsx';
import QuizModal from './components/QuizModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('compiler');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeCompilationForQuiz, setActiveCompilationForQuiz] = useState(null);

  // Initialize theme and auto-login user if token present
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const token = localStorage.getItem('notemerge_token');
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(err => console.error('Auto login verify error:', err));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('notemerge_token');
    setUser(null);
  };

  const handleOpenQuiz = (compilation) => {
    setActiveCompilationForQuiz(compilation);
    setShowQuizModal(true);
  };

  const handleSelectHistoryCompilation = (compilation) => {
    setActiveTab('compiler');
    // Open in quiz or trigger view
    handleOpenQuiz(compilation);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'compiler' && (
          <Compiler
            user={user}
            customApiKey={customApiKey}
            onOpenQuiz={handleOpenQuiz}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            user={user}
            onSelectCompilation={handleSelectHistoryCompilation}
            onOpenQuiz={handleOpenQuiz}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            customApiKey={customApiKey}
            setCustomApiKey={setCustomApiKey}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>NoteMerge</strong> &copy; {new Date().getFullYear()} — AI Notes Compiler for Exam Revision
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy-First Architecture</span>
            <span>•</span>
            <span>Source Tagging & Conflict Detection</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)}
      />

      {/* Practice Exam Quiz Modal */}
      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        compilation={activeCompilationForQuiz}
        customApiKey={customApiKey}
      />
    </div>
  );
}
