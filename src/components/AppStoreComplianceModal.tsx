import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  Lock, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Apple, 
  Download, 
  ExternalLink,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';

interface AppStoreComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'compliance' | 'privacy' | 'terms' | 'appstore_guide';

export const AppStoreComplianceModal: React.FC<AppStoreComplianceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('compliance');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                App Store & Regulatory Compliance Center
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Store Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Official legal agreements, risk disclosures, privacy policies & store packaging toolkit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 border-b-2 font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Financial Risk Disclosure
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Terms of Service (EULA)
          </button>

          <button
            onClick={() => setActiveTab('appstore_guide')}
            className={`py-3 px-3 border-b-2 font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'appstore_guide'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Store Submission Package
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed flex-grow">
          
          {/* TAB 1: FINANCIAL RISK DISCLOSURE */}
          {activeTab === 'compliance' && (
            <div className="space-y-5">
              <div className="bg-amber-955/20 border border-amber-900/40 rounded-xl p-4 flex gap-3 text-amber-300 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block text-amber-200">Apple App Store Guideline 3.1.5 & Google Play Policy Notice:</strong>
                  <p>
                    This software is an analytical journaling utility, discipline monitor, and educational simulation engine. It is NOT an exchange, brokerage, or custodial platform. No real funds are transmitted, held, or traded through this application.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-300 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">1. High-Risk Investment Warning</h3>
                <p>
                  Trading binary options and financial derivative contracts carries a high level of risk and can result in the complete loss of all invested capital. Before deciding to trade binary options, foreign exchange, or commodities, you should carefully consider your investment objectives, level of experience, and risk appetite.
                </p>

                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">2. No Financial Advice or Guarantees</h3>
                <p>
                  Any analysis, signals, voice feedback, macroeconomic summaries, sentiment scores, or strategy reviews generated by this application or its integrated AI engines are strictly for educational and personal organization purposes. They do NOT constitute personalized investment advice, endorsements, or trade solicitations.
                </p>

                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">3. User Responsibility</h3>
                <p>
                  The user assumes full responsibility for any live trades placed on third-party regulated brokers. Past performance recorded in this journal does not guarantee future results.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs font-sans text-slate-300 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-mono text-slate-400">Effective Date: January 1, 2026</span>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded text-[10px]">Zero Third-Party Data Selling</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 font-mono">1. Information We Collect</h3>
              <p>
                <strong>Local Device Storage:</strong> Your trade journals, risk parameters, routine checklists, and strategy history are stored locally on your device storage via client-side storage keys. You have full custody of this data and may export or purge it at any time.
              </p>
              <p>
                <strong>Voice Audio & Transcripts:</strong> When you activate the microphone for voice-command logging or interactive coaching, audio is transcribed using your operating system's native speech recognition or client-authorized AI models. Audio recordings are never retained or shared for advertising.
              </p>

              <h3 className="text-sm font-semibold text-slate-100 font-mono">2. Third-Party AI Services</h3>
              <p>
                Macroeconomic news search and conversational coaching query Google Gemini API securely through your private server gateway. No personally identifiable trading account credentials, broker passwords, or banking details are ever transmitted.
              </p>

              <h3 className="text-sm font-semibold text-slate-100 font-mono">3. Data Deletion & Security</h3>
              <p>
                You can delete your stored trade logs and preferences instantly within the application by clicking the "Purge & Reset" button in the System Settings panel.
              </p>
            </div>
          )}

          {/* TAB 3: TERMS OF SERVICE (EULA) */}
          {activeTab === 'terms' && (
            <div className="space-y-4 text-xs font-sans text-slate-300 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
              <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">Standard End User License Agreement (EULA)</h3>
              <p>
                By downloading, accessing, or using the Binary Options Operating System ("Application"), you agree to be bound by the terms and conditions outlined herein.
              </p>

              <h4 className="font-semibold text-slate-200">1. License Grant</h4>
              <p>
                You are granted a non-transferable, non-exclusive license to use this software for personal trading journal documentation, statistical analysis, and discipline training on compatible iOS, Android, and web devices.
              </p>

              <h4 className="font-semibold text-slate-200">2. Limitation of Liability</h4>
              <p>
                In no event shall the developers, contributors, or affiliated entities be liable for any direct, indirect, incidental, or consequential damages resulting from financial losses incurred while trading on external exchanges or brokers.
              </p>

              <h4 className="font-semibold text-slate-200">3. Age Restriction</h4>
              <p>
                This application is rated 17+ (or legal age of majority in your jurisdiction) due to financial simulation and high-risk derivative trading subject matter.
              </p>
            </div>
          )}

          {/* TAB 4: APP STORE SUBMISSION PACKAGE */}
          {activeTab === 'appstore_guide' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                
                {/* iOS Spec Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-bold flex items-center gap-1.5"><Apple className="w-4 h-4 text-indigo-400" /> Apple App Store Metadata</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Configured</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div><span className="text-slate-500">App Name:</span> Binary Options OS: Journal & Coach</div>
                    <div><span className="text-slate-500">Bundle ID:</span> <code className="text-indigo-300">com.secondchance.binaryoptionsos</code></div>
                    <div><span className="text-slate-500">Primary Category:</span> Finance / Productivity</div>
                    <div><span className="text-slate-500">Age Rating:</span> 17+ (Frequent Financial Analysis)</div>
                  </div>
                </div>

                {/* Android Spec Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-bold flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-400" /> Google Play Console Metadata</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Configured</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div><span className="text-slate-500">App Title:</span> Binary Options Trading Journal OS</div>
                    <div><span className="text-slate-500">Package Name:</span> <code className="text-emerald-300">com.secondchance.binaryoptionsos</code></div>
                    <div><span className="text-slate-500">Category:</span> Finance (Tools & Trackers)</div>
                    <div><span className="text-slate-500">Financial Decl.:</span> Non-Custodial Journaling Tool</div>
                  </div>
                </div>

              </div>

              {/* Ready-to-copy CLI Commands */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    📦 Native Capacitor Packaging Commands
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Run in your terminal</span>
                </div>
                
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: "1. Build Web Assets & Capacitor Sync", cmd: "npm run build && npx cap sync" },
                    { label: "2. Open in Xcode (for iOS .ipa export)", cmd: "npx cap open ios" },
                    { label: "3. Open in Android Studio (for .aab bundle)", cmd: "npx cap open android" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{item.label}</span>
                        <code className="text-indigo-300">{item.cmd}</code>
                      </div>
                      <button
                        onClick={() => handleCopy(item.cmd, `cmd_${idx}`)}
                        className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="Copy command"
                      >
                        {copiedKey === `cmd_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Description template */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-200">
                    📝 App Store Reviewer Notes & Description
                  </span>
                  <button
                    onClick={() => handleCopy(
                      "Binary Options Trading OS is an executive trading journal, risk manager, and discipline coach. It does not execute live trades, hold customer deposits, or connect to brokerage accounts. All logs and risk rules are tracked for personal education and statistical review.",
                      "review_notes"
                    )}
                    className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey === "review_notes" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Reviewer Note
                  </button>
                </div>
                <p className="text-slate-400 font-sans leading-relaxed text-[11px] bg-slate-900 p-3 rounded border border-slate-800">
                  "Binary Options Trading OS is an executive trading journal, risk manager, and discipline coach. It does not execute live trades, hold customer deposits, or connect to brokerage accounts. All logs and risk rules are tracked for personal education and statistical review."
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Capacitor 7.x &bull; iOS & Android Ready &bull; WCAG AA Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
