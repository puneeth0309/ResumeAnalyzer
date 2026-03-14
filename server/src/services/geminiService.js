const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_MODEL = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const RESUME_SCHEMA = {
  type: "OBJECT",
  properties: {
    skills: {
      type: "ARRAY",
      description: "List of key skills extracted and interpersonal abilities from the resume.",
      items: { type: "STRING" }
    },
    experience: {
      type: "ARRAY",
      description: "List of detailed work experience entries.",
      items: {
        type: "OBJECT",
        properties: {
          Title: { type: "STRING" },
          Company: { type: "STRING" },
          Dates: { type: "STRING", description: "Start date to end date (e.g., 'Jan 2020 - Present')." },
          Description: { type: "STRING", description: "Summary of achievements/responsibilities for this role." }
        },
        required: ["Title", "Company", "Dates", "Description"]
      }
    },
    education: {
      type: "ARRAY",
      description: "List of educational degrees and certifications.",
      items: {
        type: "OBJECT",
        properties: {
          Degree: { type: "STRING" },
          Institution: { type: "STRING" },
          Dates: { type: "STRING", description: "Year range or date of completion." }
        },
        required: ["Degree", "Institution", "Dates"]
      }
    },
    project_highlights: {
      type: "ARRAY",
      description: "List of personal or professional project descriptions.",
      items: {
        type: "OBJECT",
        properties: {
          ProjectName: { type: "STRING" },
          Technologies: { type: "STRING", description: "Key technologies used in the project." },
          Description: { type: "STRING", description: "Summary of the project and your role/impact." }
        },
        required: ["ProjectName", "Technologies", "Description"]
      }
    }
  },
  required: ["skills", "experience", "education", "project_highlights"]
};


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

/**
 * Analyzes resume text using the Gemini API to return structured JSON data.
 * @param {string} resumeText - The raw text of the resume.
 * @returns {Promise<object>} The structured resume data.
 */
export async function analyzeResume(resumeText) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const systemInstruction = `You are a world-class AI document parser. Your sole task is to analyze the provided resume text and extract all relevant information (skills, experience, education, projects), strictly conforming to the provided JSON schema. Do not add any conversational text or markdown formatting outside of the JSON structure itself. Use 'N/A' or an empty array/string if data is not found.`;

  const userQuery = `Analyze and extract the required information from the following resume text:\n\nRESUME TEXT:\n---\n${resumeText}\n---`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA,
      temperature: 0.1 
    },
  };

  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      const errorMessage = result?.error?.message || 'LLM returned an empty response or an error.';
      throw new Error(`API Error: ${errorMessage}`);
    }

    const parsedJson = JSON.parse(textOutput);
    return parsedJson;

  } catch (err) {
    console.error('Gemini API Error:', err.message);
    throw new Error(`Failed to analyze resume: ${err.message}`);
  }
}

export default { analyzeResume };
