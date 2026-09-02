import { setCorsHeaders } from "./_gemini";

export default function handler(req: any, res: any) {
  setCorsHeaders(res);
  res.status(200).json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
}
