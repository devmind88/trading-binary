import { getAI, cache, CACHE_TTL_MS, parseRequestBody, setCorsHeaders } from "../_gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = parseRequestBody(req);
  const { prompt } = body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const promptKey = String(prompt).trim().toLowerCase();
  const cached = cache.chat[promptKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    const systemInstruction = 
      "You are the Core Intelligence and AI Trade Coach of an Executive Trading Operating System for Binary Options.\n" +
      "Your objective is to help traders cultivate supreme psychological discipline, understand strategies, and analyze market news.\n" +
      "RULES OF ENGAGEMENT:\n" +
      "1. You NEVER provide explicit buy/sell buy-in signals or precise price prediction advice (e.g. 'EUR/USD will go up at 14:00, buy now'). If the user asks for a direct prediction, explain that providing direct buy/sell trade predictions goes against system safety protocols, and guide them to check their entry checklist and trend confirmation rules instead.\n" +
      "2. You MUST use Google Search grounding to obtain up-to-date financial news, economic calendar events, and real-time asset market sentiments when asked about current events.\n" +
      "3. Structure your responses professionally with clean typography and bullet points, utilizing markdown.\n" +
      "4. Be authoritative yet calm, promoting disciplined, structured, risk-aware trading (such as keeping position sizes strictly at 1-2% of capital, avoiding martingale doubling, and walking away after consecutive losses).\n" +
      "5. TRADING ADVICE CONSTRAINT: You can give trading advice ONLY if it is highly accurate and directly accounts for recent economic news breaks and upcoming macroeconomic calendar data. Before formulating any trading advice, you must check for recent high-impact events (e.g., central bank rate changes, CPI, retail sales, employment metrics, GDP). If a major news break occurred recently or is scheduled within the hour, warn the user clearly about the active news break, explain the specific currency pair volatility, and advise them to pause or reduce contract sizes. If no recent news breaks exist, explicitly specify that there are no active news-break drivers, and advise technical discipline.";

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No response generated.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Map grounding chunks to clean links
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({ title: w.title, url: w.uri }));

    const payload = { text, sources, isFallback: false };
    cache.chat[promptKey] = { data: payload, timestamp: Date.now() };

    return res.status(200).json(payload);
  } catch (error: any) {
    console.log(`[Vercel Serverless /api/gemini/chat error]:`, error?.message);
    
    const query = prompt.toLowerCase();
    let text = "";
    
    if (query.includes("tilt") || query.includes("discipline") || query.includes("emotion") || query.includes("lose") || query.includes("loss")) {
      text = "### 🧠 AI TRADE COACH: DISCIPLINE & EMOTIONAL RECOVERY (STANDBY FEED)\n\n" +
             "It looks like you are managing trading pressure or experiencing psychological friction. Let's recalibrate immediately:\n\n" +
             "1. **Execute the 'Walk Away' Rule**: If you have suffered consecutive losses, your prefrontal cortex is flooded with cortisol. You cannot make logical decisions in this state. Close your broker platform immediately.\n" +
             "2. **Acknowledge the Outcome**: In binary options, every contract has a discrete outcome. Accept the loss as the predefined cost of business. Do not double down or attempt 'revenge trading'.\n" +
             "3. **Examine Sizing Limits**: Your position size must never exceed 1-2% of your overall capital. Doubling trade size (Martingale) after a loss is mathematically guaranteed to blow your account eventually.\n\n" +
             "*\"A master trader accepts risk, protects capital, and honors the plan over the impulse.\"* Pause for 15 minutes, hydrate, and return only when your pulse is calm.";
    } else if (query.includes("support") || query.includes("resistance") || query.includes("strategy") || query.includes("pattern") || query.includes("retest")) {
      text = "### 📈 AI TRADE COACH: STRATEGY & LEVEL ANALYSIS (STANDBY FEED)\n\n" +
             "To trade strategies like the **5-Minute Retest** or **Trend Continuation** safely, observe these core structural guidelines:\n\n" +
             "* **Verify Support / Resistance**: Ensure you are not buying directly into a key major resistance level or selling directly into a key major support level on the higher timeframe (15-min or 1-hour).\n" +
             "* **Wait for the Retest Candle**: In a breakout scenario, do not chase the breakout candle. Wait for the price to return to the broken level (the retest), look for a rejection wick, and enter on the next candle's open.\n" +
             "* **Check Moving Averages**: Confirm the trend direction with the 20 EMA and 50 EMA. Only take BUY call contracts if the price is holding above the EMAs, and SELL put contracts if the price is below.\n\n" +
             "Maintain absolute rules. Consistency of execution is more valuable than any single trade result.";
    } else {
      text = "### 🌐 AI TRADE COACH: OPERATIONAL BRIEF (STANDBY FEED)\n\n" +
             `Received request: "${prompt}"\n\n` +
             "Here is your executive operational briefing for today:\n\n" +
             "* **Risk Control**: Maintain strict risk limits. No single trade should exceed 1-2% of account balance. No exceptions.\n" +
             "* **News Watch**: High volatility is active in several currency pairs today. Verify news release schedules before placing contracts.\n" +
             "* **Daily Strategy Check**: Keep your win-rate balanced. If you reach your daily profit target, stop. If you hit your daily max loss limit, stop immediately.\n\n" +
             (!process.env.GEMINI_API_KEY ? "*💡 Note for Vercel deployment: To enable live Google Search Grounding with Gemini, configure your `GEMINI_API_KEY` in Vercel Project Settings > Environment Variables.*" : "");
    }

    const payload = { 
      text, 
      sources: [
        { title: "NeuroTactix Core Operating Guidelines", url: "https://trading-binary-options.vercel.app" },
        { title: "Gemini API Documentation", url: "https://ai.google.dev/gemini-api" }
      ],
      isFallback: true 
    };

    return res.status(200).json(payload);
  }
}
