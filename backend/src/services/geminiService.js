const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─────────────────────────────────────────────
// PR Analysis
// ─────────────────────────────────────────────

/**
 * Analyze a PR diff for bugs, security issues, code quality, and complexity.
 * Returns structured JSON.
 */
const analyzePullRequest = async (diff, prTitle, prDescription = '') => {
  const prompt = `
You are an expert code reviewer. Analyze the following pull request diff and return a detailed JSON review.

PR Title: ${prTitle}
PR Description: ${prDescription || 'Not provided'}

Git Diff:
\`\`\`diff
${diff.slice(0, 30000)}
\`\`\`

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "summary": "2-3 sentence executive summary of this PR",
  "overallScore": <integer 0-100, higher is better>,
  "bugScore": <integer 0-100>,
  "securityScore": <integer 0-100>,
  "qualityScore": <integer 0-100>,
  "bugs": [
    {
      "file": "path/to/file.js",
      "line": <line number or null>,
      "severity": "critical|high|medium|low",
      "description": "What the bug is",
      "suggestion": "How to fix it"
    }
  ],
  "securityIssues": [
    {
      "file": "path/to/file.js",
      "line": <line number or null>,
      "severity": "critical|high|medium|low",
      "cwe": "CWE-XXX or null",
      "description": "Security vulnerability description",
      "suggestion": "Remediation steps"
    }
  ],
  "codeQuality": [
    {
      "file": "path/to/file.js",
      "issue": "Quality issue description",
      "suggestion": "Improvement suggestion"
    }
  ],
  "complexity": {
    "score": <integer 1-10, 10=very complex>,
    "hotspots": [
      { "file": "path/to/file.js", "reason": "Why this is complex" }
    ],
    "suggestion": "Overall complexity reduction suggestion"
  }
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: try to extract JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini returned non-JSON response');
  }
};

// ─────────────────────────────────────────────
// Embeddings
// ─────────────────────────────────────────────

/**
 * Generate a vector embedding for a text chunk (for semantic search).
 * Uses text-embedding-004 → 768 dimensions.
 */
const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text.slice(0, 8000), // stay within token limit
  });
  return response.embeddings[0].values; // float[]
};

// ─────────────────────────────────────────────
// RAG Answer Generation
// ─────────────────────────────────────────────

/**
 * Given a user query and retrieved code chunks, generate a grounded answer.
 */
const generateSearchAnswer = async (query, codeChunks) => {
  const context = codeChunks
    .map((c, i) => `[${i + 1}] File: ${c.filePath}\n\`\`\`\n${c.content}\n\`\`\``)
    .join('\n\n');

  const prompt = `
You are an AI assistant that answers questions about a codebase.
Use only the code excerpts provided below to answer the question.
Be specific — reference file names and line context when relevant.

Question: ${query}

Code Context:
${context}

Answer (be concise and precise):`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: { temperature: 0.3 },
  });

  return response.text;
};

// ─────────────────────────────────────────────
// Code Explanation
// ─────────────────────────────────────────────

/**
 * Explain a code snippet in plain English.
 */
const explainCode = async (code, language = '') => {
  const prompt = `Explain the following ${language} code in clear, concise terms suitable for a code review.
Focus on: what it does, potential issues, and improvement opportunities.

\`\`\`${language}
${code}
\`\`\``;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: { temperature: 0.3 },
  });

  return response.text;
};

module.exports = {
  analyzePullRequest,
  generateEmbedding,
  generateSearchAnswer,
  explainCode,
};
