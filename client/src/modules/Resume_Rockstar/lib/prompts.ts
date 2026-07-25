// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — LLM prompt templates

export const RESUME_PROMPTS = {
  improveObjective: (current: string) =>
    `You are an expert career coach. Improve this objective statement to be compelling and achievement-focused:\n\nCurrent: "${current}"\n\nProvide 3 improved alternatives, each highlighting different strengths.`,

  enhanceExperience: (company: string, title: string, description: string) =>
    `You are a resume expert. Enhance this work experience entry with strong action verbs and measurable impact:\n\nCompany: ${company}\nTitle: ${title}\nCurrent: "${description}"\n\nReturn the enhanced version with metrics where possible.`,

  suggestSkills: (industry: string, experience: string) =>
    `Based on this background, suggest 5–10 relevant skills for ${industry} roles:\n\nExperience: ${experience}\n\nReturn JSON: { "skills": [...], "reasoning": "..." }`,

  reviewResume: (content: string) =>
    `Review this resume and provide 3–5 specific, actionable improvements focused on clarity, impact, and ATS compatibility:\n\n${content}`,
};

export const RESUME_SYSTEM_PROMPT =
  `You are an expert resume writer and career coach with 15+ years of experience helping professionals across all industries. Your goal is to help users create compelling, achievement-focused resumes that stand out.`;
