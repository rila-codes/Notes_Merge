import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../db.js';

const router = express.Router();

// Smart Local Fallback Compiler (used when API key is missing or quota exceeded)
function runLocalCompiler(notes, compression = 'medium') {
  const noteList = notes.map((n, i) => ({
    id: n.id || `Note ${i + 1}`,
    title: n.title || `Note ${i + 1}`,
    text: (n.text || n.content || '').trim()
  })).filter(n => n.text.length > 0);

  if (noteList.length === 0) {
    throw new Error('No readable note text provided.');
  }

  // Extract common words for topic title
  const titleKeywords = noteList
    .map(n => n.title)
    .join(' ')
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 3);

  const topicTitle = titleKeywords.length > 0
    ? titleKeywords[0].toUpperCase() + titleKeywords[0].slice(1) + ' Study Summary'
    : 'Unified Study Summary';

  // Process lines across notes
  const lineSources = [];
  const keyTermsMap = new Map();
  const conflicts = [];
  const numbersFound = new Map(); // to detect number/date conflicts

  noteList.forEach(note => {
    const lines = note.text.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
    
    lines.forEach(line => {
      // Look for key term definitions like "Term: definition" or "Term - definition"
      const defMatch = line.match(/^[\*\-•]?\s*\*\*?([^\*:\-]+)\*\*?[:\-]\s*(.+)/i);
      if (defMatch) {
        const term = defMatch[1].trim();
        const def = defMatch[2].trim();
        if (!keyTermsMap.has(term.toLowerCase())) {
          keyTermsMap.set(term.toLowerCase(), { term, definition: def });
        }
      }

      // Check for numbers/dates to detect conflicts
      const numMatches = line.matchAll(/\b(\d+(?:\.\d+)?)\s*(years|hours|days|%|BC|AD|m|km|kg|V|A|Hz)?\b/gi);
      for (const m of numMatches) {
        const key = m[2] ? `${m[2].toLowerCase()}` : 'value';
        if (!numbersFound.has(key)) {
          numbersFound.set(key, []);
        }
        numbersFound.get(key).push({ value: m[1], note: note.title, line });
      }

      lineSources.push({ line, noteId: note.title });
    });
  });

  // Check conflicts in numbers (if two notes mention different numbers for same context)
  numbersFound.forEach((entries, unit) => {
    if (entries.length > 1) {
      const uniqueValues = [...new Set(entries.map(e => e.value))];
      if (uniqueValues.length > 1) {
        conflicts.push({
          topic: `Numerical / Value Difference (${unit})`,
          details: `Found contradictory values across notes: ${entries.map(e => `"${e.value}${unit !== 'value' ? ' ' + unit : ''}" in ${e.note}`).join(' vs ')}`,
          notesInvolved: [...new Set(entries.map(e => e.note))],
          severity: 'warning'
        });
      }
    }
  });

  // Group sentences/lines by topic or bullet points
  const rawBullets = lineSources.map(ls => {
    // Clean bullet symbols
    let cleaned = ls.line.replace(/^[\*\-•\d\.]+\s*/, '');
    return { cleaned, source: ls.noteId };
  });

  // Deduplicate near identical bullets
  const uniqueBullets = [];
  const seenTexts = new Set();

  rawBullets.forEach(b => {
    const key = b.cleaned.toLowerCase().replace(/[^\w]/g, '');
    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      uniqueBullets.push(b);
    } else {
      // Add source note to existing bullet source
      const existing = uniqueBullets.find(ub => ub.cleaned.toLowerCase().replace(/[^\w]/g, '') === key);
      if (existing && !existing.source.includes(b.source)) {
        existing.source += `, ${b.source}`;
      }
    }
  });

  // Adjust density based on compression
  let processedBullets = uniqueBullets;
  if (compression === 'short') {
    processedBullets = uniqueBullets.slice(0, Math.ceil(uniqueBullets.length * 0.5));
  } else if (compression === 'detailed') {
    // Keep all
  }

  // Format Markdown
  let markdown = `# ${topicTitle}\n\n`;
  markdown += `*Compiled from ${noteList.length} note sources with density set to **${compression.toUpperCase()}**.*\n\n`;

  markdown += `## 📌 Core Concepts & Key Bullet Points\n`;
  processedBullets.forEach(b => {
    // Highlight key terms in bold if not already bold
    let text = b.cleaned;
    if (!text.includes('**')) {
      const words = text.split(' ');
      if (words.length > 3) {
        text = `**${words[0]} ${words[1]}** ${words.slice(2).join(' ')}`;
      }
    }
    markdown += `- ${text}  \`[Source: ${b.source}]\`\n`;
  });

  if (keyTermsMap.size > 0) {
    markdown += `\n## 📚 Key Glossary & Definitions\n`;
    Array.from(keyTermsMap.values()).forEach(kt => {
      markdown += `- **${kt.term}**: ${kt.definition}\n`;
    });
  }

  markdown += `\n## 💡 Summary Takeaways\n`;
  markdown += `- Integrated ${processedBullets.length} core findings from your uploaded notes.\n`;
  markdown += `- Formatted specifically for rapid exam revision and retention.\n`;

  return {
    topicTitle,
    summaryMarkdown: markdown,
    conflicts: conflicts.slice(0, 3), // Max 3 flags
    keyTerms: Array.from(keyTermsMap.values()).slice(0, 8),
    sourceStats: noteList.map(n => ({
      title: n.title,
      charCount: n.text.length,
      contributionPct: Math.round((n.text.length / noteList.reduce((acc, x) => acc + x.text.length, 0)) * 100) || 10
    }))
  };
}

