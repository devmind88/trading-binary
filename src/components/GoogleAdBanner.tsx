import React, { useEffect, useRef } from 'react';
import { Sparkles, Shield, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleAdBannerProps {
  user: UserProfile;
  onOpenPricing: () => void;
  format?: 'horizontal' | 'compact' | 'sidebar';
  className?: string;
}

// Highly relevant trader sponsor placements shown when AdSense script is in sandbox/testing or blocked by adblock
const TRADING_SPONSORS = [
  {
    id: 'sponsor_1',
    sponsor: 'TradingView Pro',
    headline: 'Multi-Chart Layouts & Real-Time Tick Feeds',
    tagline: 'Special 30-Day Free Trial for Binary & Forex Traders',
    cta: 'Claim Free Trial',
    color: 'from-blue-900/40 to-cyan-950/40 border-blue-800/40',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    link: 'https://www.tradingview.com'
  },
  {
    id: 'sponsor_2',
    sponsor: 'Apex Trader Funding',
    headline: 'Trade Up to $300,000 in Funded Capital',
    tagline: 'Pass in 1 Day • 90% Profit Split • 80% Discount with Code TRADER',
    cta: 'Get Funded Today',
    color: 'from-emerald-950/50 to-slate-900 border-emerald-800/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    link: 'https://apextraderfunding.com'
  },
  {
    id: 'sponsor_3',
    sponsor: 'Quant Data Terminal',
    headline: 'Real-Time Institutional Order Flow & Gamma Levels',
    tagline: 'See where liquidity pools sit before taking binary 5-minute entries',
    cta: 'View Live Heatmap',
    color: 'from-purple-950/40 to-slate-900 border-purple-800/40',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    link: 'https://www.quantdata.io'
  }
];

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  user,
  onOpenPricing,
  format = 'horizontal',
  className = ''
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const sponsor = TRADING_SPONSORS[Math.floor(Math.random() * TRADING_SPONSORS.length)];

  // If user is on Pro or Elite tier, or explicitly adFree, render nothing!
  if (user.plan !== 'free' || user.adFree) {
    return null;
  }

  const publisherId = user.googleAdsenseClientId || 'ca-pub-6822094812390192';

  useEffect(() => {
    // Attempt to trigger Google AdSense script if loaded
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle;
        if (adsbygoogle && adRef.current) {
          adsbygoogle.push({});
        }
      }
    } catch (e) {
      // AdSense push error or blocked by adblock, fallback will display
    }
  }, []);

  if (format === 'sidebar') {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            SPONSORED ADVERTISEMENT
          </span>
          <button 
            onClick={onOpenPricing} 
            className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5"
          >
            <Sparkles className="w-2.5 h-2.5" /> Remove Ads
          </button>
        </div>

        {/* Dynamic / Fallback Google Ad Container */}
        <div className="rounded-lg bg-slate-950 border border-slate-800/60 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${sponsor.badgeColor}`}>
              {sponsor.sponsor}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">Google Ad ID: {publisherId.slice(0, 10)}...</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 leading-snug">{sponsor.headline}</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">{sponsor.tagline}</p>
          <a
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center gap-1.5 text-xs font-mono font-medium py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition text-center"
          >
            {sponsor.cta} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Horizontal Leaderboard Banner
  return (
    <aside 
      aria-label="Sponsored advertisement"
      className={`rounded-xl border border-slate-800/90 bg-slate-900/80 p-3 relative overflow-hidden backdrop-blur-sm transition-all ${className}`}
    >
      {/* Ad Attribution Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Google AdSense / Sponsor Feed
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Supporting Free Tier Access
          </span>
        </div>

        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-lg transition"
        >
          <Sparkles className="w-3 h-3" />
          <span>Go Ad-Free with Pro ($29/mo)</span>
        </button>
      </div>

      {/* Ad Content Block */}
      <div className={`rounded-lg bg-gradient-to-r ${sponsor.color} p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sponsor.badgeColor}`}>
                {sponsor.sponsor}
              </span>
              <span className="text-xs font-semibold text-slate-100">{sponsor.headline}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{sponsor.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <a
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-md shadow-indigo-950/50 transition cursor-pointer whitespace-nowrap"
          >
            <span>{sponsor.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
