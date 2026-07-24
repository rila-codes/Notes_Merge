import React, { useState } from 'react';
import {
  Plus, Trash2, FileText, Upload, Sparkles, Sliders, Copy, Check,
  Download, HelpCircle, AlertTriangle, BookOpen, ChevronRight, Layers, Tag, BarChart2
} from 'lucide-react';
import SampleNotesModal from './SampleNotesModal.jsx';

export default function Compiler({ user, customApiKey, onOpenQuiz }) {
  // State for notes array
  const [notes, setNotes] = useState([
    {
      id: 'note_1',
      title: 'Class Lecture Notes (Cell Respiration)',
      text: `Cellular respiration converts glucose into ATP.
3 main stages: Glycolysis, Krebs Cycle (TCA), and Electron Transport Chain (ETC).
Glycolysis occurs in cytoplasm and yields 2 ATP net + 2 NADH. Does NOT require oxygen (anaerobic).
Krebs cycle happens in mitochondrial matrix, produces 2 ATP, 6 NADH, 2 FADH2 per glucose molecule.
ETC happens in inner mitochondrial membrane (cristae). Highest ATP yield: 32-34 ATP.
Total theoretical yield: ~36-38 ATP per glucose.
Discovery of Krebs cycle was in 1937.`
    },
    {
      id: 'note_2',
      title: 'Textbook Summary (Ch 7)',
      text: `Respiration pathway summary:
- Glycolysis breaks 6-carbon glucose into 2 pyruvate molecules (3 carbons each).
- Acetyl-CoA formation links glycolysis to citric acid cycle.
- Citric Acid Cycle discovered by Hans Krebs in 1937.
- Electron Transport Chain uses oxygen as the final electron acceptor to produce H2O.
- Proton gradient drives ATP Synthase enzyme (chemiosmosis).
- Oxidative phosphorylation produces majority of cellular energy.`
    },
    {
      id: 'note_3',
      title: 'Study Group Jotted Notes',
      text: `Glycolysis = cytoplasm. Anaerobic. 2 ATP net.
Krebs cycle discovered in 1945 (wait or 1937?).
Krebs = mitochondrial matrix. Needs oxygen indirectly.
ETC = inner membrane. Needs Oxygen directly! Final acceptor = O2 forming H2O.
ATP Synthase acts like a rotary motor.
Total ATP count is usually 30-32 in real eukaryotic cells due to transport losses.`
    }
  ]);

  const [compression, setCompression] = useState('medium');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add new blank note
  const handleAddNote = () => {
    const newId = 'note_' + Date.now().toString(36);
    setNotes([
      ...notes,
      { id: newId, title: `Note ${notes.length + 1}`, text: '' }
    ]);
  };

  // Remove note
  const handleRemoveNote = (id) => {
    if (notes.length <= 1) {
      alert('You must keep at least 1 note box.');
      return;
    }
    setNotes(notes.filter(n => n.id !== id));
  };

  // Update note title or text
  const handleUpdateNote = (id, field, value) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  // File upload handler (.txt or .pdf)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const newId = 'note_' + Date.now().toString(36);
        setNotes([
          ...notes,
          { id: newId, title: data.title || file.name, text: data.text }
        ]);
      } else {
        alert(data.error || 'Failed to upload file.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      // Fallback local text reading for client-side plain text
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = 'note_' + Date.now().toString(36);
        setNotes([
          ...notes,
          { id: newId, title: file.name.replace(/\.[^/.]+$/, ''), text: event.target.result }
        ]);
      };
      reader.readAsText(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Load sample notes preset
  const handleLoadSample = (sampleNotes) => {
    setNotes(sampleNotes.map((n, i) => ({
      id: `sample_note_${i}_${Date.now()}`,
      title: n.title,
      text: n.text
    })));
  };

  // Trigger Compilation backend call
  const handleCompile = async () => {
    const validNotes = notes.filter(n => n.text.trim().length > 0);
    if (validNotes.length === 0) {
      setErrorMessage('Please enter or upload at least one note before compiling.');
      return;
    }

    setErrorMessage('');
    setIsCompiling(true);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: validNotes,
          compression,
          customApiKey,
          userId: user ? user.id : null
        })
      });

      const data = await res.json();
      if (data.success && data.compilation) {
        setCompilationResult(data.compilation);
      } else {
        setErrorMessage(data.error || 'Failed to compile notes.');
      }
    } catch (err) {
      console.error('Compilation fetch error:', err);
      setErrorMessage('Network or server error during compilation. Please try again.');
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy Markdown to Clipboard
  const handleCopy = () => {
    if (!compilationResult) return;
    navigator.clipboard.writeText(compilationResult.summaryMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TXT
  const handleDownloadTxt = () => {
    if (!compilationResult) return;
    const blob = new Blob([compilationResult.summaryMarkdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${compilationResult.topicTitle.replace(/[^a-z0-9]/gi, '_')}_Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF (Clean print window trigger)
  const handleDownloadPdf = () => {
    if (!compilationResult) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>${compilationResult.topicTitle}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 2rem; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { color: #5b21b6; border-bottom: 2px solid #ddd; padding-bottom: 0.5rem; }
            h2 { color: #333; margin-top: 1.5rem; }
            ul { padding-left: 1.5rem; }
            li { margin-bottom: 0.5rem; }
            code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
          </style>
        </head>
        <body>
          <div>${compilationResult.summaryMarkdown.replace(/\n/g, '<br>').replace(/# (.*?)<br>/g, '1>$1</h1>').replace(/## (.*?)<br>/g, '<h2>$2</h2>')}</div>
          <script>window.print(); setTimeout(() => window.close(), 1000);</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Banner / Headline */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Study Notes Compiler
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Paste or upload messy lecture notes, textbook snippets, and study group jottings. We merge them into one structured summary.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sample Notes Preset Button */}
          <button
            id="load-sample-btn"
            onClick={() => setShowSampleModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-highlight)',
              background: 'var(--bg-tertiary)',
              color: 'var(--accent-light)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={16} /> Load Sample Preset
          </button>

          {/* File Upload Button */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--accent-light)',
            background: 'rgba(124, 58, 237, 0.08)',
            color: 'var(--accent-light)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <Upload size={16} />
            <span>{isUploading ? 'Parsing file...' : 'Upload .txt or .pdf'}</span>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Left Inputs (Notes), Right Controls & Output */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Note Input Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Input Notes ({notes.length})
            </span>

            <button
              id="add-note-btn"
              onClick={handleAddNote}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--accent-light)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Add another note
            </button>
          </div>

          {notes.map((note, index) => (
            <div
              key={note.id}
              className="glass-panel"
              style={{
                padding: '1.1rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative'
              }}
            >
              {/* Note Header / Title Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: 'var(--accent-glow)',
                    color: 'var(--accent-light)'
                  }}>
                    Note #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => handleUpdateNote(note.id, 'title', e.target.value)}
                    placeholder="Note Source Title (e.g. Lecture 1)"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      outline: 'none',
                      width: '100%'
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                  />
                </div>

                <button
                  onClick={() => handleRemoveNote(note.id)}
                  title="Remove note"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Note Text Area */}
              <textarea
                value={note.text}
                onChange={(e) => handleUpdateNote(note.id, 'text', e.target.value)}
                placeholder="Paste partial notes, textbook text, bullet points, or messy jottings here..."
                rows={5}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />

              {/* Character Counter */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {note.text.length} characters
              </div>
            </div>
          ))}

          {/* Compression Slider Controls */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={16} color="var(--accent-light)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Summary Density Level</span>
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--accent-light)',
                textTransform: 'uppercase',
                background: 'var(--accent-glow)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                {compression === 'short' ? 'Short / Cheat Sheet' : compression === 'medium' ? 'Medium / Standard' : 'Detailed / Comprehensive'}
              </span>
            </div>

            {/* Slider Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.5rem',
              background: 'var(--bg-primary)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              {['short', 'medium', 'detailed'].map((level) => (
                <button
                  key={level}
                  onClick={() => setCompression(level)}
                  style={{
                    padding: '0.4rem 0.5rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: compression === level ? 'var(--accent-primary)' : 'transparent',
                    color: compression === level ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Compile Trigger Button */}
          {errorMessage && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: '0.85rem'
            }}>
              {errorMessage}
            </div>
          )}

          <button
            id="compile-btn"
            onClick={handleCompile}
            disabled={isCompiling}
            style={{
              width: '100%',
              padding: '0.9rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isCompiling ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isCompiling ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: isCompiling ? 'none' : 'var(--shadow-glow)',
              transition: 'all 0.2s ease'
            }}
          >
            {isCompiling ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Compiling & Deduplicating Notes...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} /> Compile {notes.length} Notes into Exam Summary
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Output Area / Formatted Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Compiled Exam Summary
            </span>

            {compilationResult && (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} /> Merge Complete
              </span>
            )}
          </div>

          {/* Skeleton Loader while processing */}
          {isCompiling && (
            <div className="glass-panel" style={{ padding: '1.75rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="skeleton-box" style={{ height: '32px', width: '60%' }} />
              <div className="skeleton-box" style={{ height: '20px', width: '90%' }} />
              <div className="skeleton-box" style={{ height: '20px', width: '75%' }} />
              <div className="skeleton-box" style={{ height: '24px', width: '40%', marginTop: '1rem' }} />
              <div className="skeleton-box" style={{ height: '18px', width: '85%' }} />
              <div className="skeleton-box" style={{ height: '18px', width: '80%' }} />
              <div className="skeleton-box" style={{ height: '18px', width: '88%' }} />
            </div>
          )}

          {/* Blank Placeholder if no compilation yet */}
          {!isCompiling && !compilationResult && (
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '420px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                color: 'var(--accent-light)',
                border: '1px solid var(--border-color)'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Notes Compiled Yet</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', marginBottom: '1.5rem' }}>
                Add or upload your note snippets on the left, then click <strong>"Compile Notes"</strong> to generate your unified exam summary.
              </p>
              <button
                onClick={() => setShowSampleModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent-primary)',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-light)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={15} /> Try preset sample notes
              </button>
            </div>
          )}

          {/* Compiled Output View */}
          {!isCompiling && compilationResult && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '1.75rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)'
            }}>
              {/* Output Action Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    id="copy-summary-btn"
                    onClick={handleCopy}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: copied ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                      color: copied ? 'var(--success)' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    id="download-txt-btn"
                    onClick={handleDownloadTxt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} /> TXT
                  </button>

                  <button
                    id="download-pdf-btn"
                    onClick={handleDownloadPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} /> PDF
                  </button>
                </div>

                {/* Practice Quiz Trigger */}
                <button
                  id="generate-quiz-btn"
                  onClick={() => onOpenQuiz(compilationResult)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <HelpCircle size={15} /> Generate Practice Quiz
                </button>
              </div>

              {/* Conflict / Confidence Alert Box if conflicts detected */}
              {compilationResult.conflicts && compilationResult.conflicts.length > 0 && (
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--warning)' }}>
                    <AlertTriangle size={18} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--warning)' }}>
                      Conflict Flag Detected Across Notes
                    </h4>
                  </div>
                  {compilationResult.conflicts.map((conf, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                      <strong>{conf.topic}:</strong> {conf.details}
                    </div>
                  ))}
                </div>
              )}

              {/* Source Distribution Stats Bar */}
              {compilationResult.sourceStats && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <BarChart2 size={14} color="var(--accent-light)" /> Note Source Contributions
                  </div>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', background: 'var(--bg-tertiary)' }}>
                    {compilationResult.sourceStats.map((st, i) => (
                      <div
                        key={i}
                        style={{
                          width: `${st.contributionPct}%`,
                          background: i % 3 === 0 ? 'var(--accent-primary)' : i % 3 === 1 ? '#3b82f6' : '#10b981'
                        }}
                        title={`${st.title}: ${st.contributionPct}%`}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {compilationResult.sourceStats.map((st, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: i % 3 === 0 ? 'var(--accent-primary)' : i % 3 === 1 ? '#3b82f6' : '#10b981'
                        }} />
                        {st.title} ({st.contributionPct}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered Summary Content */}
              <div className="summary-markdown">
                <div dangerouslySetInnerHTML={{
                  __html: compilationResult.summaryMarkdown
                    .replace(/^# (.*$)/gim, '<h1 style="color:var(--accent-light); margin-bottom:0.75rem;">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 style="color:var(--text-primary); margin-top:1.25rem; margin-bottom:0.5rem;">$2</h2>')
                    .replace(/^### (.*$)/gim, '<h3 style="color:var(--text-secondary); margin-top:1rem; margin-bottom:0.4rem;">$3</h3>')
                    .replace(/^\- (.*$)/gim, '<li style="margin-bottom:0.4rem;">$1</li>')
                    .replace(/`\[Source: (.*?)\]`/gi, '<span class="source-tag">🏷️ Source: $1</span>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              </div>

              {/* Key Terms Pill Grid */}
              {compilationResult.keyTerms && compilationResult.keyTerms.length > 0 && (
                <div style={{ marginTop: '2rem', pt: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '0.75rem' }}>
                    <Tag size={15} /> Key Exam Terminology
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {compilationResult.keyTerms.map((kt, i) => (
                      <div key={i} style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{kt.term}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{kt.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preset Samples Modal */}
      <SampleNotesModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
}
