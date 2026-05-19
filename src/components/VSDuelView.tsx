import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Swords,
  Zap,
  RefreshCw,
  Activity,
  Bot,
  Send,
  ChevronRight,
  Brain,
  Shield,
  Info,
  Sparkles,
  Settings2,
  Search,
  Sliders,
  Target,
  Layout,
  History,
  Trophy,
  Medal,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../lib/utils";
import { AppState, Model, BattleRecord } from "../types";
import BattleVisualizer from "./BattleVisualizer";
import { BATTLE_TYPES } from "../constants";
import {
  generateBenchmarkTask,
  runNeuralInference,
  evaluateDuel,
  getDuelLogEntry,
} from "../services/geminiService";

interface VSDuelViewProps {
  state: AppState;
  updateState: any;
  notify: any;
  addXP: (amount: number) => void;
  toggleModelLoad: (id: string) => void;
}

export default function VSDuelView({
  state,
  updateState,
  notify,
  addXP,
  toggleModelLoad,
}: VSDuelViewProps) {
  const [duelPrompt, setDuelPrompt] = useState(
    state.arenaConfig.battle?.prompt || "",
  );
  const [isFighting, setIsFighting] = useState(false);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [hpA, setHpA] = useState(100);
  const [hpB, setHpB] = useState(100);
  const [showCalibration, setShowCalibration] = useState(false);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [showSearchA, setShowSearchA] = useState(false);
  const [showSearchB, setShowSearchB] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    winner: string;
    reason: string;
    scoreA: number;
    scoreB: number;
  } | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Derived models from state
  const defaultModel: Model = {
    id: 'fallback',
    name: 'NO_MODEL',
    backend: 'Custom',
    rarity: 'common',
    score: 0,
    level: 1,
    xp: 0,
    powerRating: 60,
    config: {}
  };
  const modelA = state.models?.find((m) => m.id === state.chatModel) || state.models?.[0] || defaultModel;
  const modelB = state.models?.find((m) => m.id === state.arenaConfig?.battle?.modelB) || state.models?.[1] || state.models?.[0] || defaultModel;

  const radarData = [
    {
      subject: "Obedience",
      A: modelA?.score || 50,
      B: modelB?.score || 50,
      fullMark: 100,
    },
    { subject: "Memory", A: 85, B: 88, fullMark: 100 },
    { subject: "Creativity", A: 78, B: 94, fullMark: 100 },
    { subject: "Reasoning", A: 95, B: 82, fullMark: 100 },
    { subject: "Accuracy", A: 90, B: 85, fullMark: 100 },
    { subject: "Speed", A: 42, B: 78, fullMark: 100 },
  ];

  const categories = BATTLE_TYPES;

  const handleStartBattle = async () => {
    if (isFighting) return;

    setIsFighting(true);
    setBattleResult(null);
    setHpA(100);
    setHpB(100);
    setCombatLogs([
      "[SYSTEM] INITIALIZING LOGIC CORES...",
      "[SYSTEM] SCANNING NEURAL BACKENDS...",
      "[CHALLENGE] GENERATING AUTHENTIC TASK...",
    ]);
    notify("Real-Time Neural Engagement Initiated.");

    try {
      // 1. Generate Task
      const mode = BATTLE_TYPES.find(
        (t) => t.id === (state.arenaConfig.battle?.battleType || "ctf"),
      );
      const task = await generateBenchmarkTask(
        mode?.id || "gen",
        mode?.name || "General",
      );
      if (task.includes("Neural Error") || task.includes("429") || task.includes("Rate exceeded")) {
        throw new Error("Task generation failed: rate limited.");
      }
      setCombatLogs((prev) => [
        ...prev,
        `[VECTOR_LOCKED] ${task.length > 80 ? task.slice(0, 80) + "..." : task}`,
      ]);

      // 2. Run Inferences
      setCombatLogs((prev) => [
        ...prev,
        `[CORE_RED] POLLING: ${modelA.name}...`,
        `[CORE_BLUE] POLLING: ${modelB.name}...`,
      ]);

      const [respA, respB] = await Promise.all([
        runNeuralInference(modelA, task),
        runNeuralInference(modelB, task),
      ]);

      if (respA.includes("Neural Error") || respA.includes("429") || respB.includes("Neural Error") || respB.includes("429")) {
        throw new Error("One or both models hit rate limits. Abandoning duel.");
      }

      setCombatLogs((prev) => [
        ...prev,
        "[RED_TEAM] DATA TRANSMITTED.",
        "[BLUE_TEAM] DATA TRANSMITTED.",
        "[SYSTEM] ARBITRATING NEURAL OUTPUTS...",
      ]);

      // 3. Evaluate
      const result = await evaluateDuel(
        duelPrompt,
        task,
        respA,
        respB,
        modelA.name,
        modelB.name,
      );

      if (result.rationale.includes("Neural Error") || result.rationale.includes("429")) {
        throw new Error("Arbitration failed due to API rate limit constraints.");
      }

      setBattleResult(result);

      const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      };

      // 4. Turn-Based HP Depletion with Sensory Feedback
      setCombatLogs((prev) => [
        ...prev,
        "[SYSTEM] EXECUTING SECTOR STRIKES...",
      ]);

      // Round 1: Model A hits Model B (Damage based on A's score parity)
      await new Promise((r) => setTimeout(r, 800));
      setCombatLogs((prev) => [
        ...prev,
        `[STRIKE] ${(modelA?.name || 'UNKNOWN').toUpperCase()} ENGAGED...`,
      ]);
      triggerShake();
      setHpB((prev) => Math.max(result.scoreB, prev - 20));
      await new Promise((r) => setTimeout(r, 600));
      setHpB(result.scoreB); // Settle to final

      // Round 2: Model B hits Model A
      await new Promise((r) => setTimeout(r, 800));
      setCombatLogs((prev) => [
        ...prev,
        `[STRIKE] ${(modelB?.name || 'UNKNOWN').toUpperCase()} RECOILING...`,
      ]);
      triggerShake();
      setHpA((prev) => Math.max(result.scoreA, prev - 20));
      await new Promise((r) => setTimeout(r, 600));
      setHpA(result.scoreA); // Settle to final

      const finalWinner =
        result.winner === "Red"
          ? modelA.name
          : result.winner === "Blue"
            ? modelB.name
            : "Tie";

      // 5. Record History
      const record: BattleRecord = {
        id: `battle-${Date.now()}`,
        ts: Date.now(),
        modelA: modelA.name,
        modelB: modelB.name,
        type: mode?.name || "General",
        prompt: duelPrompt,
        task,
        scoreA: result.scoreA,
        scoreB: result.scoreB,
        winner: result.winner,
        reason: result.reason,
      };

      updateState((s: AppState) => ({
        ...s,
        battleHistory: [record, ...(s.battleHistory || [])].slice(0, 50),
      }));

      setCombatLogs((prev) => [
        ...prev,
        `[COMPLETE] NEURAL SUPREMACY ACHIEVED: ${(finalWinner || 'DRAW').toUpperCase()}`,
        `[SUMMARY] ${result.reason}`,
      ]);

      addXP(Math.round((result.scoreA + result.scoreB) * 2.5));
      notify(`Battle Finalized: ${finalWinner} Wins. Neural Growth Captured.`);
    } catch (error: any) {
      setCombatLogs((prev) => [...prev, `[CRITICAL_FAILURE] ${error.message}`]);
      notify("Neural Desync Detected.");
    } finally {
      setIsFighting(false);
    }
  };

  const updateConfig = (modelId: string, updates: Partial<Model["config"]>) => {
    updateState((s: AppState) => ({
      ...s,
      models: s.models.map((m) =>
        m.id === modelId ? { ...m, config: { ...(m.config || {}), ...updates } as any } : m,
      ),
    }));
  };

  const ModelSelector = ({
    selectedModel,
    onSelect,
    search,
    setSearch,
    show,
    setShow,
    side,
  }: {
    selectedModel: Model;
    onSelect: (id: string) => void;
    search: string;
    setSearch: (v: string) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    side: "Red" | "Blue";
  }) => {
    const rarityColors = {
      common: "text-gray-400",
      rare: "text-emerald-400",
      epic: "text-purple-400",
      legendary: "text-amber-400",
    };

    return (
      <div className={cn("relative", show ? "z-[100]" : "z-10")}>
        <button
          onClick={() => setShow(!show)}
          className={cn(
            "w-full glass p-6 rounded-3xl border flex items-center justify-between transition-all group hover:scale-[1.02]",
            side === "Red"
              ? "border-red-500/20 hover:border-red-500/50"
              : "border-blue-500/20 hover:border-blue-500/50",
          )}
        >
          <div className="flex items-center gap-4 text-left">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0",
                side === "Red"
                  ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
              )}
            >
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {side} Team Core
                </div>
                <div
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5",
                    rarityColors[selectedModel.rarity],
                  )}
                >
                  {selectedModel.rarity}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-black uppercase italic tracking-tighter text-white">
                  {selectedModel?.name}
                </div>
                <div className="text-[9px] font-black text-white/20 italic">
                  LVL {selectedModel.level}
                </div>
              </div>
            </div>
          </div>
          <Search size={16} className="text-white/20 group-hover:text-white" />
        </button>

        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-4 glass bg-black/95 border border-white/10 rounded-[32px] p-6 z-[100] shadow-2xl"
            >
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    type="text"
                    placeholder="Search neural kernels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-[10px] uppercase font-black tracking-widest outline-none focus:border-[var(--p)]/40 text-white"
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {state.models
                    .filter((m) =>
                      m.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelect(m.id);
                          setShow(false);
                        }}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all",
                          selectedModel.id === m.id
                            ? side === "Red"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                            : "hover:bg-white/5 text-white/40 hover:text-white",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-black uppercase italic truncate">
                              {m.name}
                            </div>
                            <div
                              className={cn(
                                "text-[7px] font-black uppercase",
                                rarityColors[m.rarity],
                              )}
                            >
                              {m.rarity}
                            </div>
                          </div>
                          <div className="text-[8px] font-bold opacity-30 mt-0.5">
                            {m.backend} — {m.size || "N/A"}
                          </div>
                        </div>
                        {m.isLoaded && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "h-full overflow-y-auto p-6 lg:p-8 bg-black/40 custom-scrollbar transition-transform",
        isShaking && "animate-shake",
      )}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-32">
        {/* HEADER & GAME MODE SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-syne font-black uppercase italic tracking-tighter text-white">
              Neural Arena
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 text-white">
              Sovereign Combat Protocol v2.4
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 pl-4">
                Game Mode
              </div>
              <div className="relative">
                <select
                  className="glass bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none hover:border-[var(--p)]/50 hover:bg-white/5 transition-all cursor-pointer appearance-none text-white pr-12 min-w-[220px]"
                  onChange={(e) => {
                    const val = e.target.value;
                    const defPrompt =
                      BATTLE_TYPES.find((t) => t.id === val)?.defaultPrompt ||
                      "";
                    setDuelPrompt(defPrompt);
                    updateState((s: AppState) => ({
                      ...s,
                      arenaConfig: {
                        ...s.arenaConfig,
                        battle: {
                          ...(s.arenaConfig.battle || ({} as any)),
                          battleType: val,
                          prompt: defPrompt,
                        },
                      },
                    }));
                  }}
                  value={state.arenaConfig.battle?.battleType || "ctf"}
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-neutral-900 py-4"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Layout
                  size={14}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCalibration(!showCalibration)}
              className={cn(
                "p-5 rounded-2xl transition-all border shrink-0",
                showCalibration
                  ? "bg-[var(--p)] border-[var(--p)] text-white shadow-[0_0_20px_var(--p)]"
                  : "glass border-white/5 text-white/40 hover:text-white",
              )}
            >
              <Settings2 size={24} />
            </button>
          </div>
        </div>

        {/* TEAM SELECTION - RED VS BLUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ModelSelector
            side="Red"
            selectedModel={modelA}
            onSelect={(id) =>
              updateState((s: AppState) => ({ ...s, chatModel: id }))
            }
            search={searchA}
            setSearch={setSearchA}
            show={showSearchA}
            setShow={setShowSearchA}
          />
          <ModelSelector
            side="Blue"
            selectedModel={modelB}
            onSelect={(id) =>
              updateState((s: AppState) => ({
                ...s,
                arenaConfig: {
                  ...s.arenaConfig,
                  battle: { ...s.arenaConfig.battle, modelB: id },
                },
              }))
            }
            search={searchB}
            setSearch={setSearchB}
            show={showSearchB}
            setShow={setShowSearchB}
          />
        </div>

        {/* BATTLE VISUALIZER - EPIC INTEGRATION */}
        <div className="space-y-4">
          <BattleVisualizer
            isFighting={isFighting}
            hpA={hpA}
            hpB={hpB}
            logs={combatLogs}
            className="h-[350px] rounded-[40px]"
          />
        </div>

        {/* PROMPT & CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/20">
                  <Target size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">
                    Neural Engagement Parameters
                  </span>
                </div>
                <div className="flex gap-2">
                  {state.arenaConfig.battle?.battleType && (
                    <div className="relative">
                      <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const val = e.target.value;
                          const defPrompt =
                            BATTLE_TYPES.find((t) => t.id === val)
                              ?.defaultPrompt || "";
                          setDuelPrompt(defPrompt);
                          updateState((s: AppState) => ({
                            ...s,
                            arenaConfig: {
                              ...s.arenaConfig,
                              battle: {
                                ...(s.arenaConfig.battle || ({} as any)),
                                battleType: val,
                                prompt: defPrompt,
                              },
                            },
                          }));
                        }}
                        value={state.arenaConfig.battle?.battleType || "ctf"}
                      >
                        {BATTLE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <div className="px-3 py-1 bg-[var(--p)]/10 border border-[var(--p)]/20 rounded text-[9px] font-black uppercase text-[var(--p)] flex items-center gap-2 hover:bg-[var(--p)]/20 transition-all">
                        <Sparkles size={10} />
                        MODE:{" "}
                        {
                          BATTLE_TYPES.find(
                            (t) =>
                              t.id === state.arenaConfig.battle?.battleType,
                          )?.name
                        }
                        <ChevronRight size={10} className="opacity-40" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <textarea
                value={duelPrompt}
                onChange={(e) => setDuelPrompt(e.target.value)}
                placeholder="Define the neural conflict logic..."
                className="w-full bg-transparent text-xl font-black uppercase italic tracking-tighter text-white placeholder:text-white/5 outline-none resize-none h-24 leading-tight"
              />
              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={handleStartBattle}
                  disabled={isFighting}
                  className="bg-white text-black px-12 py-5 rounded-[24px] font-black uppercase italic tracking-[0.3em] text-xs flex items-center gap-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                >
                  {isFighting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Swords size={18} className="fill-current" />
                  )}
                  {isFighting ? "COMBAT ACTIVE" : "IGNITE DUEL"}
                </button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className={`grid grid-cols-2 gap-6 px-4 ${isShaking ? 'animate-[shake_0.2s_ease-in-out_infinite]' : ''}`}>
              {/* TEAM RED */}
              <div className="glass p-8 rounded-[40px] border border-red-500/20 bg-gradient-to-br from-red-500/10 via-transparent to-transparent space-y-6 relative overflow-hidden group">
                {/* Rarity & Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                        modelA.rarity === 'common' ? "bg-slate-500/20 text-slate-400 border-slate-500/20" :
                        modelA.rarity === 'rare' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
                        modelA.rarity === 'epic' ? "bg-purple-500/20 text-purple-400 border-purple-500/20" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-amber-500/20"
                      )}>
                        {modelA.rarity}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <Shield size={10} className="fill-current" />
                        CORE_STABILITY
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 leading-none">
                      Team Red Logic Core
                    </h4>
                  </div>
                  <motion.div 
                    animate={isFighting ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner"
                  >
                    <Activity size={20} className="text-red-500" />
                  </motion.div>
                </div>

                {/* Integrity Bar */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Structural Integrity</span>
                    <span className="text-xs font-black text-white tabular-nums tracking-tighter">{Math.round(hpA)}%</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5 relative group-hover:bg-black/60 transition-colors">
                    <motion.div
                      animate={{ width: `${hpA}%` }}
                      className={cn(
                        "h-full rounded-full relative",
                        hpA > 50 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : 
                        hpA > 20 ? "bg-orange-500 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.6)]" : 
                        "bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </motion.div>
                  </div>
                </div>

                {/* Growth Mastery */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <TrendingUp size={14} className="text-red-500" />
                      </div>
                      <div>
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Growth Mastery</div>
                        <div className="text-[11px] font-black text-white italic tracking-tighter uppercase">Neural Tier 0{Math.floor(modelA.level / 10) + 1}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-black text-red-500 italic drop-shadow-sm">LVL {modelA.level}</div>
                      <div className="text-[7px] font-black opacity-40 uppercase tracking-tighter">MAX RANK: 99</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(modelA.xp % 1000) / 10}%` }}
                      className="h-full bg-gradient-to-r from-red-900/60 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    />
                  </div>
                </div>

                {/* Real-time Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-5 bg-black/30 rounded-[24px] border border-white/5 group-hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={10} className="text-red-500/40" />
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Bandwidth</span>
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                      42.3 <span className="text-[10px] opacity-20 not-italic ml-1">T/S</span>
                    </div>
                  </div>
                  <div className="p-5 bg-black/30 rounded-[24px] border border-white/5 group-hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={10} className="text-red-500/40" />
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Certainty</span>
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                      92.4 <span className="text-[10px] opacity-20 not-italic ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEAM BLUE */}
              <div className="glass p-8 rounded-[40px] border border-blue-500/20 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent space-y-6 text-right relative overflow-hidden group">
                {/* Rarity & Header */}
                <div className="flex justify-between items-start flex-row-reverse">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                        modelB.rarity === 'common' ? "bg-slate-500/20 text-slate-400 border-slate-500/20" :
                        modelB.rarity === 'rare' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
                        modelB.rarity === 'epic' ? "bg-purple-500/20 text-purple-400 border-purple-500/20" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-amber-500/20"
                      )}>
                        {modelB.rarity}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-[8px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Shield size={10} className="fill-current" />
                        CORE_STABILITY
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 leading-none">
                      Team Blue Logic Core
                    </h4>
                  </div>
                  <motion.div 
                    animate={isFighting ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner"
                  >
                    <Activity size={20} className="text-blue-500" />
                  </motion.div>
                </div>

                {/* Integrity Bar */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-end flex-row-reverse">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Structural Integrity</span>
                    <span className="text-xs font-black text-white tabular-nums tracking-tighter">{Math.round(hpB)}%</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5 relative group-hover:bg-black/60 transition-colors">
                    <motion.div
                      animate={{ width: `${hpB}%` }}
                      className={cn(
                        "h-full rounded-full relative ml-auto",
                        hpB > 50 ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : 
                        hpB > 20 ? "bg-cyan-500 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.6)]" : 
                        "bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent" />
                    </motion.div>
                  </div>
                </div>

                {/* Growth Mastery */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <TrendingUp size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">Growth Mastery</div>
                        <div className="text-[11px] font-black text-white italic tracking-tighter uppercase">Neural Tier 0{Math.floor(modelB.level / 10) + 1}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-[14px] font-black text-blue-500 italic drop-shadow-sm">LVL {modelB.level}</div>
                      <div className="text-[7px] font-black opacity-40 uppercase tracking-tighter text-right">MAX RANK: 99</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(modelB.xp % 1000) / 10}%` }}
                      className="h-full bg-gradient-to-l from-blue-900/60 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] ml-auto"
                    />
                  </div>
                </div>

                {/* Real-time Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-5 bg-black/30 rounded-[24px] border border-white/5 group-hover:border-blue-500/20 transition-all text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={10} className="text-blue-500/40" />
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Bandwidth</span>
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                      78.1 <span className="text-[10px] opacity-20 not-italic ml-1">T/S</span>
                    </div>
                  </div>
                  <div className="p-5 bg-black/30 rounded-[24px] border border-white/5 group-hover:border-blue-500/20 transition-all text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={10} className="text-blue-500/40" />
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Certainty</span>
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                      88.2 <span className="text-[10px] opacity-20 not-italic ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL: CALIBRATION OR RADAR */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {showCalibration ? (
                <motion.div
                  key="calibration"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass p-10 rounded-[56px] border border-[var(--p)]/20 space-y-10"
                >
                  <div className="flex items-center gap-4 text-[var(--p)]">
                    <Sliders size={20} />
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">
                      Pre-Tuning Menu
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {[
                      {
                        label: "Temperature",
                        key: "temperature",
                        min: 0,
                        max: 2,
                        step: 0.1,
                        val: modelA.config?.temperature || 0.7,
                      },
                      {
                        label: "Top P",
                        key: "topP",
                        min: 0,
                        max: 1,
                        step: 0.01,
                        val: modelA.config?.topP || 0.9,
                      },
                      {
                        label: "Top K",
                        key: "topK",
                        min: 0,
                        max: 100,
                        step: 1,
                        val: modelA.config?.topK || 40,
                      },
                      {
                        label: "Repetition Penalty",
                        key: "repeatPenalty",
                        min: 1,
                        max: 2,
                        step: 0.05,
                        val: modelA.config?.repeatPenalty || 1.1,
                      },
                    ].map((param) => (
                      <div key={param.key} className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                            {param.label}
                          </label>
                          <span className="text-[10px] font-black text-[var(--p)]">
                            {param.val}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={param.val}
                          onChange={(e) =>
                            updateConfig(modelA.id, {
                              [param.key]: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--p)]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="text-[8px] font-black uppercase text-white/20 tracking-widest">
                      Active Constraints
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Context Isolation", "No Telemetry", "Zero-shot"].map(
                        (tag) => (
                          <div
                            key={tag}
                            className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-white/60 uppercase"
                          >
                            {tag}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-10 rounded-[56px] border border-white/5 space-y-10 relative overflow-hidden"
                >
                  {/* Radar Pulse Effect */}
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.15, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full pointer-events-none"
                  />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
                        Cognitive Radar
                      </h3>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">
                        Global Capability Sync
                      </p>
                    </div>
                    <Target
                      size={18}
                      className="text-[var(--p)] animate-pulse"
                    />
                  </div>

                  <div className="h-[280px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={radarData}
                      >
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "rgba(255,255,255,0.3)",
                            fontSize: 8,
                            fontWeight: 900,
                          }}
                        />
                        <Radar
                          name="Red Team"
                          dataKey="A"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="#ef4444"
                          fillOpacity={0.4}
                        />
                        <Radar
                          name="Blue Team"
                          dataKey="B"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="#3b82f6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-red-500 tracking-widest italic">
                        Dominance Protcol
                      </span>
                      <span className="text-[10px] font-black text-white italic">
                        RED +62% OVERRIDE
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 flex p-0.5">
                      <div
                        className="h-full bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        style={{ width: "62%" }}
                      />
                      <div
                        className="h-full bg-blue-500 rounded-full opacity-40 ml-auto"
                        style={{ width: "38%" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* COMPACT LOG FEED - EPIC UPGRADE */}
            <div className="glass p-10 rounded-[56px] border border-white/5 flex flex-col min-h-[350px] relative overflow-hidden group">
              {/* Scanline Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20"
                style={{ backgroundSize: "100% 4px, 3px 100%" }}
              />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-[var(--p)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
                    Engagement Stream
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="flex-1 font-mono text-[10px] space-y-4 overflow-y-auto custom-scrollbar bg-black/60 p-8 rounded-[40px] border border-white/5 shadow-2xl relative z-10 transition-all group-hover:bg-black/40">
                {combatLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "leading-relaxed flex gap-3",
                      log.includes("COMPLETE")
                        ? "text-emerald-400 font-bold"
                        : log.includes("RED")
                          ? "text-red-400"
                          : log.includes("BLUE")
                            ? "text-blue-400"
                            : "text-white/40 shadow-[0_0_10px_rgba(255,255,255,0.05)]",
                    )}
                  >
                    <span className="opacity-20 shrink-0 select-none">
                      [{i.toString().padStart(2, "0")}]
                    </span>
                    <span
                      className={cn(
                        log.includes("RED") &&
                          "drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]",
                        log.includes("BLUE") &&
                          "drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]",
                        log.includes("COMPLETE") &&
                          "drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]",
                      )}
                    >
                      {log}
                    </span>
                  </motion.div>
                ))}
                {combatLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 py-16">
                    <Activity size={32} className="mb-4" />
                    <div className="text-[9px] font-black uppercase tracking-[0.3em]">
                      Neural Flux Standby...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BATTLE HISTORY LOG - NEW SECTION */}
        <div className="space-y-10 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white/40">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-syne font-black uppercase italic tracking-tighter text-white">
                  Engagement Archives
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white">
                  Localized Neural Conflict History
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  Global Win Rate (Red)
                </div>
                <div className="text-xl font-black text-red-500 italic">
                  {state.battleHistory.length > 0
                    ? Math.round(
                        (state.battleHistory.filter((h) => h.winner === "Red")
                          .length /
                          state.battleHistory.length) *
                          100,
                      )
                    : 0}
                  %
                </div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {state.battleHistory.length === 0 ? (
              <div className="col-span-full h-64 glass rounded-[64px] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 opacity-20">
                <Clock size={48} />
                <div className="text-center">
                  <span className="block text-sm font-black uppercase tracking-[0.3em]">
                    Neural Ledger Empty
                  </span>
                  <span className="text-[10px] font-medium opacity-60">
                    Initiate combat to populate sector data
                  </span>
                </div>
              </div>
            ) : (
              state.battleHistory.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-10 rounded-[56px] border border-white/10 group hover:border-[var(--p)]/30 hover:bg-white/[0.02] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                    {record.winner === "Red" ? (
                      <Trophy size={60} className="text-red-500" />
                    ) : (
                      <Trophy size={60} className="text-blue-500" />
                    )}
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/20 tracking-widest">
                      <div className="flex items-center gap-2">
                        <Medal
                          size={12}
                          className={
                            record.winner === "Red"
                              ? "text-red-500"
                              : "text-blue-500"
                          }
                        />
                        {record.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        {new Date(record.ts).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-sm font-black uppercase italic truncate",
                              record.winner === "Red"
                                ? "text-red-500"
                                : "text-white/60",
                            )}
                          >
                            {record.modelA}
                          </div>
                          <div className="text-[10px] font-black text-red-500/40">
                            {record.scoreA}%
                          </div>
                        </div>
                        <div className="text-[8px] font-black text-white/10 italic">
                          VS
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div
                            className={cn(
                              "text-sm font-black uppercase italic truncate",
                              record.winner === "Blue"
                                ? "text-blue-500"
                                : "text-white/60",
                            )}
                          >
                            {record.modelB}
                          </div>
                          <div className="text-[10px] font-black text-blue-500/40">
                            {record.scoreB}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-red-500 rounded-full shadow-[0_0_10px_red]"
                          style={{ width: `${record.scoreA}%` }}
                        />
                        <div
                          className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_blue] ml-auto"
                          style={{ width: `${record.scoreB}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">
                        Neural Outcome
                      </div>
                      <p className="text-xs font-medium text-white/60 italic leading-relaxed line-clamp-3">
                        "{record.reason}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--p)] hover:text-white transition-colors">
                        <FileText size={12} /> View Trace
                      </button>
                      <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">
                        ID: {record.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
