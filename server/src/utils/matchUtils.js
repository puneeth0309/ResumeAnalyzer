export function similarityScore(resumeSkills, jobSkills, jobId = 'N/A') {
  const candidateSkillSet = new Set(resumeSkills.map(s => s.toLowerCase().trim()));
  const requiredSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()).filter(s => s.length > 0));

  if (requiredSkillSet.size === 0) {
    return 100;
  }

  let intersectionCount = 0;
  for (const skill of candidateSkillSet) {
    if (requiredSkillSet.has(skill)) {
      intersectionCount++;
    }
  }
  
  const score = (intersectionCount / requiredSkillSet.size) * 100;
  const finalScore = Math.round(score);
  
  return finalScore;
}

export function safeJsonParse(rawText) {
  try {
    const cleanedText = rawText.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    return { 
      error: "AI response format error. Could not parse JSON.",
      raw_text_sample: rawText.substring(0, 200) + '...'
    };
  }
}
