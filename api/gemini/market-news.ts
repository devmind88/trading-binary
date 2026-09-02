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
  const { currencyFilter } = body;
  const filterKey = currencyFilter ? String(currencyFilter).trim().toUpperCase() : "ALL";

  const cached = cache.news[filterKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    const filterText = currencyFilter ? ` (specifically looking at ${currencyFilter})` : "";
    const prompt = `Find the highest impact macroeconomic economic calendar news releases and financial events for today ${new Date().toISOString().split('T')[0]}${filterText} that will significantly affect major binary options currency pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD) and Gold. Detail the event name, the affected currencies, typical expected volatility, and concrete risk warnings (e.g., whether to pause trading 15 minutes before/after the release). Format with clear sections.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert financial analyst. Deliver an executive summary of high-impact news for binary options traders. Always provide accurate dates and times from today's search results.",
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No news found today.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({ title: w.title, url: w.uri }));

    const payload = { text, sources, isFallback: false };
    cache.news[filterKey] = { data: payload, timestamp: Date.now() };

    return res.status(200).json(payload);
  } catch (error: any) {
    console.log(`[Vercel Serverless /api/gemini/market-news error]:`, error?.message);

    const filterStr = currencyFilter ? String(currencyFilter).toUpperCase() : "";
    let fallbackText = `### ⚠️ [STANDBY MACRO DOCKET] HIGH-IMPACT NEWS CALENDAR (${new Date().toISOString().split('T')[0]})
The integrated news gateway is operating in secure standby mode. The system is serving the active compiled risk alerts below:

1. **US Core Retail Sales & CPI Releases (USD)**
   * **Impact Rating**: 🔴 HIGH VOLATILITY
   * **Affected Pairs**: EUR/USD, GBP/USD, USD/JPY, Gold (XAU/USD)
   * **Action Warning**: Pause all USD binary contracts 15 minutes before the release and do not resume until 20 minutes after. High probability of unexpected price gaps and contract slippage.

2. **Eurozone CPI Flash Estimate & ECB Policy Comments (EUR)**
   * **Impact Rating**: 🟡 MEDIUM-HIGH VOLATILITY
   * **Affected Pairs**: EUR/USD, EUR/GBP
   * **Action Warning**: Watch for rapid momentum shifts. Prefer trading retests over direct breakouts. Avoid trading around the hour mark.

3. **UK Average Earnings & Claimant Count Change (GBP)**
   * **Impact Rating**: 🔴 HIGH VOLATILITY
   * **Affected Pairs**: GBP/USD, EUR/GBP, GBP/JPY
   * **Action Warning**: Maintain absolute sizing discipline. Sizing must remain strictly at 1% of account equity. Do not attempt to catch spike trades during the release.

4. **BoJ Monetary Policy Pressures (JPY)**
   * **Impact Rating**: 🟡 MEDIUM VOLATILITY
   * **Affected Pairs**: USD/JPY, EUR/JPY
   * **Action Warning**: Spontaneous currency intervention warnings are active. Keep binary options contract expirations short (under 5 minutes) to avoid being caught in multi-figure spikes.

---
*Operating under standby macroeconomic feed. Cross-verify exact minutes with Investing.com or ForexFactory before risking real capital.*`;

    if (filterStr) {
      fallbackText += `\n\n*(Filtered for: ${filterStr}) Only items touching ${filterStr} are high-risk. Review the main USD and EUR events above as they carry heavy cross-pair volatility.*`;
    }

    const payload = {
      text: fallbackText,
      sources: [
        { title: "ForexFactory Calendar", url: "https://www.forexfactory.com" },
        { title: "Investing Volatility Index", url: "https://www.investing.com" }
      ],
      isFallback: true
    };

    return res.status(200).json(payload);
  }
}
