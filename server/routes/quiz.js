import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Local fallback quiz generator
function generateLocalQuiz(summaryText, topicTitle = 'Study Topic') {
  const lines = summaryText.split(/[\r\n]+/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
  
  const questions = [];

  // Generate 5 questions from lines/bullet points
  for (let i = 0; i < Math.min(5, Math.max(3, lines.length)); i++) {
    const rawLine = (lines[i] || `Key concept in ${topicTitle}`).replace(/^[\*\-•\d\.]+\s*/, '').replace(/\[Source: [^\]]+\]/g, '').trim();
    
    // Extract key phrase
    const words = rawLine.split(' ');
    const term = words.slice(0, 3).join(' ').replace(/[^\w\s]/g, '');
    const context = words.slice(3).join(' ') || 'is a core principle of this topic.';

    questions.push({
      id: i + 1,
      question: `Regarding ${topicTitle}: What is true about ${term.toLowerCase() || 'this topic'}?`,
      options: [
        `${term} ${context}`,
        `${term} is completely unrelated to ${topicTitle}.`,
        `${term} was disproven in early research.`,
        `${term} only applies to external conditions.`
      ],
      correctIndex: 0,
      explanation: `According to your compiled notes: "${rawLine}"`
    });
  }

  // If fewer than 5 questions created, add generic high-yield review questions
  while (questions.length < 5) {
    const qIndex = questions.length + 1;
    questions.push({
      id: qIndex,
      question: `Which of the following best describes the main objective of studying ${topicTitle}?`,
      options: [
        `Synthesizing key concepts and identifying relationships between topics.`,
        `Memorizing unrelated dates without understanding core formulas.`,
        `Ignoring contradictory evidence present in primary sources.`,
        `Relying solely on single unverified notes.`
      ],
      correctIndex: 0,
      explanation: `Synthesizing notes into unified themes enhances active recall for exam preparation.`
    });
  }

  return questions;
}

// POST /api/quiz
router.post('/quiz', async (req, res) => {
  try {
    const { summaryMarkdown, topicTitle, customApiKey } = req.body;

    if (!summaryMarkdown) {
      return res.status(400).json({ error: 'Summary markdown text is required to generate quiz.' });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    let questions = null;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
Based on the following compiled study summary, generate exactly 5 high-yield multiple choice exam practice questions to test student comprehension.

Topic: ${topicTitle || 'Study Notes'}

Summary Content:
${summaryMarkdown}

Return ONLY a JSON array of 5 question objects with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this is correct based on the summary."
  }
]
`;

        const response = await model.generateContent(prompt);
        const textResponse = response.response.text();
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('Quiz generation AI call warning:', err.message);
      }
    }

    if (!questions) {
      questions = generateLocalQuiz(summaryMarkdown, topicTitle);
    }

    res.json({ success: true, questions });
  } catch (err) {
    console.error('Quiz route error:', err);
    res.status(500).json({ error: 'Failed to generate practice quiz.' });
  }
});

export default router;
