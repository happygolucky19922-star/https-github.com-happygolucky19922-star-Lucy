import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Hash,
  Terminal,
  Search,
  BookOpen,
  Clock,
  Activity,
  Cpu,
  Zap,
  ZapOff,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Monitor,
  Share2,
  Download,
  Upload,
  Globe,
  SearchCode,
  Box,
  X,
  Plus,
  Filter,
  Info,
  ChevronRight,
  Laptop,
  Cloud,
  FilePlus,
  Image,
  Camera,
  FolderPlus,
  Database,
  Paperclip,
} from "lucide-react";
import { cn } from "../lib/utils";
import { AppState, Conversation, Message, Model } from "../types";
import { getChatCompletion } from "../services/geminiService";

interface ChatViewProps {
  state: AppState;
  updateState: any;
  notify: any;
  toggleModelLoad: (id: string) => void;
  setActiveTab?: (tab: string) => void;
}

export default function ChatView({
  state,
  updateState,
  notify,
  toggleModelLoad,
  setActiveTab,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isModelHubOpen, setIsModelHubOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const curConv = state.conversations.find((c) => c.id === state.curConvId);
  const activeModel = state.models.find((m) => m.id === state.chatModel);

  const toggleScreenShare = async () => {
    if (state.isScreenSharing) {
      updateState((s: AppState) => ({ ...s, isScreenSharing: false }));
      notify("Screen session terminated.");
      return;
    }

    try {
      // Simulation of launching screen capture
      notify("Activating Neural Screen Stream...");
      await new Promise((r) => setTimeout(r, 800));
      updateState((s: AppState) => ({ ...s, isScreenSharing: true }));
      notify(
        "Tactical Screen Feed active. System is observing your workspace.",
        "success",
      );
    } catch (err) {
      notify("Failed to initialize screen capture tunnel.", "error");
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeModel?.isLoaded) {
      if (!activeModel?.isLoaded)
        notify("Active core is currently offline. Please initialize.", "error");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    const convId = state.curConvId;

    updateState((s: AppState) => {
      const conv = s.conversations.find((c) => c.id === convId);
      if (!conv) return s;
      
      const isFirstMessage = conv.messages.length === 0;
      const updatedTitle = isFirstMessage ? (input.length > 30 ? input.slice(0, 30) + '...' : input) : conv.title;
      
      return {
        ...s,
        msgsSent: s.msgsSent + 1,
        conversations: s.conversations.map((c) =>
          c.id === convId ? { ...c, title: updatedTitle, messages: [...c.messages, userMsg] } : c,
        ),
      };
    });

    setInput("");
    setIsTyping(true);

    const history = curConv ? curConv.messages : [];

    getChatCompletion(input, history)
      .then((res) => {
        setIsTyping(false);
        let finalRes = res;
        if (
          res.includes("Neural Error") ||
          res.includes("429") ||
          res.includes("Rate exceeded")
        ) {
          finalRes =
            "System Alert: API Rate Limit exceeded or connection failed. Please wait a moment before trying again, or verify your API key.";
        }
        const assistantMsg: Message = { role: "assistant", content: finalRes };
        updateState((s: AppState) => ({
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, assistantMsg] }
              : c,
          ),
        }));
      })
      .catch((err) => {
        setIsTyping(false);
        const assistantMsg: Message = {
          role: "assistant",
          content:
            "System Alert: Caught unhandled API error during neural transmission.",
        };
        updateState((s: AppState) => ({
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, assistantMsg] }
              : c,
          ),
        }));
      });
  };

  const exportModels = () => {
    const data = JSON.stringify(state.models, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neural_cores_export.json";
    a.click();
    URL.revokeObjectURL(url);
    notify("Exported neural cores configuration to local disk.", "success");
  };

  const importModels = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          updateState((s: AppState) => ({
            ...s,
            models: [
              ...s.models,
              ...imported.map((m) => ({
                ...m,
                id: `imported-${Date.now()}-${m.id}`,
              })),
            ],
          }));
          notify(
            `Successfully ingested ${imported.length} neural artifacts.`,
            "success",
          );
        }
      } catch (err) {
        notify("Failed to parse neural artifact signature.", "error");
      }
    };
    reader.readAsText(file);
  };

  const createNewChat = () => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id,
      title: "New Neural Thread",
      model: state.chatModel || "",
      ts: Date.now(),
      messages: [],
    };
    updateState((s: AppState) => ({
      ...s,
      conversations: [newConv, ...s.conversations],
      curConvId: id,
    }));
    notify("Archived previous thread. Synchronizing new workspace.");
  };

  return (
    <div className="h-full flex bg-black overflow-hidden relative">
      {/* Sidebar: Chat History */}
      <div className="w-80 border-r border-white/5 flex flex-col glass backdrop-blur-3xl hidden xl:flex">
        <div className="p-8">
          <button
            onClick={createNewChat}
            className="w-full py-4 bg-white text-black font-black uppercase italic tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Initialize Thread
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar">
          <div className="text-[10px] font-black uppercase opacity-20 tracking-wider mb-4 pl-2">
            Neural History Archive
          </div>
          {state.conversations.map((c) => (
            <div
              key={c.id}
              onClick={() =>
                updateState((s: AppState) => ({ ...s, curConvId: c.id, chatModel: c.model }))
              }
              className={cn(
                "p-5 rounded-[24px] cursor-pointer transition-all border group relative overflow-hidden",
                state.curConvId === c.id
                  ? "bg-[var(--p)]/10 border-[var(--p)]/20 shadow-lg"
                  : "border-transparent hover:bg-white/5",
              )}
            >
              {state.curConvId === c.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--p)] rounded-full" />
              )}
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-black uppercase italic tracking-tight truncate text-white/50">
                  {state.models.find(m => m.id === c.model)?.name || c.model || 'Unknown Model'}
                </div>
                <div className="text-[8px] font-bold opacity-20">
                  {new Date(c.ts).toLocaleDateString()}
                </div>
              </div>
              <div className="text-xs font-bold text-white/80 truncate group-hover:text-white">
                {c.title}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--p)]/20 text-[var(--p)] flex items-center justify-center border border-[var(--p)]/30">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white">
                System 2 Loop
              </div>
              <div className="text-[8px] font-bold text-white/30 uppercase">
                CoT Latency: 42ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 glass relative z-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-white">
                Objective Processor
              </div>
              <h3 className="text-xl font-syne font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                {curConv?.title || "System Standby"}
                {isTyping && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[var(--p)]"
                  />
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group mr-4">
              <AnimatePresence>
                {isMessageSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                  >
                    <Search size={14} className="text-white/20 mr-2" />
                    <input
                      autoFocus
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white w-full placeholder:text-white/10"
                    />
                    <button
                      onClick={() => {
                        setIsMessageSearchOpen(false);
                        setMessageSearchQuery("");
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X size={12} className="text-white/40" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setIsMessageSearchOpen(true)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center gap-3"
                  >
                    <Search size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
                      Search Text
                    </span>
                  </button>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleScreenShare}
              className={cn(
                "p-3 rounded-2xl transition-all border flex items-center gap-3 group relative overflow-hidden",
                state.isScreenSharing
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white",
              )}
            >
              {state.isScreenSharing && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/5"
                />
              )}
              <Monitor
                size={18}
                className={cn(state.isScreenSharing && "animate-pulse")}
              />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
                {state.isScreenSharing ? "Live Stream" : "Connect Device"}
              </span>
            </button>

            <button
              onClick={() => setIsModelHubOpen(true)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:border-[var(--p)]/40 hover:text-white transition-all flex items-center gap-3"
            >
              <SearchCode size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
                Model Hub
              </span>
            </button>

            <div className="hidden md:flex items-center gap-3 glass bg-white/5 border-white/10 rounded-2xl p-2 px-4 relative group hover:border-[var(--p)]/40 transition-all cursor-pointer">
              <div className="flex flex-col pr-8 text-left">
                <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">
                  Sovereign Core
                </span>
                <span className="text-[10px] font-black uppercase italic text-white truncate max-w-[120px]">
                  {activeModel?.name || "SELECT CORE"}
                </span>
              </div>

              <div className="absolute top-full right-0 mt-4 w-72 glass bg-[var(--surface)] border border-white/10 rounded-[32px] p-6 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="space-y-4 text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--p)] border-b border-white/5 pb-2">
                    Active Neural Distribution
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {state.models.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "p-3 rounded-2xl border transition-all flex items-center justify-between gap-3",
                          state.chatModel === m.id
                            ? "bg-[var(--p)]/10 border-[var(--p)]/30"
                            : "bg-white/5 border-white/5 hover:bg-white/10",
                        )}
                        onClick={() =>
                          updateState((s: AppState) => ({
                            ...s,
                            chatModel: m.id,
                          }))
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-black truncate uppercase italic tracking-tighter">
                            {m.name}
                          </div>
                          <div className="text-[8px] font-bold opacity-30 uppercase">
                            {m.backend}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModelLoad(m.id);
                          }}
                          className={cn(
                            "p-1.5 px-3 rounded-lg transition-all flex items-center gap-2",
                            m.isLoaded
                              ? "bg-red-500/20 text-red-500 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
                          )}
                        >
                          {m.isLoaded ? (
                            <Zap size={10} className="fill-current" />
                          ) : (
                            <Zap size={10} />
                          )}
                          <span className="text-[8px] font-black uppercase">
                            {m.isLoaded ? "Unload" : "Load"}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeModel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleModelLoad(activeModel.id);
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all absolute right-2 top-1/2 -translate-y-1/2",
                    activeModel.isLoaded
                      ? "bg-red-500/20 text-red-500"
                      : "bg-green-500/20 text-green-500",
                  )}
                >
                  {activeModel.isLoaded ? (
                    <ZapOff size={14} />
                  ) : (
                    <Zap size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10 selection:bg-[var(--p)] selection:text-white"
        >
          <AnimatePresence mode="popLayout">
            {!curConv || curConv.messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <Bot
                    size={120}
                    strokeWidth={0.5}
                    className="text-white/5 animate-pulse"
                  />
                  <Sparkles
                    size={40}
                    className="absolute -top-4 -right-4 text-[var(--p)]"
                  />
                </div>
                <div className="space-y-4 max-w-md">
                  <h4 className="text-3xl font-syne font-black uppercase italic tracking-tighter text-white">
                    Workspace Initialized
                  </h4>
                  <p className="text-xs text-[var(--td)] font-medium leading-relaxed uppercase tracking-widest opacity-60">
                    Objective input requested. Local model is synchronized and
                    awaiting instructions.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                  {[
                    { t: "Deep Technical Analysis", icon: Search },
                    { t: "Exploit Path Discovery", icon: ShieldCheck },
                    { t: "Neural Code Distillation", icon: Terminal },
                    { t: "Macro Strategic Planning", icon: Activity },
                  ].map((i) => (
                    <button
                      key={i.t}
                      onClick={() => setInput(i.t)}
                      className="p-6 glass rounded-3xl border-white/5 hover:border-[var(--p)]/40 hover:bg-[var(--p)]/5 transition-all text-left flex items-center gap-4 group"
                    >
                      <i.icon
                        size={20}
                        className="text-white/20 group-hover:text-[var(--p)] transition-colors"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white">
                        {i.t}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              (() => {
                // Grouping logic
                const filteredMessages = curConv.messages.filter((m) =>
                  m.content
                    .toLowerCase()
                    .includes(messageSearchQuery.toLowerCase()),
                );

                const groupedMessages: {
                  role: "user" | "assistant" | "system";
                  contents: string[];
                }[] = [];
                filteredMessages.forEach((msg, i) => {
                  const role = msg.role as "user" | "assistant" | "system";
                  if (
                    groupedMessages.length > 0 &&
                    groupedMessages[groupedMessages.length - 1].role === role
                  ) {
                    groupedMessages[groupedMessages.length - 1].contents.push(
                      msg.content,
                    );
                  } else {
                    groupedMessages.push({ role, contents: [msg.content] });
                  }
                });

                return groupedMessages.map((group, gIdx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={`group-${gIdx}`}
                    className={cn(
                      "flex gap-6 max-w-[90%] group items-start",
                      group.role === "user"
                        ? "ml-auto flex-row-reverse"
                        : "mr-auto",
                      group.role === "system" &&
                        "mx-auto w-full justify-center text-center opacity-30",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-2xl transition-transform group-hover:scale-110 mt-1",
                        group.role === "user"
                          ? "bg-white text-black"
                          : "bg-[var(--p)] text-white neon-glow",
                      )}
                    >
                      {group.role === "user" ? (
                        <User size={20} />
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div
                        className={cn(
                          "text-[8px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-3 px-1 mb-1",
                          group.role === "user"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        <span>
                          {group.role === "user"
                            ? "Operator"
                            : activeModel?.name || "Sovereign"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>Neural Group Trace</span>
                      </div>

                      <div
                        className={cn(
                          "flex flex-col gap-2",
                          group.role === "user" ? "items-end" : "items-start",
                        )}
                      >
                        {group.contents.map((content, cIdx) => (
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: group.role === "user" ? 20 : -20,
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: cIdx * 0.1 }}
                            key={`${gIdx}-${cIdx}`}
                            className={cn(
                              "p-6 px-8 rounded-[32px] text-base leading-relaxed font-medium whitespace-pre-wrap border backdrop-blur-2xl transition-all shadow-xl max-w-full",
                              group.role === "user"
                                ? "bg-white/5 border-white/10 rounded-tr-none text-white/90"
                                : "bg-black/60 border-white/5 rounded-tl-none text-white relative overflow-hidden",
                            )}
                          >
                            {group.role === "assistant" && cIdx === 0 && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--p)]/40" />
                            )}
                            {content}

                            <div
                              className={cn(
                                "mt-4 pt-4 border-t border-white/5 flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100",
                                group.role === "user"
                                  ? "justify-end"
                                  : "justify-start",
                              )}
                            >
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <Copy size={12} />
                              </button>
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <Hash size={12} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ));
              })()
            )}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-6 max-w-[85%] items-start"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[var(--p)] text-white flex items-center justify-center border border-white/10 animate-pulse">
                <Bot size={24} />
              </div>
              <div className="p-8 rounded-[40px] rounded-tl-none bg-black/60 border border-white/5 shadow-2xl">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-10 relative z-20">
          <div className="max-w-5xl mx-auto glass p-3 rounded-[32px] border border-white/10 shadow-2xl flex flex-col gap-2 focus-within:ring-2 focus-within:ring-[var(--p)]/40 transition-all bg-black/40">
            <div className="flex items-end gap-4 px-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleSend())
                }
                placeholder="Type your strategic objective..."
                className="flex-1 bg-transparent border-none outline-none py-2 text-lg font-medium text-white placeholder:text-white/10 resize-none max-h-64 custom-scrollbar"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-xl group mb-1",
                  input.trim()
                    ? "bg-white text-black hover:scale-105 active:scale-95"
                    : "bg-white/5 text-white/10",
                )}
              >
                <Send
                  size={20}
                  className={cn(
                    input.trim() &&
                      "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform",
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 px-2 pb-1 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1.5 flex-nowrap">
                {[
                  {
                    id: "files",
                    label: "Files",
                    icon: FilePlus,
                    color: "text-yellow-400",
                  },
                  {
                    id: "photos",
                    label: "Photos",
                    icon: Image,
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
                      "flex items-center justify-center p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group flex-shrink-0",
                      (state.connectors as any)[c.id] ||
                        (c.id === "screenShare" && state.isScreenSharing)
                        ? "bg-white/10"
                        : "hover:bg-white/5",
                    )}
                  >
                    <c.icon
                      size={16}
                      className={cn(
                        "transition-colors",
                        (state.connectors as any)[c.id] ||
                          (c.id === "screenShare" && state.isScreenSharing)
                          ? c.color
                          : "text-white/30 group-hover:text-white",
                      )}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsModelHubOpen(true)}
                className="flex-shrink-0 ml-4 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all group"
              >
                <SearchCode size={14} className="text-[var(--p)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
                  Neural Hub
                </span>
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-6 gap-6">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
              <ShieldCheck size={12} className="text-emerald-500/50" />
              Sovereign Encryption Active
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
              <Cpu size={12} className="text-[var(--p)]/50" />
              Local Inference via {activeModel?.backend || "None"}
            </div>
          </div>
        </div>
      </div>

      {/* MODEL HUB OVERLAY */}
      <AnimatePresence>
        {isModelHubOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-[var(--surface)] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--p)]/20 text-[var(--p)] flex items-center justify-center border border-[var(--p)]/30">
                    <SearchCode size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-syne font-black uppercase italic tracking-widest text-white">
                      Model Neural Hub
                    </h2>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                      Device Scan & Artifact Ingestion
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModelHubOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </header>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Search and Toggle */}
                <div className="p-8 space-y-6">
                  <div className="relative">
                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20"
                      size={20}
                    />
                    <input
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      placeholder="Search local kernels, Hugging Face artifacts, or SHA-256 signatures..."
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white text-lg font-medium placeholder:text-white/10 focus:ring-2 focus:ring-[var(--p)]/40 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateState((s: AppState) => ({
                              ...s,
                              onlineModelSearch: !s.onlineModelSearch,
                            }))
                          }
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative p-1",
                            state.onlineModelSearch
                              ? "bg-emerald-500"
                              : "bg-white/10",
                          )}
                        >
                          <motion.div
                            animate={{ x: state.onlineModelSearch ? 24 : 0 }}
                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                          />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-white">
                            Online Pulse
                          </span>
                          <span className="text-[8px] font-bold text-white/30 truncate">
                            Connect to Hugging Face Nexus
                          </span>
                        </div>
                      </div>

                      {state.onlineModelSearch && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                        >
                          <Globe
                            size={12}
                            className="text-emerald-400 animate-pulse"
                          />
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                            HuggingFace_API_ONLINE
                          </span>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={importModels}
                        className="hidden"
                        accept=".json"
                      />
                      <button
                        onClick={exportModels}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <Download size={14} /> Export All
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-white/5"
                      >
                        <Upload size={14} /> Import Local
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model List */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.models
                      .filter((m) =>
                        m.name
                          .toLowerCase()
                          .includes(modelSearchQuery.toLowerCase()),
                      )
                      .map((m) => (
                        <div
                          key={m.id}
                          className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.06] hover:border-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center border",
                                  m.rarity === "legendary"
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                    : m.rarity === "rare"
                                      ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                      : "bg-white/5 border-white/10 text-white/40",
                                )}
                              >
                                <Box size={24} />
                              </div>
                              <div>
                                <div className="text-sm font-black text-white italic truncate max-w-[140px] uppercase tracking-tighter">
                                  {m.name}
                                </div>
                                <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">
                                  {m.backend} • {m.size}
                                </div>
                              </div>
                            </div>
                            <div className="text-[9px] font-black text-[var(--p)] uppercase tracking-[0.2em]">
                              {m.quantization}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleModelLoad(m.id)}
                              className={cn(
                                "flex-1 py-3 rounded-xl border font-black uppercase text-[9px] tracking-widest transition-all",
                                m.isLoaded
                                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
                              )}
                            >
                              {m.isLoaded
                                ? "Unload Neural Net"
                                : "Initialize Weights"}
                            </button>
                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                              <Info size={14} className="text-white/30" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {state.onlineModelSearch && (
                      <>
                        {/* Simulated Hugging Face Results */}
                        {[
                          {
                            id: "hf-1",
                            name: "StableCode-3B-Q4",
                            size: "1.8GB",
                            downloads: "12k",
                          },
                          {
                            id: "hf-2",
                            name: "OpenHermes-2.5-Mistral",
                            size: "4.5GB",
                            downloads: "85k",
                          },
                          {
                            id: "hf-3",
                            name: "DeepSeek-6.7B-Coder",
                            size: "3.9GB",
                            downloads: "45k",
                          },
                        ].map((h) => (
                          <div
                            key={h.id}
                            className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl group hover:bg-emerald-500/[0.04] hover:border-emerald-500/20 transition-all relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4">
                              <Globe
                                size={14}
                                className="text-emerald-500/20"
                              />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                <Download size={24} />
                              </div>
                              <div>
                                <div className="text-sm font-black text-white italic uppercase tracking-tighter">
                                  {h.name}
                                </div>
                                <div className="text-[9px] font-black uppercase text-emerald-400/40 tracking-widest">
                                  HuggingFace • {h.size}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity
                                  size={12}
                                  className="text-emerald-500/40"
                                />
                                <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">
                                  {h.downloads} installs
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const newModel: Model = {
                                    id: h.id + "-" + Date.now(),
                                    name: h.name,
                                    backend: "Transformers",
                                    size: h.size,
                                    rarity: "rare",
                                    score: 85,
                                    isLoaded: false,
                                    quantization: "Q4_K_M",
                                    xp: 0,
                                    level: 1,
                                    powerRating: 75,
                                  };
                                  updateState((s: AppState) => ({
                                    ...s,
                                    models: [...s.models, newModel],
                                  }));
                                  notify(
                                    `Successfully downloaded ${h.name} from Hugging Face.`,
                                    "success",
                                  );
                                }}
                                className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                              >
                                Download Artifact
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!state.models.length && !state.onlineModelSearch && (
                      <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-20 filter grayscale">
                        <SearchCode size={64} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic">
                          No neural patterns discovered in local partitions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .thinking-dots {
          display: flex;
          gap: 4px;
        }
        .thinking-dots span {
          width: 8px;
          height: 8px;
          background: var(--p);
          border-radius: 50%;
          display: inline-block;
          animation: thinking 1.4s infinite ease-in-out both;
        }
        .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
        .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes thinking {
          0%, 80%, 100% { transform: scale(0); opacity: 0.2; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Removing local Plus component definition as it conflicts with lucide-react import
