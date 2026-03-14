import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { analyzeResume } from '../services/geminiService.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { v2 as cloudinary } from 'cloudinary';

pdfjsLib.GlobalWorkerOptions.workerSrc = null;

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../temp')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
if (!fs.existsSync(path.join(__dirname, '../../temp'))) fs.mkdirSync(path.join(__dirname, '../../temp'));

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files allowed!'));
  }
});

async function extractTextFromPDF(filePath) {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text.trim();
  } catch (err) {
    console.error("PDF extraction failed:", err);
    return "";
  }
}

router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');

    const userId = req.user.id;
    const localFilePath = req.file.path;
    const originalName = req.file.originalname;


    const extractedText = await extractTextFromPDF(localFilePath);

    const analysis = extractedText ? await analyzeResume(extractedText) : { error: 'Could not extract text' };

    const cloudRes = await cloudinary.uploader.upload(localFilePath, {
      folder: 'resumes',
      resource_type: 'raw'
    });

    await pool.query(
      `INSERT INTO resumes (user_id, original_name, file_url, extracted_text, analysis_result, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, originalName, cloudRes.secure_url, extractedText, JSON.stringify(analysis)]
    );

    fs.unlinkSync(localFilePath);
    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      file_url: cloudRes.secure_url,
      original_name: originalName,
      analysis
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, original_name, file_url, created_at, analysis_result
       FROM resumes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Could not fetch resumes' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      `SELECT id, user_id, file_url FROM resumes WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = result.rows[0];
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this resume' });
    }

    if (resume.file_url) {
      try {
        const parts = resume.file_url.split('/');
        const fileName = parts[parts.length - 1] || '';
        const publicId = `resumes/${fileName.split('.').slice(0, -1).join('.')}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (e) {
        console.error('Cloudinary delete failed for resume id', id, e.message || e);
      }
    }

    await pool.query(`DELETE FROM resumes WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error during delete' });
  }
});

export default router;
