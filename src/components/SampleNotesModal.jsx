import React from 'react';
import { X, BookOpen, Sparkles, Check } from 'lucide-react';

const SAMPLES = [
  {
    id: 'bio',
    category: 'Biology / Cell Respiration',
    description: 'Contains 3 partial notes from lecture, textbook, and online forum with overlapping facts & 1 date conflict.',
    notes: [
      {
        title: 'Class Lecture Notes (Prof. Miller)',
        text: `Cellular respiration converts glucose into ATP.
3 main stages: Glycolysis, Krebs Cycle (TCA), and Electron Transport Chain (ETC).
Glycolysis occurs in cytoplasm and yields 2 ATP net + 2 NADH. Does NOT require oxygen (anaerobic).
Krebs cycle happens in mitochondrial matrix, produces 2 ATP, 6 NADH, 2 FADH2 per glucose molecule.
ETC happens in inner mitochondrial membrane (cristae). Highest ATP yield: 32-34 ATP.
Total theoretical yield: ~36-38 ATP per glucose.
Discovery of Krebs cycle was in 1937.`
      },
      {
        title: 'Textbook Summary (Ch. 7)',
        text: `Respiration pathway summary:
- Glycolysis breaks 6-carbon glucose into 2 pyruvate molecules (3 carbons each).
- Acetyl-CoA formation links glycolysis to citric acid cycle.
- Citric Acid Cycle discovered by Hans Krebs in 1937.
- Electron Transport Chain uses oxygen as the final electron acceptor to produce H2O.
- Proton gradient drives ATP Synthase enzyme (chemiosmosis).
- Oxidative phosphorylation produces majority of cellular energy.`
      },
      {
        title: 'Study Group Jotted Notes',
        text: `Glycolysis = cytoplasm. Anaerobic. 2 ATP net.
Krebs cycle discovered in 1945 (wait or 1937?).
Krebs = mitochondrial matrix. Needs oxygen indirectly.
ETC = inner membrane. Needs Oxygen directly! Final acceptor = O2 forming H2O.
ATP Synthase acts like a rotary motor.
Total ATP count is usually 30-32 in real eukaryotic cells due to transport losses.`
      }
    ]
  },
  {
    id: 'cs',
    category: 'Computer Science / Sorting Algorithms',
    description: 'Notes on QuickSort, MergeSort, and BubbleSort with performance metrics.',
    notes: [
      {
        title: 'Data Structures Lecture 4',
        text: `Sorting algorithms breakdown:
QuickSort: Divide and conquer algorithm. Pick pivot element, partition array.
Average time complexity: O(n log n). Worst case: O(n^2) if pivot selection is poor (e.g. already sorted array).
Space complexity: O(log n) for call stack.
MergeSort: Stable sorting algorithm. Divide array into halves, recursively sort, merge.
Time complexity: O(n log n) in ALL cases (best, average, worst).
Space complexity: O(n) auxiliary space required for merge arrays.`
      },
      {
        title: 'Lab Review Notes',
        text: `BubbleSort: Simple comparison-based algorithm. Repeatedly swap adjacent elements if wrong order.
Best case time complexity: O(n) when array is already sorted.
Average/Worst time: O(n^2). Space complexity: O(1) in-place sorting.
QuickSort in-place variant is faster in practice than MergeSort due to cache efficiency, despite worst case O(n^2).
MergeSort preferred for linked lists and external sorting.`
      }
    ]
  },
  {
    id: 'history',
    category: 'History / World War I Origins',
    description: 'Messy history notes covering the alliance system, July Crisis, and spark of WWI.',
    notes: [
      {
        title: 'History Class Notes',
        text: `MAIN causes of WWI: Militarism, Alliances, Imperialism, Nationalism.
Spark: Assassination of Archduke Franz Ferdinand of Austria in Sarajevo on June 28, 1914.
Assassinated by Gavrilo Princip, member of Black Hand group.
Triple Entente: Great Britain, France, Russia.
Triple Alliance: Germany, Austria-Hungary, Italy (later joined Central Powers except Italy switched).
Austria-Hungary declared war on Serbia on July 28, 1914.`
      },
      {
        title: 'Exam Cram Sheet',
        text: `June 28, 1914 - Franz Ferdinand assassinated in Sarajevo.
July Crisis 1914 led to rapid escalation due to network of treaties.
Germany gave Austria-Hungary a "blank check" support.
Schlieffen Plan: German military plan to quickly defeat France through Belgium before Russia mobilizes.
WWI officially ended with Armistice on November 11, 1918 (11th hour of 11th day of 11th month).`
      }
    ]
  }
];

export default function SampleNotesModal({ isOpen, onClose, onLoadSample }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '620px',
        width: '100%',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Load Preset Sample Notes</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pick a sample dataset to test NoteMerge AI compilation instantly.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
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
        </div>

        {/* Sample List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {SAMPLES.map(sample => (
            <div
              key={sample.id}
              onClick={() => {
                onLoadSample(sample.notes);
                onClose();
              }}
              style={{
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
              className="sample-item-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sample.category}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--accent-light)',
                    fontWeight: 600
                  }}>
                    {sample.notes.length} Notes
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {sample.description}
                </p>
              </div>

              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                <Sparkles size={14} /> Load Notes
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
