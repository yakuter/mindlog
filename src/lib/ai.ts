const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
const API_KEY_STORAGE = "mindlog_gemini_api_key";

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export type AiAction = "summarize" | "expand" | "rewrite" | "ideas" | "translate";

const SYSTEM_PROMPTS: Record<AiAction, string> = {
  summarize:
    "You are a concise summarizer. Summarize the following note content into clear, brief bullet points. Keep the most important information. Respond in the same language as the input.",
  expand:
    "You are a thoughtful writer. Expand on the following note content with more detail, examples, and deeper explanations. Maintain the same tone and style. Respond in the same language as the input.",
  rewrite:
    "You are an expert editor. Rewrite the following note content to be clearer, better structured, and more polished. Keep the same meaning but improve readability and flow. Respond in the same language as the input.",
  ideas:
    "You are a creative brainstorming assistant. Based on the following note content, generate 5-7 related ideas, questions, or next steps the user could explore. Format as a numbered list. Respond in the same language as the input.",
  translate:
    "You are a professional translator. Detect the language of the input and translate it to English. If it is already in English, translate it to Turkish. Preserve the original formatting, markdown syntax, and structure. Only return the translated text, no explanations. The input will be in the format:\nTITLE: <title>\n---\n<content>\n\nYou must respond in the exact same format:\nTITLE: <translated title>\n---\n<translated content>",
};

const ACTION_LABELS: Record<AiAction, string> = {
  summarize: "Summarize",
  expand: "Expand",
  rewrite: "Rewrite",
  ideas: "Generate Ideas",
  translate: "Translate",
};

export { ACTION_LABELS };

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface AiResult {
  content: string;
  title?: string;
}

export async function runAiAction(
  action: AiAction,
  content: string,
  title?: string
): Promise<AiResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not set. Go to Settings to add your key.");
  }

  if (!content.trim()) {
    throw new Error("Note content is empty. Write something first.");
  }

  let userInput = content;
  if (action === "translate" && title) {
    userInput = `TITLE: ${title}\n---\n${content}`;
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPTS[action] }],
      },
      contents: [
        {
          parts: [{ text: userInput }],
        },
      ],
      generationConfig: {
        temperature: action === "ideas" ? 0.9 : 0.7,
        maxOutputTokens: action === "summarize" ? 512 : 2048,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(
      errData?.error?.message || `API request failed (${response.status})`
    );
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini. Try again.");
  }

  if (action === "translate" && text.includes("TITLE:")) {
    const titleMatch = text.match(/^TITLE:\s*(.+)/m);
    const separatorIdx = text.indexOf("---");
    if (titleMatch && separatorIdx !== -1) {
      return {
        title: titleMatch[1].trim(),
        content: text.slice(separatorIdx + 3).trim(),
      };
    }
  }

  return { content: text };
}
