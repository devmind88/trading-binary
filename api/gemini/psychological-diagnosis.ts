import { getAI, parseRequestBody, setCorsHeaders } from "../_gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = parseRequestBody(req);
  const { 
    totalTrades,
    disciplinedWinRate,
    disciplinedTrades,
    disciplinedPnl,
    emotionalWinRate,
    emotionalTrades,
    emotionalPnl,
    lostProfitPotential,
    strategyCorrelations,
    currentMood
  } = body;

  try {
    const strategySummary = (strategyCorrelations || []).map((s: any) => 
      `- **${s.name}**: Disciplined WR: ${s.disciplinedWinRate}% (${s.disciplinedTrades} trades) vs Emotional WR: ${s.emotionalWinRate}% (${s.emotionalTrades} trades, Emotional PnL: $${s.emotionalPnl})`
    ).join("\n");

    const prompt = `Perform a comprehensive Trading Psychology & Sentiment Analysis Diagnosis for a binary options trader based on the following verified performance metrics:

### TRADER PERFORMANCE & EMOTIONAL CORRELATION DATA:
- **Total Contracts Executed**: ${totalTrades}
- **Disciplined Execution Win Rate**: ${disciplinedWinRate}% (${disciplinedTrades} disciplined trades, Net P&L: $${disciplinedPnl})
- **Emotional / Compromised Win Rate**: ${emotionalWinRate}% (${emotionalTrades} emotional trades, Net P&L: $${emotionalPnl})
- **Win Rate Edge Degradation**: ${Math.max(0, (disciplinedWinRate || 0) - (emotionalWinRate || 0))}% drop when trading emotionally
- **Direct Financial Cost of Emotion (Emotion Tax)**: $${Math.abs(emotionalPnl || 0)}
- **Potential Capital if Emotional Trades were Eliminated**: +$${lostProfitPotential || 0}
- **Current Self-Reported Mood State**: ${currentMood || 'Neutral / Unknown'}

### STRATEGY-SPECIFIC CORRELATIONS:
${strategySummary || 'No setup breakdown available.'}

### REQUIRED OUTPUT SECTIONS:
1. **Executive Psychological Sentiment Synthesis**: Evaluate the psychological state and the severity of emotional interference on the trader's mathematical edge.
2. **Cognitive Distortion & Trigger Diagnosis**: Identify the exact behavioral failures occurring (e.g. FOMO chasing, revenge doubling after losses, premature entries) and explain WHY these specific strategies are vulnerable.
3. **The "Emotion Tax" Impact**: Quantify in plain, stark terms how emotional decisions are erasing disciplined gains.
4. **Targeted 3-Step Behavioral Prescription**: Give 3 strict, non-negotiable psychological guardrails tailored to eliminate these specific mistakes immediately.

Format with crisp, executive markdown, clean bullet points, and authoritative, calm coaching tone.`;

    const systemInstruction = 
      "You are the Master Trading Psychologist and AI Trade Coach of an Executive Binary Options Trading Operating System.\n" +
      "You deliver high-impact, empathetic, yet uncompromising psychological analysis. You analyze cold hard data to expose emotional cognitive traps.\n" +
      "Never give direct buy/sell predictions. Focus entirely on mathematical edge, emotional regulation, risk sizing, and behavioral discipline.";

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    const text = response.text || "No diagnosis generated.";
    return res.status(200).json({ text, isFallback: false });

  } catch (error: any) {
    console.log(`[Vercel Serverless /api/gemini/psychological-diagnosis error]:`, error?.message);

    const edgeDiff = Math.max(0, (disciplinedWinRate || 0) - (emotionalWinRate || 0));
    const fallbackDiagnosis = `### 🧠 EXECUTIVE PSYCHOLOGICAL SENTIMENT DIAGNOSIS (STANDBY COACH FEED)

#### 1. Executive Psychological Sentiment Synthesis
Your data reveals a profound correlation between your emotional state and trade outcome viability:
* **Disciplined Execution**: **${disciplinedWinRate || 0}% Win Rate** across ${disciplinedTrades || 0} contracts (Net P&L: **+$${disciplinedPnl || 0}**). When you follow your rules, your system possesses a verified mathematical edge.
* **Emotional Compromise**: **${emotionalWinRate || 0}% Win Rate** across ${emotionalTrades || 0} contracts (Net P&L: **$${emotionalPnl || 0}**).
* **Edge Degradation**: Entering trades under emotional duress inflicts a **-${edgeDiff}% collapse in your statistical edge**.

#### 2. Cognitive Distortion & Trigger Diagnosis
* **The "Revenge / Recapture" Trap**: When an unexpected loss occurs, your brain perceives capital loss as a threat, triggering urgent impulses to "win it back immediately." This leads to abandoned checklists, forced entries into low-probability setups, and inconsistent sizing.
* **Setup Vulnerability**: Setups requiring patience (such as *Reversal Zones* and *Break-and-Retest*) are most frequently corrupted by emotional impatience—entering before the confirmation candle closes.

#### 3. The "Emotion Tax" Breakdown
* If you simply eliminated trades flagged as emotional, your net account balance would be **+$${lostProfitPotential || Math.abs(emotionalPnl || 50).toFixed(2)} higher**.
* Emotional trading is currently the single largest leak in your profitability bucket—not your technical strategy.

#### 4. Targeted 3-Step Behavioral Prescription
1. **Mandatory 5-Minute Terminal Lockout**: After any loss, immediately step away from the keyboard for 5 full minutes. Break the cortisol feedback loop before viewing the charts again.
2. **Pre-Trade Checklist Gate**: You are forbidden from clicking CALL or PUT until all 4 verification checkboxes on your Daily Plan are checked.
3. **Hard Contract Size Cap**: Keep trade sizes strictly locked at 1.0%–1.5% of master capital. Never double position size to compensate for a prior drawdown.

*\"Mastery is not predicting what the market will do next; mastery is controlling what YOU do next.\"*`;

    return res.status(200).json({
      text: fallbackDiagnosis,
      isFallback: true
    });
  }
}
