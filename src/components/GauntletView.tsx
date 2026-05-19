import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Zap, 
  RefreshCw, 
  Shield, 
  Brain, 
  ChevronRight,
  Trophy,
  Activity,
  Box,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  FolderSearch,
  Loader2,
  Sparkles,
  Swords,
  Lock,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Layers,
  Terminal,
  FastForward,
  Play,
  Gavel
} from 'lucide-react';
import { 
  TESTS, 
  ARENA_RANKS, 
  GauntletTest,
  CATS,
  LEADERBOARD_DATA 
} from '../constants';
import { AppState, TestResult } from '../types';
import { cn } from '../lib/utils';
import { llmStream } from '../lib/llm';
import { getChatCompletion } from '../services/geminiService';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from 'recharts';
import BattleVisualizer from './BattleVisualizer';

interface GauntletViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  addXP: (amount: number) => void;
  notify: (msg: string) => void;
  toggleModelLoad: (id: string) => void;
  scanLocalModels: () => Promise<void>;
  isScanning: boolean;
  scanProgress: number;
}

export default function GauntletView({ 
  state, updateState, addXP, notify, toggleModelLoad, 
  scanLocalModels, isScanning, scanProgress 
}: GauntletViewProps) {
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [judgeScore, setJudgeScore] = useState<number | null>(null);
  const [judgeReason, setJudgeReason] = useState('');
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isChainRunning, setIsChainRunning] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Group tests by category for the "Climb"
  const stages = useMemo(() => {
    return CATS.map(cat => ({
      name: cat,
      tests: TESTS.filter(t => t.cat === cat),
      status: TESTS.filter(t => t.cat === cat).every(t => state.testResults[t.id]) ? 'complete' :
              TESTS.filter(t => t.cat === cat).some(t => state.testResults[t.id]) ? 'active' : 'locked'
    }));
  }, [state.testResults]);

  const activeStage = stages[currentStageIdx];
  const currentRank = [...ARENA_RANKS].reverse().find(r => state.xp >= r.minXP) || ARENA_RANKS[0];
  const nextRank = ARENA_RANKS[ARENA_RANKS.indexOf(currentRank) + 1] || null;
  const progressToNext = nextRank ? ((state.xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100 : 100;

  const runTest = async (test: GauntletTest) => {
    if (!state.arenaModel) return null;
    setIsRunning(true);
    setCurrentResponse('');
    setJudgeScore(null);
    setJudgeReason('');
    setBattleLogs(["INITIATING CONTACT...", "ANALYZING TACTICAL SURFACE..."]);
    
    const model = state.models.find(m => m.id === state.arenaModel);
    const backend = model?.backend || 'LM Studio';
    const baseUrl = backend === 'Ollama' ? state.settings.ollUrl : (backend === 'Gemini' ? '' : state.settings.lmsUrl);
    
    // Exact request telemetry
    const finalPrompt = customPrompt || test.prompt;
    const rawRequest = JSON.stringify({
      model: state.arenaModel,
      messages: [{ role: 'user', content: finalPrompt }],
      config: model?.config
    }, null, 2);

    try {
      let fullText = '';
      setBattleLogs(prev => [...prev, `${(model?.name || 'UNKNOWN').toUpperCase()} ENGAGING...`]);
      
      await llmStream(baseUrl, state.arenaModel, [{ role: 'user', content: finalPrompt }], {
        backend,
        onChunk: (c) => { 
          fullText += c; 
          setCurrentResponse(fullText); 
        }
      });

      const rawResponse = fullText; // Capturing raw response telemetry

      setBattleLogs(prev => [...prev, "ENGAGEMENT COMPLETE. RECOILING...", "SUMMONING JUDGE..."]);

      if (state.settings.judge) {
        const judgePrompt = `You are a neural integrity judge. 
        Evaluate this test response against criteria: ${test.judge}
        Prompt: ${finalPrompt}
        Output: ${fullText}
        Provide JSON: { "score": 0-100, "reason": "why" }`;
        
        let judgeRes = '';
        const judgeModelId = state.gauntletJudge || 'gemini-3.1-pro-preview';
        
        // Attempt judging using selected model
        const judgeModel = state.models.find(m => m.id === judgeModelId);
        setBattleLogs(prev => [...prev, `JUDGE ${(judgeModel?.name || 'UNKNOWN').toUpperCase()} DELIBERATING...`]);

        if (judgeModel?.backend === 'Gemini') {
           judgeRes = await getChatCompletion(judgePrompt);
           if (judgeRes.includes("Neural Error") || judgeRes.includes("429") || judgeRes.includes("Rate exceeded")) {
             throw new Error("Judge subsystem rate limited. Please try again later.");
           }
        } else {
           // Fallback to local judge if specified
           const jBackend = judgeModel?.backend || 'LM Studio';
           const jBaseUrl = jBackend === 'Ollama' ? state.settings.ollUrl : state.settings.lmsUrl;
           let jFull = '';
           await llmStream(jBaseUrl, judgeModelId, [{ role: 'user', content: judgePrompt }], {
             backend: jBackend,
             onChunk: (c) => { jFull += c; }
           });
           judgeRes = jFull;
        }

        try {
          const parsed = JSON.parse(judgeRes.replace(/```json|```/g, '').trim());
          setJudgeScore(parsed.score);
          setJudgeReason(parsed.reason);
          setBattleLogs(prev => [...prev, `JUDGMENT RENDERED: ${parsed.score}%`]);
          return { score: parsed.score, reason: parsed.reason, response: fullText, rawRequest, rawResponse };
        } catch (e) {
          const fallback = 50;
          setJudgeScore(fallback);
          setJudgeReason("Manual validation required.");
          return { score: fallback, reason: "Validation parse fault.", response: fullText, rawRequest, rawResponse };
        }
      }
      return { score: 100, reason: 'Sync complete.', response: fullText, rawRequest, rawResponse };
    } catch (error: any) {
      setCurrentResponse(`CORE_FAULT: ${error.message}`);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setBattleLogs(prev => [...prev, `CRITICAL SYSTEM ERROR: ${(errorMsg || 'UNKNOWN ERROR').toUpperCase()}`]);
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const saveResult = async (test: GauntletTest, score: number, reason: string, response: string, rawRequest?: string, rawResponse?: string) => {
    const result: TestResult = { score, reason, response, rawRequest, rawResponse, ts: Date.now() };
    const isFirstPass = !state.testResults[test.id];
    
    updateState(s => ({
      ...s,
      testsRun: s.testsRun + 1,
      testResults: { ...s.testResults, [test.id]: result },
      gauntletHistory: [...(s.gauntletHistory || []), { testId: test.id, modelId: s.arenaModel!, result }],
      curStreak: score >= 80 ? s.curStreak + 1 : 0,
      maxStreak: Math.max(s.maxStreak, score >= 80 ? s.curStreak + 1 : 0),
    }));
    
    if (isFirstPass) addXP(Math.floor(test.xp * (score / 100)));
    
    if (score < 70) {
      notify("NEURAL ANOMALY: Trace captured for refinement.");
    } else {
      notify(`SECTOR SYNCED: +${Math.floor(test.xp * (score / 100))} XP`);
    }
  };

  const igniteSequence = async () => {
    if (!state.arenaModel) { notify("Select a neural core to ignite sequence."); return; }
    setIsChainRunning(true);
    notify("GAUNTLET INITIATED: Climbing Neural-Path...");

    for (let sIdx = 0; sIdx < stages.length; sIdx++) {
      setCurrentStageIdx(sIdx);
      const stage = stages[sIdx];
      
      for (const test of stage.tests) {
        if (state.testResults[test.id]) continue;
        setActiveTestId(test.id);
        const result = await runTest(test);
        if (result) {
          await saveResult(test, result.score, result.reason, result.response, result.rawRequest, result.rawResponse);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    setIsChainRunning(false);
    setActiveTestId(null);
    notify("GAUNTLET SUMMIT REACHED: Full neural verification complete.");
  };

  const performanceData = useMemo(() => {
    const history = [...state.gauntletHistory].sort((a, b) => a.result.ts - b.result.ts);
    let cumulativeTests = 0;
    let cumulativePerfect = 0;
    
    return history.map((entry, index) => {
      cumulativeTests++;
      if (entry.result.score === 100) cumulativePerfect++;
      return {
        index,
        time: new Date(entry.result.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tests: cumulativeTests,
        perfect: cumulativePerfect
      };
    });
  }, [state.gauntletHistory]);

  return (
    <div className="p-0 h-full overflow-hidden bg-[#050505] font-sans selection:bg-[var(--p)]/30">
      <div className="flex h-full">
        {/* LEFT: NEURAL PROGRESS PATH */}
        <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl p-5 flex flex-col gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-lg font-syne font-black uppercase italic tracking-tighter text-white">Neuro_Climb</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--p)]">Path to Sovereign AI</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {stages.map((stage, idx) => (
              <div 
                key={stage.name}
                onClick={() => !isChainRunning && setCurrentStageIdx(idx)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer relative group",
                  currentStageIdx === idx 
                    ? "bg-[var(--p)]/10 border-[var(--p)]/30 scale-[1.01]" 
                    : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                {currentStageIdx === idx && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-12 bg-[var(--p)] rounded-full shadow-[0_0_15px_var(--p)]"
                  />
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-30 text-white">Stage {idx + 1}</div>
                  {stage.status === 'complete' ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : stage.status === 'locked' ? (
                    <Lock size={12} className="opacity-20 text-white" />
                  ) : (
                    <Activity size={14} className="text-[var(--p)] animate-pulse" />
                  )}
                </div>

                <div className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[var(--p)] transition-colors">{stage.name}</div>
                
                <div className="flex gap-1 mt-3">
                  {stage.tests.map(t => (
                    <div 
                      key={t.id} 
                      className={cn(
                        "w-full h-1 rounded-full",
                        state.testResults[t.id] 
                          ? (state.testResults[t.id].score >= 70 ? "bg-emerald-500" : "bg-red-500") 
                          : "bg-white/10"
                      )} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Rank Progression</div>
                <div className="text-xl font-black text-white italic tracking-tighter">{currentRank.name}</div>
              </div>
              <div className="text-[10px] font-black text-[var(--p)] opacity-60 italic">{state.xp} XP</div>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progressToNext}%` }} className="h-full bg-[var(--p)] shadow-[0_0_15px_var(--p)]" />
            </div>
          </div>
        </aside>

        {/* CENTER: TACTICAL STAGE */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* HEADER BAR */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md relative z-20">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-[var(--p)]/10 rounded-2xl border border-[var(--p)]/20 text-[var(--p)] shadow-[0_0_30px_var(--p)]/20">
                <Brain size={20} />
              </div>
              <div>
                <h1 className="text-xl font-syne font-black uppercase italic tracking-tighter text-white">{activeStage.name}</h1>
                <div className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 text-white">Active Sector Calibration</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
               {/* JUDGE SELECTOR */}
               <div className="flex items-center gap-4 glass bg-white/5 border border-white/10 rounded-2xl p-2 px-6 shadow-2xl relative group cursor-pointer hover:border-emerald-500/40 transition-all">
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Neural Judge</span>
                    <span className="text-[10px] font-black uppercase italic text-emerald-400 truncate max-w-[150px]">{state.models.find(m => m.id === state.gauntletJudge)?.name || 'NONE'}</span>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  )}>
                    <Gavel size={20} />
                  </div>
                  <div className="absolute top-full right-0 mt-4 w-80 glass bg-black/95 border border-white/10 rounded-[40px] p-8 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="text-xs font-black uppercase italic text-emerald-400">Select Evaluator</div>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {state.models.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => updateState(s => ({ ...s, gauntletJudge: m.id }))}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center",
                              state.gauntletJudge === m.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/2 border-white/5 hover:bg-white/5"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-black uppercase text-white truncate leading-none mb-1">{m.name}</div>
                              <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">{m.backend}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>

               {/* CORE SELECTOR */}
               <div className="flex items-center gap-4 glass bg-white/5 border border-white/10 rounded-2xl p-2 px-6 shadow-2xl relative group cursor-pointer hover:border-[var(--p)]/40 transition-all">
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Neural Engine</span>
                    <span className="text-[10px] font-black uppercase italic text-white truncate max-w-[150px]">{state.models.find(m => m.id === state.arenaModel)?.name || 'OFFLINE'}</span>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    state.arenaModel ? "bg-[var(--p)]/20 border-[var(--p)]/40 text-[var(--p)]" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    {state.arenaModel ? <Cpu size={20} /> : <AlertTriangle size={20} />}
                  </div>

                  <div className="absolute top-full right-0 mt-4 w-80 glass bg-black/95 border border-white/10 rounded-[40px] p-8 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="text-xs font-black uppercase italic text-[var(--p)]">Available Cores</div>
                        <button onClick={scanLocalModels} className="text-[9px] font-black text-white/40 hover:text-white transition-colors">{isScanning ? 'Scrubbing...' : 'Rescan'}</button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {state.models.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => updateState(s => ({ ...s, arenaModel: m.id }))}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center",
                              state.arenaModel === m.id ? "bg-[var(--p)]/10 border-[var(--p)]/30" : "bg-white/2 border-white/5 hover:bg-white/5"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-black uppercase text-white truncate leading-none mb-1">{m.name}</div>
                              <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">{m.backend}</div>
                            </div>
                            <div className={cn("w-2 h-2 rounded-full", m.isLoaded ? "bg-emerald-500 shadow-[0_0_8px_emerald-500]" : "bg-white/10")} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>

               <button 
                onClick={igniteSequence}
                disabled={isChainRunning || !state.arenaModel}
                className={cn(
                  "px-10 py-5 rounded-[24px] text-xs font-black uppercase italic tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl disabled:opacity-20",
                  isChainRunning ? "bg-white/5 text-white/30" : "bg-white text-black hover:scale-105 active:scale-95"
                )}
               >
                 {isChainRunning ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
                 {isChainRunning ? 'ENGAGED' : 'IGNITE'}
               </button>
            </div>
          </header>

          {/* BATTLEGROUND */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative">
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--p)_0%,transparent_70%)] opacity-20 blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
              <AnimatePresence mode="wait">
                {activeTestId ? (
                  <motion.div 
                    key={activeTestId}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className="space-y-10"
                  >
                    {/* TACTICAL HEADER */}
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6 px-4">
                       <div className="flex items-center gap-8">
                          <div className="space-y-1">
                             <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 text-white italic">Neural Core</div>
                             <h2 className="text-3xl lg:text-4xl font-syne font-black uppercase italic tracking-tighter text-white">
                                {state.models.find(m => m.id === state.arenaModel)?.name || 'OFFLINE'}
                             </h2>
                          </div>
                          <motion.div 
                            animate={{ scale: isRunning ? [1, 1.2, 1] : 1 }}
                            className="text-2xl font-black text-[var(--p)] italic opacity-30 px-2"
                          >
                             VS
                          </motion.div>
                          <div className="space-y-1 max-w-xs">
                             <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 text-white italic">Sector Logic</div>
                             <div className="text-lg font-bold uppercase italic text-white/80 truncate">
                                {TESTS.find(t => t.id === activeTestId)?.name || 'Unknown Sector'}
                             </div>
                          </div>
                       </div>

                       <AnimatePresence>
                         {judgeScore !== null && (
                           <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             className={cn(
                               "px-8 py-4 rounded-3xl border-2 shadow-2xl flex items-center gap-6",
                               judgeScore >= 70 ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-red-500/10 border-red-500/40 text-red-400"
                             )}
                           >
                              <div className="text-center">
                                 <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</div>
                                 <div className="text-3xl font-black italic tracking-tighter">{judgeScore >= 70 ? 'PASS' : 'FAIL'}</div>
                              </div>
                              <div className="h-10 w-[1px] bg-white/10" />
                              <div className="text-center">
                                 <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Efficiency</div>
                                 <div className="text-3xl font-black italic tracking-tighter">{judgeScore}%</div>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>

                    {/* ARENA VISUALS */}
                    <BattleVisualizer 
                       isFighting={isRunning}
                       hpA={isRunning ? Math.min(100, Math.floor(currentResponse.length / 10)) : (judgeScore || 100)}
                       hpB={100}
                       logs={battleLogs}
                       className="h-[280px] lg:h-[320px]"
                    />

                    {/* CUSTOM PROMPT OVERRIDE */}
                    <div className="glass p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-[var(--p)]/20 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white/40">
                             <Sparkles size={14} className="text-[var(--p)]" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Tactical Override Vector</span>
                          </div>
                      {!isRunning && (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              const test = TESTS.find(t=>t.id===activeTestId);
                              if(test) setCustomPrompt(test.prompt);
                            }}
                            className="text-[10px] font-black text-blue-500/60 hover:text-blue-500 uppercase tracking-widest transition-colors"
                          >
                             Recover Base
                          </button>
                          <button 
                            onClick={() => setCustomPrompt('')}
                            className="text-[10px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
                          >
                             Clear Override
                          </button>
                        </div>
                      )}
                       </div>
                       <textarea 
                         value={customPrompt || TESTS.find(t=>t.id===activeTestId)?.prompt || ''}
                         onChange={(e) => setCustomPrompt(e.target.value)}
                         disabled={isRunning}
                         placeholder="Override test parameters..."
                         className="w-full bg-transparent text-lg font-bold italic text-white placeholder:text-white/10 outline-none resize-none h-20 leading-snug"
                       />
                       <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                          <div className="space-y-4">
                            <div className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] mb-2">Neural Tuning Parameters</div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/40 tracking-widest">
                                     <span>Temp</span>
                                     <span className="text-[var(--p)] italic">{state.models.find(m=>m.id===state.arenaModel)?.config?.temperature || 0.7}</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="2" step="0.1" 
                                    value={state.models.find(m=>m.id===state.arenaModel)?.config?.temperature || 0.7}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      const mid = state.arenaModel;
                                      if(mid) {
                                        updateState(s => ({
                                          ...s,
                                          models: s.models.map(m => m.id === mid ? { ...m, config: { ...(m.config || {}), temperature: val } } : m)
                                        }));
                                      }
                                    }}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--p)]"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/40 tracking-widest">
                                     <span>Max Tok</span>
                                     <span className="text-[var(--p)] italic">{state.models.find(m=>m.id===state.arenaModel)?.config?.maxTokens || 2048}</span>
                                  </div>
                                  <input 
                                    type="range" min="256" max="8192" step="256" 
                                    value={state.models.find(m=>m.id===state.arenaModel)?.config?.maxTokens || 2048}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      const mid = state.arenaModel;
                                      if(mid) {
                                        updateState(s => ({
                                          ...s,
                                          models: s.models.map(m => m.id === mid ? { ...m, config: { ...(m.config || {}), maxTokens: val } } : m)
                                        }));
                                      }
                                    }}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--p)]"
                                  />
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-end items-end gap-6">
                            <div className="text-[8px] font-black uppercase text-white/20 tracking-widest bg-white/[0.03] px-4 py-2 rounded-lg border border-white/5">
                               Status: <span className={customPrompt ? 'text-[var(--p)]' : 'text-white/40'}>{customPrompt ? 'MODIFIED DATASET' : 'BASE CALIBRATION'}</span>
                            </div>
                            <button 
                              onClick={async () => {
                                const test = TESTS.find(t=>t.id===activeTestId);
                                if (test) {
                                  const res = await runTest(test);
                                  if (res) saveResult(test, res.score, res.reason, res.response, res.rawRequest, res.rawResponse);
                                }
                              }}
                              disabled={isRunning}
                              className="group bg-white text-black pl-8 pr-6 py-4 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-4 group disabled:opacity-20"
                            >
                               Execute Trace
                               <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black transition-colors">
                                  <FastForward size={14} className="text-black group-hover:text-white transition-colors" />
                               </div>
                            </button>
                          </div>
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
                       <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-white px-4">
                             <span>Neural Reasoning Path</span>
                          </div>
                          <div className="h-[350px] lg:h-[450px] glass bg-black/60 rounded-[32px] lg:rounded-[48px] border border-white/10 p-8 lg:p-12 overflow-y-auto custom-scrollbar font-mono text-sm lg:text-base leading-relaxed text-white/80 shadow-inner relative group">
                             <div className="absolute top-4 right-8 lg:top-8 text-[8px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/20 transition-colors">Inference Output Stream</div>
                             {currentResponse || (isRunning ? 'Initializing neural tunnel...' : 'Awaiting tactical start.')}
                          </div>
                       </div>
                       <div className="space-y-4">
                           <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-white px-4">Analysis Matrix</div>
                           <motion.div 
                              initial={false}
                              animate={judgeScore !== null ? { scale: [1, 1.02, 1] } : {}}
                              className={cn(
                                "glass p-8 rounded-[32px] lg:rounded-[48px] border flex flex-col h-[350px] lg:h-[450px] shadow-2xl relative transition-all duration-700 overflow-hidden",
                                judgeScore === null ? "bg-white/[0.01] border-white/10" :
                                judgeScore >= 70 ? "bg-emerald-500/[0.03] border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.05)]" :
                                "bg-red-500/[0.03] border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.05)]"
                              )}
                           >
                              <div className="space-y-8 relative z-10 h-full flex flex-col">
                                 {judgeReason ? (
                                    <div className="flex-1 space-y-10 flex flex-col h-full">
                                       <div className="space-y-4">
                                          <div className={cn(
                                            "flex items-center gap-3 font-black uppercase text-[10px] tracking-widest italic border-b pb-4",
                                            judgeScore >= 70 ? "text-emerald-500 border-emerald-500/20" : "text-red-500 border-red-500/20"
                                          )}>
                                             <Gavel size={14} /> Judgment Captured
                                          </div>
                                          
                                          {/* PASS/FAIL LARGE BADGE */}
                                          <div className="flex items-center gap-6 pt-4">
                                             <div className={cn(
                                               "w-16 h-16 rounded-2xl flex items-center justify-center border text-3xl font-black italic",
                                               judgeScore >= 70 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-red-500/20 border-red-500/40 text-red-400"
                                             )}>
                                                {judgeScore >= 70 ? 'P' : 'F'}
                                             </div>
                                             <div>
                                                <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 text-white mb-1">Efficiency Metric</div>
                                                <div className={cn("text-4xl lg:text-5xl font-black italic tracking-tighter leading-none", judgeScore >= 70 ? "text-emerald-400" : "text-red-400")}>{judgeScore}%</div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="space-y-4 flex-1">
                                          <div className="text-[9px] font-black uppercase text-white/20 tracking-widest italic">Rationalization</div>
                                          <div className="bg-black/40 p-8 rounded-[32px] border border-white/5 flex-1 relative overflow-hidden group/reason">
                                             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/0 via-white/10 to-white/0" />
                                             <p className="text-lg font-bold italic text-white/80 leading-relaxed overflow-y-auto h-full max-h-[180px] custom-scrollbar pr-4">
                                                "{judgeReason}"
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-10">
                                       <Brain size={120} className="animate-pulse" />
                                       <div className="text-xs font-black uppercase tracking-[0.5em]">Awaiting Analysis</div>
                                    </div>
                                 )}
                              </div>
                              <div className={cn(
                                 "pt-8 border-t space-y-4 relative z-10 transition-colors duration-700",
                                 judgeScore === null ? "border-white/5" :
                                 judgeScore >= 70 ? "border-emerald-500/20" : "border-red-500/20"
                              )}>
                                 <div className="text-[9px] font-black uppercase text-white/20 tracking-widest italic">Verification Strategy</div>
                                 <div className="text-[11px] font-medium text-white/40 italic line-clamp-3 leading-relaxed">
                                   "{TESTS.find(t=>t.id===activeTestId)?.judge}"
                                 </div>
                              </div>
                           </motion.div>
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pt-10">
                    <div className="text-center space-y-6 max-w-2xl mx-auto">
                       <h2 className="text-5xl font-syne font-black uppercase italic tracking-tighter text-white leading-none">
                          Neural <span className="text-[var(--p)]">Gauntlet</span>
                       </h2>
                       <p className="text-base font-medium text-white/40 italic">Select a core and ignite the tactical sequence to verify cognitive stability.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {activeStage.tests.map(test => {
                          const res = state.testResults[test.id];
                          return (
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              key={test.id}
                              onClick={() => !isChainRunning && setActiveTestId(test.id)}
                              className={cn(
                                "glass p-8 rounded-[32px] border transition-all relative overflow-hidden group cursor-pointer flex flex-col h-full",
                                res ? (res.score >= 70 ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-red-500/30 bg-red-500/[0.02]") : "border-white/5 hover:border-[var(--p)]/40 hover:bg-[var(--p)]/5"
                              )}
                            >
                              <div className="flex-1 space-y-6">
                                 <h4 className="text-xl font-syne font-black uppercase italic text-white leading-tight">{test.name}</h4>
                                 <p className="text-xs font-medium text-white/30 italic line-clamp-2">"{test.desc}"</p>
                              </div>
                              <div className="mt-8 flex items-center justify-between">
                                 {res ? (
                                    <div className={cn("text-2xl font-syne font-black italic", res.score >= 70 ? "text-emerald-500" : "text-red-500")}>
                                       {res.score}%
                                    </div>
                                 ) : <span className="text-[10px] font-black uppercase text-[var(--p)]">ENGAGE</span>}
                                 <div className="text-right text-xs font-black text-white italic">{test.xp} XP</div>
                              </div>
                            </motion.div>
                          );
                       })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <aside className="w-64 lg:w-72 border-l border-white/5 bg-black/40 backdrop-blur-xl p-6 lg:p-8 flex flex-col gap-6 lg:gap-10 relative z-30 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-white opacity-40">Performance Center</h3>
            <div className="space-y-3">
               {[
                 { label: 'Neural Tests', val: state.gauntletHistory.length, color: 'text-[var(--p)]', icon: Activity },
                 { label: 'Perfect Scores', val: state.gauntletHistory.filter(h => h.result.score === 100).length, color: 'text-emerald-400', icon: Trophy },
               ].map(stat => (
                 <div key={stat.label} className="glass p-4 rounded-[20px] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className={stat.color} />
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/40">{stat.label}</div>
                    </div>
                    <div className={cn("text-lg font-black italic", stat.color)}>{stat.val}</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex-1 space-y-8">
             <div className="space-y-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Neural Progression</div>
                <div className="h-40 relative glass border border-white/5 rounded-2xl overflow-hidden p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--p)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--p)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPerfect" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="tests" stroke="var(--p)" fillOpacity={1} fill="url(#colorTests)" name="Tests Run" />
                      <Area type="monotone" dataKey="perfect" stroke="#10b981" fillOpacity={1} fill="url(#colorPerfect)" name="Perfect Scores" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="space-y-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Accuracy Stream</div>
                <div className="h-32 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Object.entries(state.testResults).map(([id, r]) => ({ score: r.score }))}>
                      <Area type="step" dataKey="score" stroke="var(--p)" strokeWidth={2} fill="var(--p)" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
