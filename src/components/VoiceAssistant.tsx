import React, { useState, useEffect, useRef } from 'react';
import { Mic as MicIcon, MicOff as MicOffIcon, Send as SendIcon, Volume2 as VolumeIcon, VolumeX as VolumeXIcon, Brain as BrainIcon, Terminal } from 'lucide-react';
import { AssistantMessage, Trade, StrategyId, TradingSession } from '../types';

interface VoiceAssistantProps {
  onNavigate: (tabId: string) => void;
  onAddQuickTrade: (result: 'WIN' | 'LOSS', amount?: number) => void;
  trades: Trade[];
  violationsCount: number;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onNavigate,
  onAddQuickTrade,
  trades,
  violationsCount
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'NeuroTactix OS Assistant online. Tactical execution engine & cognitive mentor ready. Speak or type commands (e.g., "Show me my PnL calendar", "Give me my daily routine", "Analyze Trader DNA", "Check volatility").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Helper to query Gemini on the full-stack server / Vercel Serverless Function
  const queryGeminiChat = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      setIsLoading(false);
      if (data && data.text) {
        appendSystemMessage(data.text, "AI Trade Coach");
      } else {
        throw new Error(data?.error || "Empty response from AI server");
      }
    } catch (err: any) {
      console.error("Gemini query failed:", err);
      setIsLoading(false);
      const fallbackResponse = `Understood. I have scanned the command "${text}". (Operating under Standby Feed).\n\n* **Risk Control**: Maintain strict risk limits (1-2% of balance per trade).\n* **Technical Confluence**: Verify 5-minute trend direction and EMA alignment before placing contracts.\n* **Vercel Setup Note**: If deploying on Vercel, ensure \`GEMINI_API_KEY\` is added to your Vercel Project Settings > Environment Variables.`;
      appendSystemMessage(fallbackResponse, 'AI Trade Coach (Standby)');
    }
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up Web Speech recognition
  useEffect(() => {
    const SpeechVal = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechVal) {
      const rec = new SpeechVal();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleSendCommand(text, 'voice');
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Speak response aloud utilizing native synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Slightly authoritative standard split
      utterance.pitch = 1.0;
      // Seek a premium system synthesizer voice if available
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural'));
      if (premiumVoice) utterance.voice = premiumVoice;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis offline:', e);
    }
  };

  // Turn on/off Microphone capture
  const toggleListening = () => {
    if (!recognitionRef.current) {
      appendSystemMessage("Web Speech Recognition API is not natively supported in this browser environment. Please write your commands in the text prompt below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech initiation error:', err);
      }
    }
  };

  const appendSystemMessage = (text: string, moduleActivated?: string) => {
    const msg: AssistantMessage = {
      id: 'msg_' + Date.now(),
      sender: 'system',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moduleActivated
    };
    setMessages(prev => [...prev, msg]);
    speakText(text);
  };

  // Intention Parsing Module (Combines Rules Parser, Emotion Safeguards, and Sizing block checks)
  const handleSendCommand = (commandText: string, senderType: 'user' | 'voice' = 'user') => {
    if (!commandText.trim()) return;

    // Log user message
    const userMsg: AssistantMessage = {
      id: 'user_' + Date.now(),
      sender: senderType,
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const lower = commandText.toLowerCase();

    // 1. Emotion triggers (Psychology Reinforcement Module)
    if (
      lower.includes('frustrated') || 
      lower.includes('revenge') || 
      lower.includes('angry') || 
      lower.includes('money back') || 
      lower.includes('recover') || 
      lower.includes('lose') || 
      lower.includes('impulsive') || 
      lower.includes('hate') ||
      lower.includes('tilt')
    ) {
      const response = "Breathe. Slow down. I notice emotional language. Accept this loss as standard operating expense. You have a maximum daily loss protection of 5 percent. Close your browser, stand up, take 5 slow deep breaths, and commit to following the plan. Capital preservation is your actual goal.";
      setTimeout(() => appendSystemMessage(response, 'Psychology Reinforcement'), 600);
      return;
    }

    // 2. Direct Trade Advice query (Decline Advice rule)
    if (
      lower.includes('should i take') || 
      lower.includes('buy now') || 
      lower.includes('sell now') || 
      lower.includes('what to trade') || 
      lower.includes('predict') || 
      lower.includes('is gbp/usd going') ||
      lower.includes('eur/usd going')
    ) {
      const response = "I am strictly programmed as an executive trading operating system. I am forbidden from formulating market predictions or providing financial advice. Restructure your focus: verify your Entry Checklist, verify support levels, confirm trend, and accept the outcome completely.";
      setTimeout(() => appendSystemMessage(response, 'Financial Sizing Shield'), 600);
      return;
    }

    // 3. Navigation intents (Operating System Command routers)
    if (lower.includes('calendar') || lower.includes('pnl') || lower.includes('p&l') || lower.includes('days')) {
      onNavigate('calendar');
      const response = "Activating your PnL Calendar module. All standard days, win rates, and daily aggregates are displayed.";
      setTimeout(() => appendSystemMessage(response, 'PnL Calendar Generator'), 600);
      return;
    }

    if (lower.includes('routine') || lower.includes('checklist') || lower.includes('protocol')) {
      onNavigate('routine');
      const response = "Daily Routine checklist loaded. Complete your pre-flight market checks prior to logging contracts.";
      setTimeout(() => appendSystemMessage(response, 'Daily Routine'), 600);
      return;
    }

    if (lower.includes('tracker') || lower.includes('performance') || lower.includes('stats')) {
      onNavigate('tracker');
      const response = "Navigating to Strategy Performance Tracker. Inspect setup win rates and payout averages.";
      setTimeout(() => appendSystemMessage(response, 'Strategy Tracker'), 600);
      return;
    }

    if (lower.includes('optimize') || lower.includes('playbook') || lower.includes('refine')) {
      onNavigate('tracker');
      const response = "Opening Strategy Optimizer module. Review edge suggestions, market climates, and behavioral traps.";
      setTimeout(() => appendSystemMessage(response, 'Strategy Optimizer'), 600);
      return;
    }

    if (lower.includes('review') || lower.includes('weekly')) {
      onNavigate('review');
      const response = "Opening trailing 7-day Weekly Review System. View automatic return margins and log week narratives.";
      setTimeout(() => appendSystemMessage(response, 'Weekly Review'), 600);
      return;
    }

    if (lower.includes('rules') || lower.includes('breaking') || lower.includes('violations') || lower.includes('risk')) {
      onNavigate('plan');
      const response = `Current risk scan: You have ${violationsCount} active rules breaches logged. Keep position sizes strictly within 1 to 2 percent.`;
      setTimeout(() => appendSystemMessage(response, 'Risk Management'), 600);
      return;
    }

    if (lower.includes('volatility') || lower.includes('atr') || lower.includes('macro') || lower.includes('fear index') || lower.includes('cooldown')) {
      onNavigate('volatility_layer');
      const response = "Opening Market Volatility & Liquidity Layer. Monitoring dynamic ATR regimes, synthetic fear indexes, and macro event lockouts.";
      setTimeout(() => appendSystemMessage(response, 'Market Volatility Layer'), 600);
      return;
    }

    if (lower.includes('replay') || lower.includes('backtest') || lower.includes('simulator') || lower.includes('tape')) {
      onNavigate('replay_engine');
      const response = "Opening Institutional Replay Engine. Tick-by-tick historical candlestick simulator active with emotional audit tracking.";
      setTimeout(() => appendSystemMessage(response, 'Replay Engine'), 600);
      return;
    }

    if (lower.includes('forecast') || lower.includes('predictive') || lower.includes('probability') || lower.includes('time of day') || lower.includes('time-of-day') || lower.includes('next trade')) {
      onNavigate('quant_analytics');
      const response = "Opening Predictive Setup Forecaster. Calculating Bayesian probability, time-of-day alpha distribution, and Kelly sizing for your next trade setup.";
      setTimeout(() => appendSystemMessage(response, 'Predictive Analytics'), 600);
      return;
    }

    if (lower.includes('quant') || lower.includes('sharpe') || lower.includes('sortino') || lower.includes('analytics') || lower.includes('expectancy') || lower.includes('drawdown')) {
      onNavigate('quant_analytics');
      const response = "Opening Hedge-Fund Quant Analytics Center. Sharpe and Sortino ratios, equity decomposition, and CSV export active.";
      setTimeout(() => appendSystemMessage(response, 'Quant Analytics'), 600);
      return;
    }

    if (lower.includes('gamification') || lower.includes('xp') || lower.includes('missions') || lower.includes('badge') || lower.includes('leaderboard')) {
      onNavigate('gamification');
      const response = "Opening Discipline XP Hub. Reviewing habit adherence missions, discipline levels, and anonymous community standings.";
      setTimeout(() => appendSystemMessage(response, 'Discipline XP Hub'), 600);
      return;
    }

    if (lower.includes('coach') || lower.includes('mentor') || lower.includes('priming') || lower.includes('forensic')) {
      onNavigate('execution_coach');
      const response = "Opening AI Execution Coach 2.0. Adaptive cognitive mentor online with pre-session mental priming and revenge drift intervention.";
      setTimeout(() => appendSystemMessage(response, 'AI Execution Coach'), 600);
      return;
    }

    if (lower.includes('dna') || lower.includes('archetype') || lower.includes('monte carlo') || lower.includes('kelly')) {
      onNavigate('dna_lab');
      const response = "Opening Trader DNA & Monte Carlo Simulation Lab. Inspecting behavioral archetypes, ruin probability trajectories, and fractional Kelly compounding metrics.";
      setTimeout(() => appendSystemMessage(response, 'Trader DNA & Sim'), 600);
      return;
    }

    if (lower.includes('plan') || lower.includes('sessions') || lower.includes('approved')) {
      onNavigate('plan');
      const response = "Trading Plan Module opened. Inspect active sessions, entry checklist, and psychology rules.";
      setTimeout(() => appendSystemMessage(response, 'Trading Plan'), 600);
      return;
    }

    // 4. Quick Contract logs
    if (lower.includes('log win') || lower.includes('log a win') || lower.includes('won a trade')) {
      onAddQuickTrade('WIN');
      onNavigate('calendar');
      const response = "Executing rapid voice logger: Contract logged as a WIN. Sizing consistency set to match system presets.";
      setTimeout(() => appendSystemMessage(response, 'PnL Calendar Generator'), 600);
      return;
    }

    if (lower.includes('log loss') || lower.includes('log a loss') || lower.includes('lost a trade')) {
      onAddQuickTrade('LOSS');
      onNavigate('calendar');
      const response = "Executing rapid voice logger: Contract logged as a LOSS. Daily safety limits scanned.";
      setTimeout(() => appendSystemMessage(response, 'PnL Calendar Generator'), 600);
      return;
    }

    // 5. General fallback powered by server-side Gemini Search Grounding
    queryGeminiChat(commandText);
  };

  // Helper to parse markdown-like bold strings inside messages
  const parseBoldAndNormal = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-slate-100 bg-indigo-950/30 px-1 py-0.5 rounded border border-indigo-900/20">
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
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-sans font-bold text-indigo-400 mt-3 mb-1.5 first:mt-0 border-b border-slate-800/40 pb-0.5">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-[11px] font-sans font-bold text-slate-200 mt-2.5 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('  * ') || line.startsWith('  - ')) {
        const cleaned = line.replace(/^(\s*[-*]\s+)/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1.5 my-1">
            <span className="text-indigo-500 text-[8px] select-none mt-1.5">■</span>
            <span className="flex-grow">{parseBoldAndNormal(cleaned)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          const [, num, content] = match;
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1 my-1">
              <span className="text-indigo-400 font-mono font-bold text-[9px] select-none mt-1">{num}.</span>
              <span className="flex-grow">{parseBoldAndNormal(content)}</span>
            </div>
          );
        }
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-1 text-slate-300 leading-relaxed">
          {parseBoldAndNormal(line)}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-805 rounded-xl h-[460px] flex flex-col justify-between overflow-hidden">
      
      {/* Header and Controls */}
      <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainIcon className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="font-sans font-semibold text-slate-100 text-sm">OS Command Decryptor</h3>
            <span className="text-[10px] font-mono text-slate-500 block">Intel Voice Link • Active</span>
          </div>
        </div>

        {/* Audio feedback toggle & Microphone Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(prev => !prev)}
            className={`p-2 rounded-lg border transition ${
              voiceEnabled
                ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={voiceEnabled ? 'Auditory Response Enabled' : 'Auditory Response Muted'}
          >
            {voiceEnabled ? <VolumeIcon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
          </button>
 
          <button
            onClick={toggleListening}
            className={`py-2 px-3.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-mono font-bold ${
              isListening
                ? 'bg-rose-955 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-indigo-950/40 border-slate-800 text-indigo-400 hover:border-slate-700'
            }`}
            title="Speak command"
          >
            {isListening ? <MicOffIcon className="w-3.5 h-3.5" /> : <MicIcon className="w-3.5 h-3.5" />}
            {isListening ? 'LISTENING' : 'SPEAK'}
          </button>
        </div>
      </div>

      {/* Messages timeline panel */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/20 text-xs font-sans">
        {messages.map(msg => {
          const isUser = msg.sender === 'user' || msg.sender === 'voice';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl border leading-relaxed ${
                  isUser
                    ? 'bg-indigo-950/50 border-indigo-900/60 text-slate-200 rounded-tr-none'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 rounded-tl-none'
                }`}
              >
                {/* Module Flag Tag */}
                {!isUser && msg.moduleActivated && (
                  <span className="inline-block bg-slate-950 text-indigo-400 border border-indigo-900/40 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mb-1 bg-opacity-70">
                    ⊞ {msg.moduleActivated}
                  </span>
                )}
                
                <div>{renderFormattedText(msg.text)}</div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                {msg.sender === 'voice' ? '🎙 Voice' : isUser ? 'User' : 'Operating System'} • {msg.timestamp}
              </span>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="max-w-[85%] p-3 rounded-xl border leading-relaxed bg-slate-900 border-slate-800 text-slate-300 rounded-tl-none">
              <span className="inline-block bg-slate-950 text-indigo-400 border border-indigo-900/40 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mb-1 bg-opacity-70">
                ⊞ AI Trade Coach
              </span>
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="text-[10px] text-slate-500 font-mono ml-2">Consulting Google Search...</span>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
              AI Coach • Active
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Text Command input block */}
      <div className="bg-slate-950 p-3 border-t border-slate-850 flex items-center gap-2">
        <div className="text-slate-650 font-mono text-[10px] shrink-0 pl-1">
          <Terminal className="w-3.5 h-3.5 text-slate-550" />
        </div>
        <input
          type="text"
          className="flex-grow bg-transparent border-none text-slate-200 placeholder-slate-600 focus:ring-0 outline-none text-xs font-mono"
          placeholder="Type command ('Show me my calendar', 'log win' etc.)"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendCommand(inputText, 'user')}
        />
        <button
          onClick={() => handleSendCommand(inputText, 'user')}
          className="p-1.5 rounded bg-indigo-500 hover:bg-indigo-400 text-slate-950 transition shrink-0"
        >
          <SendIcon className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* Assistant command presets toolbar */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-900 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
        {[
          'Log a win',
          'I am frustrated',
          'Optimize my strategy',
          'Check if breaking rules',
          'Should I take this trade'
        ].map(p => (
          <button
            key={p}
            onClick={() => handleSendCommand(p, 'user')}
            className="text-[9px] font-mono text-slate-500 hover:text-indigo-400 whitespace-nowrap bg-slate-900 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-800 transition shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

    </div>
  );
};
