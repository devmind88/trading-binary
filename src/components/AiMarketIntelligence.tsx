import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  Search, 
  TrendingUp, 
  Newspaper, 
  AlertTriangle, 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  Send, 
  Terminal,
  HelpCircle
} from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: Source[];
}

export const AiMarketIntelligence: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"news" | "sentiment" | "copilot">("news");

  // Economic News States
  const [newsReport, setNewsReport] = useState<string>("");
  const [newsSources, setNewsSources] = useState<Source[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(false);
  const [isNewsFallback, setIsNewsFallback] = useState<boolean>(false);
  const [currencyFilter, setCurrencyFilter] = useState<string>("");

  // Sentiment States
  const [sentimentReport, setSentimentReport] = useState<string>("");
  const [sentimentSources, setSentimentSources] = useState<Source[]>([]);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState<boolean>(false);
  const [isSentimentFallback, setIsSentimentFallback] = useState<boolean>(false);

  // Copilot States
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([
    {
      id: "copilot_init",
      sender: "ai",
      text: "Welcome to the AI Strategy & Discipline Copilot. I use Google Search grounding to give you up-to-date information on currency climates, strategy structures, and psychological coaching. How can I help you sharpen your trading edge today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [copilotInput, setCopilotInput] = useState<string>("");
  const [isLoadingCopilot, setIsLoadingCopilot] = useState<boolean>(false);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll copilot
  useEffect(() => {
    copilotEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages, isLoadingCopilot]);

  // Helper to parse markdown bold text **term** safely
  const parseBoldAndNormal = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-slate-100 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-900/30">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render formatted paragraphs, bullet points, and headers elegantly
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-sm font-sans font-bold text-indigo-400 mt-4 mb-2 first:mt-0 border-b border-slate-800/40 pb-1.5">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-xs font-sans font-bold text-slate-200 mt-3 mb-1.5">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("  * ") || line.startsWith("  - ")) {
        const cleaned = line.replace(/^(\s*[-*]\s+)/, "");
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-indigo-500 font-mono text-[10px] select-none mt-1">■</span>
            <span className="flex-grow">{parseBoldAndNormal(cleaned)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          const [, num, content] = match;
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-1">
              <span className="text-indigo-400 font-mono font-bold text-[10px] select-none mt-0.5">{num}.</span>
              <span className="flex-grow">{parseBoldAndNormal(content)}</span>
            </div>
          );
        }
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2.5" />;
      }
      return (
        <p key={idx} className="my-1.5 leading-relaxed text-slate-300 text-xs">
          {parseBoldAndNormal(line)}
        </p>
      );
    });
  };

  // Fetch High Impact News Releases
  const handleFetchNews = async (filterVal?: string) => {
    setIsLoadingNews(true);
    setNewsReport("");
    setNewsSources([]);
    try {
      const response = await fetch("/api/gemini/market-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyFilter: filterVal || currencyFilter })
      });
      if (!response.ok) throw new Error("Could not retrieve market news calendar");
      const data = await response.json();
      setNewsReport(data.text);
      setNewsSources(data.sources || []);
      setIsNewsFallback(Boolean(data.isFallback));
    } catch (err: any) {
      console.error(err);
      setNewsReport("Failed to load economic news calendar. Please check that GEMINI_API_KEY is configured in Secrets.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Fetch Asset Sentiment Scan
  const handleFetchSentiment = async () => {
    setIsLoadingSentiment(true);
    setSentimentReport("");
    setSentimentSources([]);
    try {
      const response = await fetch("/api/gemini/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Could not retrieve market sentiment index");
      const data = await response.json();
      setSentimentReport(data.text);
      setSentimentSources(data.sources || []);
      setIsSentimentFallback(Boolean(data.isFallback));
    } catch (err: any) {
      console.error(err);
      setSentimentReport("Failed to execute market sentiment scan. Please confirm GEMINI_API_KEY setup.");
    } finally {
      setIsLoadingSentiment(false);
    }
  };

  // Submit Chat Copilot Message
  const handleSendCopilot = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || copilotInput;
    if (!textToSend.trim()) return;

    // Log user message
    const userMsg: ChatMessage = {
      id: "copilot_user_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput("");
    setIsLoadingCopilot(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend })
      });
      if (!response.ok) throw new Error("Could not contact trade coach");
      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: "copilot_ai_" + Date.now(),
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || []
      };
      setCopilotMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "copilot_err_" + Date.now(),
        sender: "ai",
        text: "Error: Could not retrieve dynamic coaching. Standby guidelines are active in the strategy playbook.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCopilotMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoadingCopilot(false);
    }
  };

  // Initial fetch: Load news first, load sentiment when switching to sentiment tab or on initial staggered timeout
  useEffect(() => {
    handleFetchNews();
    const timer = setTimeout(() => {
      handleFetchSentiment();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // When switching to sentiment tab, trigger fetch if not yet loaded
  useEffect(() => {
    if (activeSubTab === "sentiment" && !sentimentReport && !isLoadingSentiment) {
      handleFetchSentiment();
    }
  }, [activeSubTab]);

  return (
    <div className="bg-slate-900 border border-slate-805/80 rounded-xl p-5 lg:p-6 flex flex-col gap-6 min-h-[580px]">
      
      {/* Dashboard Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/80 rounded-lg border border-indigo-850/60 text-indigo-400">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-slate-100 tracking-tight text-base sm:text-lg">AI Market Intelligence Center</h2>
            <span className="text-[11px] font-mono text-slate-500 block">REAL-TIME WEB GROUNDED MACRO INTELLIGENCE</span>
          </div>
        </div>

        {/* Dynamic Source Scanner Legend */}
        <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850 self-start sm:self-auto">
          <Globe className="w-3.5 h-3.5 text-indigo-400 animate-spin [animation-duration:8s]" />
          <span className="text-[10px] font-mono text-slate-400">
            Engine: {isNewsFallback && isSentimentFallback ? (
              <span className="text-amber-400 font-semibold">Standby Safety Mode</span>
            ) : (
              <span className="text-emerald-400 font-semibold">Live Grounded</span>
            )}
          </span>
        </div>
      </div>

      {/* AI Center Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-850/40 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("news")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
            activeSubTab === "news"
              ? "bg-indigo-950/40 border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" /> TODAY'S CALENDAR
        </button>

        <button
          onClick={() => setActiveSubTab("sentiment")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
            activeSubTab === "sentiment"
              ? "bg-indigo-950/40 border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> DAILY SENTIMENT RADAR
        </button>

        <button
          onClick={() => setActiveSubTab("copilot")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
            activeSubTab === "copilot"
              ? "bg-indigo-950/40 border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Brain className="w-3.5 h-3.5" /> STRATEGY & DISCIPLINE COACH
        </button>
      </div>

      {/* Sub-Tab Panels */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* TAB 1: ECONOMIC NEWS RELEASE ALERTS */}
        {activeSubTab === "news" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/30 p-3.5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-slate-300 font-sans">Pause binary contracts during major high-impact news releases to avoid unexpected price spikes.</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter (e.g. USD, EUR)"
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-300 placeholder-slate-600 outline-none w-28 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleFetchNews(currencyFilter)}
                  disabled={isLoadingNews}
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono text-xs font-bold rounded transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingNews ? 'animate-spin' : ''}`} />
                  {isLoadingNews ? 'FETCHING...' : 'RESCAN'}
                </button>
              </div>
            </div>

            {/* News Report Output */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 min-h-[220px] max-h-[380px] overflow-y-auto">
              {isLoadingNews ? (
                <div className="h-40 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-500 font-mono">Retrieving real-time high-impact events from Google Search...</span>
                </div>
              ) : newsReport ? (
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  {renderFormattedText(newsReport)}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-500 text-xs font-mono">
                  No active news events fetched. Click Rescan above to scan today's macroeconomic docket.
                </div>
              )}
            </div>

            {/* Sources indicator */}
            {!isLoadingNews && newsSources.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">Grounded Search Sources:</span>
                <div className="flex flex-wrap gap-2">
                  {newsSources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:border-slate-700 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title || `Source ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DAILY SENTIMENT RADAR */}
        {activeSubTab === "sentiment" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-950/30 p-3.5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-300">Scans tech consensus, central bank sentiment, and daily bias for major pairs.</span>
              </div>
              <button
                onClick={handleFetchSentiment}
                disabled={isLoadingSentiment}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono text-xs font-bold rounded transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSentiment ? 'animate-spin' : ''}`} />
                {isLoadingSentiment ? 'SCANNING...' : 'TRIGGER BIAS SCAN'}
              </button>
            </div>

            {/* Sentiment Report Output */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 min-h-[220px] max-h-[380px] overflow-y-auto">
              {isLoadingSentiment ? (
                <div className="h-40 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-500 font-mono">Scanning daily bias index via Web Search Grounding...</span>
                </div>
              ) : sentimentReport ? (
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  {renderFormattedText(sentimentReport)}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-500 text-xs font-mono">
                  No active sentiment scan. Click Trigger Bias Scan above to calculate daily currency trend weights.
                </div>
              )}
            </div>

            {/* Sources indicator */}
            {!isLoadingSentiment && sentimentSources.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">Grounded Search Sources:</span>
                <div className="flex flex-wrap gap-2">
                  {sentimentSources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:border-slate-700 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title || `Source ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STRATEGY & DISCIPLINE COACH */}
        {activeSubTab === "copilot" && (
          <div className="flex flex-col gap-4 h-[420px] justify-between">
            
            {/* Quick questions suggestion tray */}
            <div className="flex items-center gap-2 overflow-x-auto select-none shrink-0 py-1 scrollbar-none">
              <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0">
                <HelpCircle className="w-3 h-3 text-indigo-400" /> Quick Ask:
              </span>
              {[
                "How do news events affect GBP/USD today?",
                "Analyze the 5-min Retest pattern",
                "Coach me: I am tilting after consecutive losses",
                "Explain the Trend Continuation rules"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendCopilot(q)}
                  disabled={isLoadingCopilot}
                  className="text-[9px] font-mono text-slate-400 hover:text-indigo-400 whitespace-nowrap bg-slate-950 px-2 py-1 rounded border border-slate-850 hover:border-slate-800 transition shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat timeline panel */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20 border border-slate-850/80 rounded-xl text-xs font-sans">
              {copilotMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-xl border leading-relaxed ${
                      isUser
                        ? "bg-indigo-950/50 border-indigo-900/60 text-slate-200 rounded-tr-none"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 rounded-tl-none"
                    }`}>
                      {!isUser && (
                        <span className="inline-block bg-slate-950 text-indigo-400 border border-indigo-900/40 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mb-1.5 bg-opacity-70">
                          ⊞ AI TRADE COACH
                        </span>
                      )}
                      <div>{renderFormattedText(msg.text)}</div>

                      {/* Display message grounded sources if any */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-850 space-y-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Grounded Sources:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className="inline-flex items-center gap-1 bg-slate-950 hover:bg-slate-900 px-1.5 py-0.5 rounded text-[8px] font-mono text-indigo-400 transition"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                {src.title ? (src.title.length > 15 ? src.title.slice(0, 15) + "..." : src.title) : `Link ${i + 1}`}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                      {isUser ? "User" : "Trade Coach"} • {msg.timestamp}
                    </span>
                  </div>
                );
              })}
              {isLoadingCopilot && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="max-w-[85%] p-3 rounded-xl border leading-relaxed bg-slate-900 border-slate-800 text-slate-300 rounded-tl-none">
                    <span className="inline-block bg-slate-950 text-indigo-400 border border-indigo-900/40 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mb-1 bg-opacity-70">
                      ⊞ AI TRADE COACH
                    </span>
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">Searching the financial web...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={copilotEndRef} />
            </div>

            {/* Text prompt command input */}
            <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl flex items-center gap-2">
              <div className="text-slate-650 font-mono text-[10px] shrink-0 pl-1">
                <Terminal className="w-4 h-4 text-slate-550" />
              </div>
              <input
                type="text"
                className="flex-grow bg-transparent border-none text-slate-200 placeholder-slate-600 focus:ring-0 outline-none text-xs font-mono"
                placeholder="Ask trade coach: 'Explain support/resistance', 'how to handle tilting' etc."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCopilot()}
                disabled={isLoadingCopilot}
              />
              <button
                onClick={() => handleSendCopilot()}
                disabled={isLoadingCopilot || !copilotInput.trim()}
                className="p-1.5 rounded bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-slate-950 transition shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
