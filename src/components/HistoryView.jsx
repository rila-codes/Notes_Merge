import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, ExternalLink, Calendar, FileText, HelpCircle, Layers } from 'lucide-react';

export default function HistoryView({ user, onSelectCompilation, onOpenQuiz }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const userId = user ? user.id : 'guest_session';
      const res = await fetch(`/api/history?userId=${userId}`);
      const data = await res.json();

      if (data.history) {
        setHistoryItems(data.history);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this compilation from your history?')) return;

    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistoryItems(historyItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete history error:', err);
    }
  };

  const filteredHistory = historyItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={26} color="var(--accent-light)" /> Saved Compilation History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review past compiled study topics, re-download summaries, or test yourself with quizzes.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past topics..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-panel" style={{ padding: '1.25rem', height: '140px' }}>
              <div className="skeleton-box" style={{ height: '24px', width: '70%', marginBottom: '0.75rem' }} />
              <div className="skeleton-box" style={{ height: '16px', width: '50%', marginBottom: '1rem' }} />
              <div className="skeleton-box" style={{ height: '16px', width: '90%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && (
        <div className="glass-panel" style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--text-muted)'
          }}>
            <FileText size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Saved Compilations Found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto' }}>
            When you compile study notes while signed in or during a session, they will automatically appear here for revision.
          </p>
        </div>
      )}

      {/* History Grid */}
      {!loading && filteredHistory.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredHistory.map(item => (
            <div
              key={item.id}
              className="glass-panel"
              onClick={() => onSelectCompilation(item.compilation)}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    background: 'var(--accent-glow)',
                    color: 'var(--accent-light)',
                    textTransform: 'uppercase'
                  }}>
                    {item.compression || 'Medium'} Density
                  </span>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} color="var(--accent-light)" />
                  {item.notes ? `${item.notes.length} note sources merged` : 'Notes merged'}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: '0.5rem'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuiz(item.compilation);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <HelpCircle size={13} /> Practice Quiz
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete item"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    View <ExternalLink size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
