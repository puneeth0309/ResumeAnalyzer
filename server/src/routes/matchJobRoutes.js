import express from 'express';
import pool from "../db.js";
import authMiddleware from '../middleware/authMiddleware.js';
import { similarityScore, safeJsonParse } from '../utils/matchUtils.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_MODEL = 'gemini-2.5-flash'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const router = express.Router();

const DEBUG_SCORING = true;

/**
 * Executes a fetch request with exponential backoff for retries.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options.
 * @param {number} maxRetries - Maximum number of retries.
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        continue;
      }
      throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached.');
}

router.post("/job-matches", authMiddleware, async (req, res) => {
  try {
    const { resume_id } = req.body;

    if (!resume_id) {
      return res.status(400).json({ success: false, error: "resume_id is required." });
    }
    
    const REASONING_FALLBACK = { 
      reasoning: "Analysis not available or failed.", 
      fit_skills: [], 
      missing_skills: [] 
    };

    const existingMatches = await pool.query(
      `SELECT m.job_id, m.match_score, m.reasoning, j.title 
       FROM matches m
       JOIN jobs j ON m.job_id = j.id
       WHERE m.resume_id = $1
       ORDER BY m.match_score DESC`,
      [resume_id]
    );

    if (existingMatches.rows.length > 0) {
      return res.json({
        success: true,
        data: existingMatches.rows.map(r => ({
          job_id: r.job_id,
          title: r.title,
          match_score: r.match_score,
          reasoning: r.reasoning
        }))
      });
    }

    const resume = await pool.query(
      `SELECT analysis_result FROM resumes WHERE id = $1`,
      [resume_id]
    );

    if (resume.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Resume not found" });
    }

    const skills = resume.rows[0].analysis_result?.skills || [];

    if (!skills.length) {
      return res.status(400).json({ success: false, error: "Resume has no extracted skills." });
    }

    const jobsData = await pool.query(
      `SELECT id, title, description, skills_required FROM jobs`
    );

    const results = jobsData.rows.map(job => {
      const requiredSkills = Array.isArray(job.skills_required)
        ? job.skills_required
        : job.skills_required?.split(",").map(s => s.trim()) || [];

      const score = similarityScore(skills, requiredSkills, job.id);

      return {
        job_id: job.id,
        title: job.title,
        match_score: score,
        skills_required: requiredSkills
      };
    });

    const topJobs = results.sort((a, b) => b.match_score - a.match_score).slice(0, 10);

    const prompt = `
      Candidate Skills: [${skills.join(", ")}]

      Jobs to analyze:
      ${JSON.stringify(topJobs)}

      For each job ID, provide a brief reasoning, a list of matching skills (fit_skills), and a list of missing skills (missing_skills).
      Respond ONLY as JSON format:
      { job_id:{ reasoning, fit_skills, missing_skills } }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const rawResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const reasoning = safeJsonParse(rawResponse);

    if (!reasoning || reasoning.error) {
      throw new Error("AI did not return reasoning JSON");
    }

    for (const job of topJobs) {
      const jobReasoning = reasoning[job.job_id] || REASONING_FALLBACK;
      
      await pool.query(
        `INSERT INTO matches (resume_id, job_id, match_score, reasoning, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          resume_id,
          job.job_id,
          job.match_score,
          JSON.stringify(jobReasoning)
        ]
      );
    }
    return res.json({
      success: true,
      data: topJobs.map(job => ({
        ...job,
        ...(reasoning[job.job_id] || REASONING_FALLBACK)
      }))
    });

  } catch (err) {
    console.error("Match API Error:", err);
    client.release();
    res.status(500).json({ success: false, error: "Failed to match jobs." });
  }
});

export default router;