// POST /api/compile
router.post('/compile', async (req, res) => {
  try {
    const { notes, compression = 'medium', customApiKey, userId } = req.body;

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of notes to compile.' });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    let result = null;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const formattedNotesInput = notes.map((n, i) => 
          `--- NOTE ${i + 1} (Source: ${n.title || 'UntitledNote ' + (i+1)}) ---\n${n.text || n.content}\n`
        ).join('\n');

        const prompt = `
You are an expert study assistant. You will be given multiple sets of partial, messy, or overlapping notes on the same topic.
Merge them into a single, clean, well-organized summary suitable for last-minute exam revision.
Compression setting: ${compression.toUpperCase()} (short = ultra-concise cheat sheet, medium = balanced summary, detailed = comprehensive review).

Follow these rules strictly:
1. Remove duplicate information across notes.
2. Organize by subtopics with clear headings (Markdown # and ##).
3. Use concise bullet points and highlight key terms in **bold**.
4. Tag every major bullet point or section with its original source note indicator, e.g., \`[Source: Note 1]\` or \`[Source: Note 1 & 2]\`.
5. If you detect any contradictory information (conflicting dates, formulas, names, or numbers) between the original notes, detail them in a "conflicts" list.
6. Do NOT add information not present in the original notes.

Return ONLY a JSON object formatted as follows:
{
  "topicTitle": "Main Subject Title",
  "summaryMarkdown": "# Title\\n\\n## Subtopic 1\\n- **Bullet 1** text \`[Source: Note 1]\`\\n...",
  "conflicts": [
    {
      "topic": "Conflict topic",
      "details": "Description of contradiction between notes",
      "notesInvolved": ["Note 1", "Note 2"],
      "severity": "warning"
    }
  ],
  "keyTerms": [
    { "term": "Term Name", "definition": "Brief definition" }
  ]
}

Notes to merge:
${formattedNotesInput}
`;

        const response = await model.generateContent(prompt);
        const textResponse = response.response.text();
        
        // Extract JSON from response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          result = {
            topicTitle: parsed.topicTitle || 'Compiled Study Summary',
            summaryMarkdown: parsed.summaryMarkdown,
            conflicts: parsed.conflicts || [],
            keyTerms: parsed.keyTerms || [],
            sourceStats: notes.map((n, i) => ({
              title: n.title || `Note ${i + 1}`,
              charCount: (n.text || n.content || '').length,
              contributionPct: Math.round(100 / notes.length)
            }))
          };
        }
      } catch (geminiError) {
        console.warn('Gemini API call warning (using fallback engine):', geminiError.message);
      }
    }

    // Fallback if no API key or API call failed
    if (!result) {
      result = runLocalCompiler(notes, compression);
    }

    // Update user stats if logged in
    if (userId) {
      try {
        const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId);
        if (stats) {
          db.prepare('UPDATE user_stats SET topics_compiled = topics_compiled + 1, last_active = CURRENT_TIMESTAMP WHERE user_id = ?').run(userId);
        } else {
          db.prepare('INSERT INTO user_stats (user_id, topics_compiled, streak_days) VALUES (?, 1, 1)').run(userId);
        }

        // Save compilation history
        const compId = 'comp_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        db.prepare('INSERT INTO history (id, user_id, title, notes_json, summary_json, compression) VALUES (?, ?, ?, ?, ?, ?)').run(
          compId,
          userId,
          result.topicTitle,
          JSON.stringify(notes),
          JSON.stringify(result),
          compression
        );
      } catch (dbErr) {
        console.error('Failed to update DB history:', dbErr);
      }
    }

    res.json({ success: true, compilation: result });
  } catch (err) {
    console.error('Compilation route error:', err);
    res.status(500).json({ error: err.message || 'Failed to compile notes.' });
  }
});

export default router;
