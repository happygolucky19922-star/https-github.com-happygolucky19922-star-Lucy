import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AGENT_SKILLS } from "../services/agentService";
import {
  Send,
  Sparkles,
  Zap,
  Target,
  Code2,
  ListChecks,
  ChevronRight,
  Plus,
  Compass,
  Layout,
  Cpu,
  Database,
  ShieldCheck,
  Fingerprint,
  Bot,
  Terminal,
  Smartphone,
  FilePlus,
  Image as ImageIcon,
  Camera,
  FolderPlus,
  Globe,
  Share2,
  Hash,
  Cloud,
  Monitor,
  Rocket,
  Brain
} from "lucide-react";
import { cn } from "../lib/utils";
import { AppState } from "../types";

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function AppBuilderRightPanel({
  state,
  updateState,
  notify,
}: Props) {
  const [input, setInput] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const toggleScreenShare = async () => {
    if (state.isScreenSharing) {
      updateState((s) => ({ ...s, isScreenSharing: false }));
      notify("Screen session terminated.");
      return;
    }
    try {
      notify("Activating Neural Screen Stream...");
      await new Promise((r) => setTimeout(r, 800));
      updateState((s) => ({ ...s, isScreenSharing: true }));
      notify(
        "Tactical Screen Feed active. System is observing your workspace.",
      );
    } catch (err) {
      notify("Failed to initialize screen capture tunnel.");
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        prompt: input,
      },
    }));
    setInput("");
    notify("Angelic Agent receiving mission parameters...");
  };

  const [activeSkill, setActiveSkill] = useState(AGENT_SKILLS[0].id);

  return (
    <div className="h-full flex flex-col bg-[var(--surface-low)] text-[var(--txt-high)] border-l border-[var(--border)] relative overflow-hidden backdrop-blur-xl">
      {/* HEADER */}
      <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]/60 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--p)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--p)] to-[var(--a)] border border-[var(--border)] flex items-center justify-center text-white shadow-[0_0_15px_var(--pg)] relative">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col relative">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Lucy_AI
          </h3>
          <span className="text-[9px] font-medium text-white/50 uppercase tracking-widest leading-none">
            Neural Command Center
          </span>
        </div>
      </div>

      {/* CHAT AREA / COCKPIT */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
        {state.appBuilder.isBuilding ? (
          <div className="space-y-6">
            <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  Active_Synthesis
                </span>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              </div>
              <div className="space-y-3">
                {Object.entries(state.appBuilder.pipeline).map(
                  ([step, status]) => (
                    <div
                      key={step}
                      className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest"
                    >
                      <span
                        className={cn(
                          status === "complete"
                            ? "text-cyan-400"
                            : "text-white/20",
                        )}
                      >
                        {step}
                      </span>
                      <span
                        className={cn(
                          status === "complete"
                            ? "text-cyan-400"
                            : status === "running"
                              ? "text-cyan-400 animate-pulse"
                              : "text-white/10",
                        )}
                      >
                        {status}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center justify-between w-full p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-white/40"
              >
                <span>Terminal Output</span>
                {showLogs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              <AnimatePresence>
                {showLogs && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] space-y-1 h-48 overflow-y-auto custom-scrollbar">
                      {state.appBuilder.outputStream.map((log, i) => (
                        <div
                          key={`${log.ts}-${i}`}
                          className={cn(
                            "flex gap-3 leading-relaxed",
                            log.type === "error"
                              ? "text-red-400"
                              : log.type === "success"
                                ? "text-cyan-400"
                                : log.type === "system"
                                  ? "text-purple-400"
                                  : "text-white/40",
                          )}
                        >
                          <span className="shrink-0 opacity-40">
                            [{new Date(log.ts).toLocaleTimeString()}]
                          </span>
                          <span className="whitespace-pre-wrap break-words">{log.msg}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : state.appBuilder.plan ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Synthesis_Plan
              </h4>
              <button
                onClick={() =>
                  updateState((s) => ({
                    ...s,
                    appBuilder: { ...s.appBuilder, plan: null },
                  }))
                }
                className="text-[9px] font-black text-red-400/60 hover:text-red-400 uppercase"
              >
                Abort_Current
              </button>
            </div>
            <div className="space-y-2">
              {state.appBuilder.plan.steps.map((step: string, i: number) => (
                <div
                  key={i}
                  className="group p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5 shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-[11px] text-white/60 font-medium leading-relaxed group-hover:text-white transition-colors">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 py-10">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center mx-auto text-cyan-500/20">
                <Bot size={40} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.2em]">
                  Ready for Input
                </h4>
                <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                  Broadcast project intent to Lucy
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                "Build a dashboard with real-time charts",
                "Connect to a Firestore database",
                "Add authentication with Firebase",
                "Design a clean landing page",
              ].map((task, i) => (
                <button
                  key={i}
                  onClick={() => setInput(task)}
                  className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-white/40 hover:text-white hover:bg-white/5 transition-all text-left font-medium flex items-center justify-between group"
                >
                  {task}
                  <Plus
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CO-BUILDER ENGINE CONFIG */}
      <div className="border-t border-white/5 bg-cyan-500/[0.01]">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center justify-between w-full px-6 py-4 hover:bg-white/5 transition-all outline-none"
        >
          <div className="flex items-center gap-3">
             <Cpu size={14} className="text-cyan-400" />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
               Engine Configuration
             </span>
          </div>
          {showConfig ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
        </button>

        <AnimatePresence>
          {showConfig && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      Execution Level
                    </span>
                  </div>
                  <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                    {(["Fast", "Planning"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() =>
                          updateState((s) => ({
                            ...s,
                            appBuilder: {
                              ...s.appBuilder,
                              coBuilder: { ...s.appBuilder.coBuilder, executionLevel: l },
                            },
                          }))
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-[8px] font-bold uppercase transition-all",
                          state.appBuilder.coBuilder.executionLevel === l
                            ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                            : "text-white/20 hover:text-white/40",
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      Auto_Fix Resilience
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateState((s) => ({
                        ...s,
                        appBuilder: {
                          ...s.appBuilder,
                          coBuilder: {
                            ...s.appBuilder.coBuilder,
                            autoFixEnabled: !s.appBuilder.coBuilder.autoFixEnabled,
                          },
                        },
                      }))
                    }
                    className={cn(
                      "w-8 h-4.5 rounded-full transition-all relative flex items-center",
                      state.appBuilder.coBuilder.autoFixEnabled
                        ? "bg-cyan-500"
                        : "bg-white/10",
                    )}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-full bg-white absolute transition-all",
                        state.appBuilder.coBuilder.autoFixEnabled
                          ? "right-0.5"
                          : "left-0.5",
                      )}
                    />
                  </button>
                </div>

                {/* MODE SWITCHER */}
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                  {(["Suggest", "Assist", "Agent"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        updateState((s) => ({
                          ...s,
                          appBuilder: {
                            ...s.appBuilder,
                            coBuilder: { ...s.appBuilder.coBuilder, mode: m },
                          },
                        }));
                        notify(`Engine set to ${m} mode`);
                      }}
                      className={cn(
                        "py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        state.appBuilder.coBuilder.mode === m
                          ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                          : "text-white/20 hover:text-white/40 hover:bg-white/5",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* SKILL SELECTOR */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block pl-1 text-center">Active Skill Overlay</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {AGENT_SKILLS.map(skill => (
                            <button 
                                key={skill.id}
                                onClick={() => {
                                    setActiveSkill(skill.id);
                                    notify(`Skill dynamic: ${skill.name} active`);
                                }}
                                className={cn(
                                    "flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                                    activeSkill === skill.id 
                                        ? "bg-white/10 border-white/20 text-white" 
                                        : "bg-black/20 border-white/5 text-white/20 hover:text-white/40"
                                )}
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "mouse", label: "Pointer", icon: Compass },
                    { id: "terminal", label: "Terminal", icon: Terminal },
                    { id: "fs", label: "FileSys", icon: Database },
                    { id: "android", label: "Android", icon: Smartphone },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all cursor-default group"
                    >
                      <div className="flex items-center gap-2">
                        <p.icon
                          size={12}
                          className="text-white/20 group-hover:text-cyan-400/40 transition-colors"
                        />
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                          {p.label}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          p.id === "android" &&
                            !state.appBuilder.coBuilder.androidBridge.connected
                            ? "bg-white/10"
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-white/5 bg-black/40">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl focus-within:border-cyan-500/40 transition-all p-3 space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            placeholder="Synthesize new objective..."
            className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-white/20 resize-none max-h-32 custom-scrollbar px-2"
            rows={2}
          />
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {[
                {
                  id: "files",
                  label: "Files",
                  icon: FilePlus,
                  color: "text-yellow-400",
                },
                {
                  id: "photos",
                  label: "Images",
                  icon: ImageIcon,
                  color: "text-pink-400",
                },
                {
                  id: "screenshot",
                  label: "Screen",
                  icon: Camera,
                  color: "text-blue-300",
                },
                {
                  id: "import",
                  label: "Import",
                  icon: FolderPlus,
                  color: "text-indigo-400",
                },
                {
                  id: "web",
                  label: "Web",
                  icon: Globe,
                  color: "text-blue-400",
                },
                {
                  id: "github",
                  label: "Git",
                  icon: Share2,
                  color: "text-purple-400",
                },
                {
                  id: "postgres",
                  label: "DB",
                  icon: Hash,
                  color: "text-emerald-400",
                },
                {
                  id: "cloud",
                  label: "Cloud",
                  icon: Cloud,
                  color: "text-orange-400",
                },
                {
                  id: "screenShare",
                  label: "Cast",
                  icon: Monitor,
                  color: "text-red-400",
                },
              ].map((c) => (
                <button
                  key={c.id}
                  title={c.label}
                  onClick={() => {
                    if (c.id === "screenShare") {
                      toggleScreenShare();
                    } else if (c.id === "screenshot") {
                      notify("Capturing workspace snapshot...");
                    } else if (
                      c.id === "files" ||
                      c.id === "photos" ||
                      c.id === "import"
                    ) {
                      notify(`Opening ${c.label} portal...`);
                    } else {
                      updateState((s: AppState) => ({
                        ...s,
                        connectors: {
                          ...s.connectors,
                          [c.id]: !(s.connectors as any)[c.id],
                        },
                      }));
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group",
                    (state.connectors as any)?.[c.id] ||
                      (c.id === "screenShare" && state.isScreenSharing)
                      ? "bg-white/10"
                      : "hover:bg-white/5",
                  )}
                >
                  <c.icon
                    size={16}
                    className={cn(
                      "transition-colors",
                      (state.connectors as any)?.[c.id] ||
                        (c.id === "screenShare" && state.isScreenSharing)
                        ? c.color
                        : "text-white/30 group-hover:text-white",
                    )}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "w-10 h-10 rounded-2xl flex flex-shrink-0 items-center justify-center transition-all ml-2",
                input.trim()
                  ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-600/20"
                  : "bg-white/5 text-white/10",
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
