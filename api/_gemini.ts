import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export const getAI = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to your Vercel Project Settings > Environment Variables, or in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
};

// In-memory cache for serverless function warm instances
interface CacheEntry {
  data: { text: string; sources: any[]; isFallback?: boolean };
  timestamp: number;
}

export const cache: {
  news: Record<string, CacheEntry>;
  sentiment: CacheEntry | null;
  chat: Record<string, CacheEntry>;
} = {
  news: {},
  sentiment: null,
  chat: {}
};

export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export function parseRequestBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}
