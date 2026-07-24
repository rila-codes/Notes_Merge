import React, { useState, useEffect } from 'react';
import { X, HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizModal({ isOpen, onClose, compilation, customApiKey }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen && compilation) {
      fetchQuiz();
    }
  }, [isOpen, compilation]);

  const fetchQuiz = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResult(false);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryMarkdown: compilation.summaryMarkdown,
          topicTitle: compilation.topicTitle,
          customApiKey
        })
      });

      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIndex });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
      // Trigger celebratory confetti if score >= 3
      const score = calculateScore();
      if (score >= 3) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const calculateScore = () => {
    let count = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        count++;
      }
    });
    return count;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '650px',
        width: '100%',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--success-bg)', color: 'var(--success)' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Auto Exam Practice Quiz</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Testing comprehension for: <strong>{compilation?.topicTitle}</strong>
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--success)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Generating practice questions from your summary...</p>
          </div>
        )}

        {/* Active Quiz Question */}
        {!loading && !showResult && currentQ && (
          <div>
            {/* Question Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Completed</span>
            </div>

            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: 'var(--success)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Question Text */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const isAnswered = selectedAnswers[currentIndex] !== undefined;
                const isCorrect = optIdx === currentQ.correctIndex;

                let optionBg = 'var(--bg-card)';
                let optionBorder = 'var(--border-color)';
                let textColor = 'var(--text-primary)';

                if (isAnswered) {
                  if (isCorrect) {
                    optionBg = 'var(--success-bg)';
                    optionBorder = 'var(--success)';
                    textColor = 'var(--success)';
                  } else if (isSelected && !isCorrect) {
                    optionBg = 'var(--danger-bg)';
                    optionBorder = 'var(--danger)';
                    textColor = 'var(--danger)';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    style={{
                      padding: '0.9rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      background: optionBg,
                      border: `1px solid ${optionBorder}`,
                      color: textColor,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    <span>{optionText}</span>
                    {isAnswered && isCorrect && <CheckCircle2 size={18} color="var(--success)" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="var(--danger)" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {selectedAnswers[currentIndex] !== undefined && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Explanation:</strong> {currentQ.explanation}
              </div>
            )}

            {/* Next / Finish Button */}
            {selectedAnswers[currentIndex] !== undefined && (
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {currentIndex < questions.length - 1 ? (
                  <>Next Question <ArrowRight size={16} /></>
                ) : (
                  <>See Final Score <Award size={16} /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Final Score View */}
        {!loading && showResult && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--accent-glow)',
              color: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid var(--accent-primary)'
            }}>
              <Award size={36} />
            </div>

            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Quiz Completed!
            </h4>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You scored <strong style={{ color: 'var(--success)', fontSize: '1.4rem' }}>{calculateScore()}</strong> out of {questions.length}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={fetchQuiz}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={16} /> Retake Quiz
              </button>

              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
