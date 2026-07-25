// © 2026 Keith Soyka — GestaltView
// Symbio Coder — LLM prompt templates

export const CODER_PROMPTS = {
  explain: (code: string, language: string) =>
    `Explain this ${language} code clearly using plain language and a metaphor where helpful:\n\n\`\`\`${language}\n${code}\n\`\`\``,

  optimize: (code: string, language: string) =>
    `Optimize this ${language} code for performance, readability, and best practices. Show the improved version with a brief explanation of changes:\n\n\`\`\`${language}\n${code}\n\`\`\``,

  refactor: (code: string, language: string) =>
    `Refactor this ${language} code to improve structure, naming, and maintainability. Show the refactored version with a summary of changes:\n\n\`\`\`${language}\n${code}\n\`\`\``,

  chat: (message: string, codeContext: string, language: string) =>
    `The user is working on the following ${language} code:\n\n\`\`\`${language}\n${codeContext}\n\`\`\`\n\nUser message: ${message}`,
};

export const CODER_SYSTEM_PROMPT =
  `You are Symbio, an AI coding assistant with deep expertise across programming languages. You explain concepts clearly using metaphors and analogies, making complex code approachable. You provide concise, actionable guidance while respecting the user's existing patterns and style.`;
