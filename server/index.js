import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import compileRoutes from './routes/compile.js';
import quizRoutes from './routes/quiz.js';
import historyRoutes from './routes/history.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer upload setup for note files
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// File parse endpoint (for .txt and .pdf uploads)
app.post('/api/parse-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    let extractedText = '';

    if (originalName.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else {
      // Default to plain text
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      filename: originalName,
      title: originalName.replace(/\.[^/.]+$/, ''),
      text: extractedText
    });
  } catch (err) {
    console.error('File parse error:', err);
    res.status(500).json({ error: 'Failed to extract text from file.' });
  }
});

// Register API routes
app.use('/api', authRoutes);
app.use('/api', compileRoutes);
app.use('/api', quizRoutes);
app.use('/api', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'NoteMerge AI Notes Compiler', timestamp: new Date().toISOString() });
});

// Serve static frontend assets from dist folder
const distPath = path.resolve(__dirname, '../dist');
console.log('📁 Serving static frontend from:', distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('NoteMerge Frontend dist/index.html missing. Run npm run build.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NoteMerge Server running on 0.0.0.0:${PORT}`);
});
