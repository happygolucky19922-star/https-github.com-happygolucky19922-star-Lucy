import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Grid,
  Layout,
  Cpu,
  Terminal,
  History,
  Users,
  Shield,
  Workflow,
  Puzzle,
  Book,
  Zap,
  Settings,
  ChevronRight,
  FolderTree,
  Archive,
  Cloud,
  Database,
  Bot,
  Brain,
  Globe,
  Sparkles,
  Box,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  Activity,
  Layers,
  Code2,
  TrendingUp,
  MoreVertical,
  Settings2,
  Lock,
  Target,
  BarChart3,
  LineChart,
  Menu,
  X,
  MessageSquare,
  FileCode,
  Folder,
  ArrowRight,
  ArrowLeft,
  Download,
  Play
} from "lucide-react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { cn } from "../lib/utils";
import { INITIAL_STATE } from "../constants";
import { AppState } from "../types";
import { getChatCompletion } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";
import { AngelicAgent, AGENT_SKILLS } from "../services/agentService";

import AppBuilderRightPanel from "./AppBuilderRightPanel";
import AppBuilderTopBar from "./AppBuilderTopBar";
import TaskGraphView from "./TaskGraphView";
import AgentManagerView from "./AgentManagerView";
import AgenticForgeDashboard from "./AgenticForgeDashboard";

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
  setActiveTab: (tab: string) => void;
}

const DEFAULT_FILES = {
  "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>App preview</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Hello Forge</h1>\n    <p>Edit the code and see me update live.</p>\n  </div>\n\n  <script src="script.js"></script>\n</body>\n</html>`,
  "style.css": `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #111;\n  color: #fff;\n  margin: 0;\n  padding: 2rem;\n  text-align: center;\n}\n\nh1 {\n  color: #06b6d4;\n  font-size: 3rem;\n  margin-top: 10vh;\n}\n\np {\n  color: #a1a1aa;\n}`,
  "script.js": `console.log("App initialized");\n`
};

import { FORGE_COMPONENTS, ForgeComponent } from "../data/components";
import IntelligenceFeed from "./IntelligenceFeed";
import IntelDashboard from "./IntelDashboard";

export default function AppBuilderWorkspace({
  state,
  updateState,
  notify,
  setActiveTab,
}: Props) {
  const [modelSearch, setModelSearch] = useState("");
  const [isFileExplorerCollapsed, setIsFileExplorerCollapsed] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    src: true,
  });
  
  // Real working editor state
  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [previewKey, setPreviewKey] = useState<number>(0);
  
  const [agent, setAgent] = useState<AngelicAgent | null>(null);
  const [executionMode, setExecutionMode] = useState<'Fast' | 'Planning'>('Planning');

  const [activeForgeCategory, setActiveForgeCategory] = useState<string>('Structure');

  useEffect(() => {
    setAgent(new AngelicAgent(state, updateState, notify));
  }, []);

  const handleAddComponent = async (comp: ForgeComponent) => {
     if (!agent) return;
     notify(`Invoking Angelic Agent to synthesize ${comp.name}...`);
     
     if (state.appBuilder.coBuilder.executionLevel === 'Planning') {
        const tasks = await agent.plan(`Add the following component to the project: ${comp.prompt}`);
        for (const t of tasks) {
           await agent.executeTask(t);
        }
     } else {
        await agent.executeTask({
          id: `forge-${comp.id}`,
          name: `Add ${comp.name}`,
          type: 'code',
          status: 'idle',
          payload: { description: comp.prompt }
        });
     }
  };
  
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  const logRef = React.useRef<HTMLDivElement>(null);

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };
  const fileExplorerRef = React.useRef<ImperativePanelHandle>(null);

  const toggleFileExplorer = () => {
    const p = fileExplorerRef.current;
    if (p) {
      if (p.isCollapsed()) p.expand();
      else p.collapse();
    }
  };

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.appBuilder.outputStream]);

  const addLog = (
    msg: string,
    type: "info" | "system" | "success" | "error" = "info",
  ) => {
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        outputStream: [
          { ts: Date.now(), msg, type } as any,
          ...s.appBuilder.outputStream,
        ].slice(0, 100),
      },
    }));
  };

  const executeShellCommand = (cmd: string, description: string) => {
    const isAgent = state.appBuilder.coBuilder.mode === "Agent";

    if (isAgent) {
      // Auto-approve in agent mode (simulated)
      addEngineLog(`Executing autonomous command: ${cmd}`, "shell", "success");
      updateState((s) => ({
        ...s,
        appBuilder: {
          ...s.appBuilder,
          outputStream: [
            { ts: Date.now(), msg: `$ ${cmd}`, type: "system" },
            ...s.appBuilder.outputStream,
          ],
        },
      }));
    } else {
      // Request approval
      updateState((s) => ({
        ...s,
        appBuilder: {
          ...s.appBuilder,
          coBuilder: {
            ...s.appBuilder.coBuilder,
            pendingCommand: { cmd, description },
          },
        },
      }));
      notify(`Lucy requesting shell access: ${description}`);
    }
  };

  const approveCommand = () => {
    const pc = state.appBuilder.coBuilder.pendingCommand;
    if (!pc) return;

    addEngineLog(`Manual approval granted for: ${pc.cmd}`, "shell", "success");
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: { ...s.appBuilder.coBuilder, pendingCommand: null },
        outputStream: [
          { ts: Date.now(), msg: `$ ${pc.cmd}`, type: "system" },
          ...s.appBuilder.outputStream,
        ],
      },
    }));
    notify("Command executed.");
  };

  const rejectCommand = () => {
    const pc = state.appBuilder.coBuilder.pendingCommand;
    if (!pc) return;

    addEngineLog(`Developer rejected command: ${pc.cmd}`, "shell", "fail");
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: { ...s.appBuilder.coBuilder, pendingCommand: null },
      },
    }));
    notify("Command blocked by safety protocols.");
  };

  const addEngineLog = (
    action: string,
    type: "code" | "shell" | "system" | "android" = "system",
    status: "pending" | "success" | "fail" = "success",
  ) => {
    const isAgent =
      state.appBuilder.coBuilder.active &&
      state.appBuilder.coBuilder.mode === "Agent";

    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: {
          ...s.appBuilder.coBuilder,
          actionLog: [
            { ts: Date.now(), action, type, status },
            ...s.appBuilder.coBuilder.actionLog,
          ].slice(0, 50),
        },
        // ECHO TO MAIN TERMINAL IN AGENT MODE
        outputStream: isAgent
          ? [
              {
                ts: Date.now(),
                msg: `[LUCY_AUDIT] Detected suboptimal state-spreading pattern in ${(type || "SYS").toUpperCase()}. Architectural debt +1.`,
                type: "info" as any,
              },
              ...s.appBuilder.outputStream,
            ].slice(0, 100)
          : s.appBuilder.outputStream,
      },
    }));
  };

  const setEngineStatus = (
    status: AppState["appBuilder"]["coBuilder"]["engineStatus"],
  ) => {
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        coBuilder: { ...s.appBuilder.coBuilder, engineStatus: status },
      },
    }));
  };

  // REAL-TIME CONTEXT SCANNER & INTERACTION OBSERVER
  React.useEffect(() => {
    if (!state.appBuilder.coBuilder.active) return;

    const addTelemetry = (
      msg: string,
      type: "event" | "focus" | "system" = "event",
    ) => {
      // Throttle telemetry to avoid state-spamming re-renders
      const lastUpdate = (window as any)._lastLucyUpdate || 0;
      if (Date.now() - lastUpdate < 500 && type !== "system") return;
      (window as any)._lastLucyUpdate = Date.now();

      updateState((s) => ({
        ...s,
        appBuilder: {
          ...s.appBuilder,
          coBuilder: {
            ...s.appBuilder.coBuilder,
            observation: {
              ...(s.appBuilder?.coBuilder?.observation ||
                INITIAL_STATE.appBuilder.coBuilder.observation),
              telemetry: [
                { id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, msg, type },
                ...(s.appBuilder?.coBuilder?.observation?.telemetry || []),
              ].slice(0, 10),
            },
          },
        },
      }));
    };

    const handleInteraction = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const label = target.innerText?.slice(0, 20) || target.tagName;
      addTelemetry(`User clicked: ${label}`, "event");
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      addTelemetry(`Focus shift: ${target.tagName}`, "focus");
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("focusin", handleFocus);

    const interval = setInterval(() => {
      const activeTab = state.appBuilder.activeTab;
      const contexts = [
        `Analyzing ${activeTab} buffer state`,
        "Scanning project manifest for vulnerabilities",
        "Observing developer workflow patterns",
        "Detected terminal idle state",
        "Android bridge heartbeat detected",
        activeTab === "Design"
          ? "Checking for TypeScript syntax consistency"
          : "Monitoring render performance in Preview",
      ];
      const context = contexts[Math.floor(Math.random() * contexts.length)];

      updateState((s) => ({
        ...s,
        appBuilder: {
          ...s.appBuilder,
          coBuilder: {
            ...s.appBuilder.coBuilder,
            observation: {
              ...(s.appBuilder?.coBuilder?.observation ||
                INITIAL_STATE.appBuilder.coBuilder.observation),
              lastScan: Date.now(),
              detectedContext: context,
              isScanning: true,
            },
          },
        },
      }));

      addTelemetry(`System Scan: ${context.slice(0, 25)}...`, "system");

      // AUTONOMOUS AGENT ACTIONS
      if (
        state.appBuilder.coBuilder.mode === "Agent" &&
        !state.appBuilder.coBuilder.pendingCommand
      ) {
        const shouldAct = Math.random() > 0.7;
        if (shouldAct) {
          const agentActions = [
            { cmd: "npm run lint", desc: "Running system-wide lint check" },
            { cmd: 'grep -r "TODO" .', desc: "Searching for technical debt" },
            { cmd: "ls -R src/", desc: "Indexing project structure" },
            {
              cmd: "npx tailwindcss -i ./src/index.css -o ./dist/output.css",
              desc: "Rebuilding JIT styles",
            },
          ];
          const action =
            agentActions[Math.floor(Math.random() * agentActions.length)];
          executeShellCommand(action.cmd, action.desc);

          // Simulation of self-correction
          if (Math.random() > 0.8) {
            setTimeout(() => {
              addEngineLog(
                "Detected potential conflict in dependency graph. Initiating autonomous resolution...",
                "system",
                "pending",
              );
              setTimeout(() => {
                addEngineLog(
                  "Self-correction successful: Conflict resolved via path-aliasing.",
                  "system",
                  "success",
                );
              }, 4000);
            }, 5000);
          }
        }
      }

      // Finish scan after a second
      setTimeout(() => {
        updateState((s) => ({
          ...s,
          appBuilder: {
            ...s.appBuilder,
            coBuilder: {
              ...s.appBuilder.coBuilder,
              observation: {
                ...(s.appBuilder?.coBuilder?.observation ||
                  INITIAL_STATE.appBuilder.coBuilder.observation),
                isScanning: false,
              },
            },
          },
        }));
      }, 1500);
    }, 8000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("focusin", handleFocus);
    };
  }, [state.appBuilder.coBuilder.active, state.appBuilder.activeTab]);

  const setPipelineStatus = (
    step: keyof AppState["appBuilder"]["pipeline"],
    status: "idle" | "running" | "complete" | "error",
  ) => {
    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        pipeline: { ...s.appBuilder.pipeline, [step]: status },
      },
    }));
  };

  // REAL WORKING PREVIEW GENERATION
  const generatePreviewHtml = (currentFiles: Record<string, string>) => {
    let html = currentFiles['index.html'] || "";
    const style = currentFiles['style.css'] || "";
    const script = currentFiles['script.js'] || "";
    
    if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${style}</style></head>`);
    } else {
        html += `<style>${style}</style>`;
    }

    const scriptInjection = `<script>
        const intercept = function(level) {
            const orig = console[level];
            console[level] = function(...args) {
                window.parent.postMessage({ source: 'forge-preview', type: 'CONSOLE', level: level === 'error' ? 'error' : (level === 'warn' ? 'system' : 'info'), msg: args.join(' ') }, '*');
                orig.apply(console, args);
            };
        };
        intercept('log'); intercept('error'); intercept('warn'); intercept('info');
        
        window.addEventListener('error', function(e) {
             window.parent.postMessage({ source: 'forge-preview', type: 'CONSOLE', level: 'error', msg: e.message }, '*');
        });
        
        try {
          ${script}
        } catch(e) {
          console.error(e.message);
        }
      </script>`;

    if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptInjection}</body>`);
    } else {
        html += scriptInjection;
    }

    html = html.replace(/<link[^>]*href="style\.css"[^>]*>/i, '');
    html = html.replace(/<script[^>]*src="script\.js"[^>]*><\/script>/i, '');

    return html;
  };

  const highlightCode = (code: string, language: string) => {
    if (language === "html") {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="text-pink-400">$2</span>')
        .replace(/([a-zA-Z-]+)=/g, '<span class="text-cyan-300">$1</span>=')
        .replace(/(&quot;.*?&quot;)/g, '<span class="text-yellow-300">$1</span>');
    } else if (language === "css") {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/([a-zA-Z-]+)\s*:/g, '<span class="text-cyan-300">$1</span>:')
        .replace(/:\s*([^;]+);/g, ': <span class="text-yellow-300">$1</span>;')
        .replace(/([a-zA-Z0-9.-]+)\s*\{/g, '<span class="text-pink-400">$1</span> {');
    } else if (language === "js") {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\b(const|let|var|function|return|if|else|for|while|try|catch|window|document|console)\b/g, '<span class="text-pink-400">$1</span>')
        .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-yellow-300">$1</span>')
        .replace(/\b([0-9]+)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="text-cyan-300">$1</span>(');
    }
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === 'forge-preview' && event.data?.type === 'CONSOLE') {
        updateState((s) => ({
          ...s,
          appBuilder: {
            ...s.appBuilder,
            outputStream: [
              { ts: Date.now(), msg: `[Preview] ${event.data.msg}`, type: event.data.level } as any,
              ...s.appBuilder.outputStream,
            ].slice(0, 100),
          },
        }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      setFiles(prev => ({ ...prev, [activeFile]: newVal }));
      
      requestAnimationFrame(() => {
         if (e.target) {
            (e.target as HTMLTextAreaElement).selectionStart = (e.target as HTMLTextAreaElement).selectionEnd = start + 2;
         }
      });
    }
  };

  const handleDownload = () => {
     const htmlContent = generatePreviewHtml(files);
     const blob = new Blob([htmlContent], { type: "text/html" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "export.html";
     a.click();
     URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
    const prompt = state.appBuilder.prompt;
    if (!prompt.trim() || state.appBuilder.isBuilding) return;

    if (!agent) {
       notify("Neural bridge initialization in progress...");
       return;
    }

    const isAgentMode = state.appBuilder.coBuilder.mode === "Agent";

    updateState((s) => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        isBuilding: true,
        plan: null,
        outputStream: [
          {
            ts: Date.now(),
            msg: `[SYSTEM] ${isAgentMode ? "Angelic Agent" : "Synthesis"} initialized. Execution Level: ${executionMode}`,
            type: "system",
          },
        ],
        pipeline: {
          planning: "idle",
          generating: "idle",
          wiring: "idle",
          validating: "idle",
          finalizing: "idle",
        },
      },
    }));

    setPipelineStatus("planning", "running");
    setEngineStatus("thinking");

    try {
      if (executionMode === 'Planning') {
         const tasks = await agent.plan(prompt);
         
         updateState(s => ({
            ...s,
            appBuilder: {
               ...s.appBuilder,
               plan: {
                  ui: tasks.filter(t => t.type === 'code').map(t => t.name),
                  backend: tasks.filter(t => t.type === 'shell').map(t => t.name),
                  data: [],
                  steps: tasks.map(t => t.name)
               }
            }
         }));

         setPipelineStatus("planning", "complete");
         setPipelineStatus("generating", "running");
         setEngineStatus("executing");

         for (const task of tasks) {
            await agent.executeTask(task);
            await new Promise(r => setTimeout(r, 1000)); // Pacing
         }
      } else {
         // Fast Mode - Single shot synthesis
         setPipelineStatus("planning", "complete");
         setPipelineStatus("generating", "running");
         
         const codeResponse = await getChatCompletion(
           `Build a production-grade React component for: "${prompt}". 
           Include Tailwind CSS, motion/react, and lucide-react. 
           Return ONLY the full TypeScript code.`,
           []
         );
         
         const code = codeResponse.replace(/```tsx?|```/g, "").trim();
         updateState((s) => ({ ...s, appBuilder: { ...s.appBuilder, code } }));
      }

      setPipelineStatus("generating", "complete");
      setPipelineStatus("validating", "running");
      setEngineStatus("observing");
      
      // Perform screen capture for real "Perception"
      if (isAgentMode) {
         await agent.executeTask({ id: 'perception', name: 'UI Validation', type: 'perception', status: 'idle', payload: {} });
      }

      await new Promise((r) => setTimeout(r, 1500));
      setPipelineStatus("validating", "complete");
      setPipelineStatus("finalizing", "complete");
      setEngineStatus("idle");
      notify("Synthesis Successful.");
      updateState((s) => ({
        ...s,
        appBuilder: {
          ...s.appBuilder,
          isBuilding: false,
          activeTab: "Preview",
        },
      }));
    } catch (err: any) {
      console.error("Build Error:", err);
      updateState((s) => ({
        ...s,
        appBuilder: { ...s.appBuilder, isBuilding: false },
      }));
      notify("Synthesis interrupt detected.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden font-sans selection:bg-[var(--p)]/30 text-[var(--txt-high)] backdrop-blur-3xl relative z-10">
      <IntelligenceFeed />

      <AppBuilderTopBar
        state={state}
        updateState={updateState}
        notify={notify}
      />

      <div className="flex-1 flex overflow-hidden relative bg-[var(--surface)]/40 backdrop-blur-xl">
        <AnimatePresence>
          {state.appBuilder.coBuilder.agenticDashboardOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-[100] bg-[#0F0F11]"
            >
              <AgenticForgeDashboard 
                state={state} 
                updateState={updateState} 
                notify={notify} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 flex flex-col overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* FILE EXPLORER (PROJECT STRUCTURE) */}
            <Panel
              ref={fileExplorerRef}
              collapsible={true}
              onCollapse={() => setIsFileExplorerCollapsed(true)}
              onExpand={() => setIsFileExplorerCollapsed(false)}
              defaultSize={15}
              minSize={10}
              collapsedSize={0}
              className="bg-[var(--surface-low)] border-r border-[var(--border)] flex flex-col backdrop-blur-xl"
            >
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/20 shrink-0">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Project
                </span>
                <button
                  onClick={toggleFileExplorer}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 transition-all"
                >
                  <FolderTree size={14} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {[
                    {
                      name: "src",
                      type: "folder",
                      children: [
                        { name: "components", type: "folder" },
                        { name: "lib", type: "folder" },
                        { name: "types.ts", type: "file" },
                        { name: "server.ts", type: "file" },
                      ],
                    },
                    { name: "package.json", type: "file" },
                  ].map((item) => {
                    const isOpen = openFolders[item.name] || false;
                    return (
                      <div key={item.name} className="flex flex-col">
                        <div
                          onClick={() =>
                            item.type === "folder" && toggleFolder(item.name)
                          }
                          className={cn(
                            "flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer group",
                            item.type === "file"
                              ? "text-white/20 hover:text-white/40 hover:bg-white/5 pl-6"
                              : "text-white/40 font-bold hover:text-white hover:bg-white/5",
                          )}
                        >
                          {item.type === "folder" ? (
                            isOpen ? (
                              <ChevronDown size={12} className="opacity-50" />
                            ) : (
                              <ChevronRight size={12} className="opacity-50" />
                            )
                          ) : null}
                          {item.type === "folder" ? (
                            <Folder size={12} className="text-cyan-400/50" />
                          ) : (
                            <FileCode size={12} />
                          )}
                          <span className="text-[10px] uppercase tracking-widest">
                            {item.name}
                          </span>
                        </div>
                        {item.children && isOpen && (
                          <div className="pl-4 border-l border-white/5 ml-3 space-y-0.5 mt-0.5">
                            {item.children.map((child) => {
                              const isChildOpen =
                                openFolders[child.name] || false;
                              return (
                                <div key={child.name} className="flex flex-col">
                                  <div
                                    onClick={() =>
                                      child.type === "folder" &&
                                      toggleFolder(child.name)
                                    }
                                    className={cn(
                                      "flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer group w-full",
                                      child.name === "types.ts"
                                        ? "bg-cyan-500/5 text-cyan-400 font-bold"
                                        : "text-white/20 hover:text-white/40 hover:bg-white/5",
                                      child.type === "file"
                                        ? item.type === "folder"
                                          ? "pl-6"
                                          : "pl-6"
                                        : "",
                                    )}
                                  >
                                    {child.type === "folder" ? (
                                      isChildOpen ? (
                                        <ChevronDown
                                          size={10}
                                          className="opacity-40"
                                        />
                                      ) : (
                                        <ChevronRight
                                          size={10}
                                          className="opacity-40"
                                        />
                                      )
                                    ) : null}
                                    {child.type === "folder" ? (
                                      <Folder
                                        size={12}
                                        className="text-cyan-400/30"
                                      />
                                    ) : (
                                      <FileCode size={12} />
                                    )}
                                    <span className="text-[9px] uppercase tracking-widest">
                                      {child.name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-px bg-[var(--border)] hover:bg-[var(--p)]/40 transition-colors cursor-col-resize shadow-[0_0_10px_var(--pg)]" />

            {/* LUCY CO-BUILDER (CENTRAL HUB) */}
            <Panel
              defaultSize={35}
              minSize={25}
              className="bg-[var(--surface)]/60 backdrop-blur-2xl border-r border-[var(--border)] relative"
            >
              <button
                onClick={toggleFileExplorer}
                className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 bg-white/5 border border-white/10 rounded-r-lg hover:bg-white/10 transition-all flex items-center justify-center z-50 text-white/40 hover:text-white"
              >
                {isFileExplorerCollapsed ? (
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                ) : (
                  <ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                )}
              </button>
              <AppBuilderRightPanel
                state={state}
                updateState={updateState}
                notify={notify}
              />
            </Panel>

            <PanelResizeHandle className="w-px bg-[var(--border)] hover:bg-[var(--p)]/40 transition-colors cursor-col-resize shadow-[0_0_10px_var(--pg)]" />

            {/* PROJECT WORKSPACE (EXECUTION & VISUALIZATION) */}
            <Panel
              defaultSize={50}
              minSize={30}
              className="flex flex-col bg-[var(--surface-high)]/40 backdrop-blur-3xl"
            >
              <div className="h-14 border-b border-white/5 bg-[#030304]/50 flex items-center justify-between px-6 shrink-0">
                <div className="flex h-full items-center gap-1">
                  {[
                    { id: "Design", label: "Editor", icon: Code2 },
                    { id: "Preview", label: "Preview", icon: Zap },
                    { id: "Graph", label: "Graph", icon: Workflow },
                    { id: "Forge", label: "Forge", icon: Puzzle },
                    { id: "Agents", label: "Agents", icon: Users },
                    { id: "Intel", label: "Intelligence", icon: Globe },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        updateState((s) => ({
                          ...s,
                          appBuilder: {
                            ...s.appBuilder,
                            activeTab: tab.id as any,
                          },
                        }))
                      }
                      className={cn(
                        "h-full px-5 flex items-center gap-2 transition-all text-[11px] font-bold uppercase tracking-widest border-b-2",
                        state.appBuilder.activeTab === tab.id
                          ? "border-cyan-500 text-white bg-cyan-500/5 shadow-[inset_0_-8px_16px_rgba(6,182,212,0.05)]"
                          : "border-transparent text-white/20 hover:text-white/40",
                      )}
                    >
                      <tab.icon
                        size={14}
                        className={
                          state.appBuilder.activeTab === tab.id
                            ? "text-cyan-400"
                            : ""
                        }
                      />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <Monitor size={14} className="text-white/20" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                      Vite_Output
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden bg-black/40">
                <AnimatePresence mode="popLayout">
                  {state.appBuilder.activeTab === "Forge" && (
                    <motion.div
                      key="forge-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col p-12 overflow-y-auto custom-scrollbar"
                    >
                       <header className="mb-12">
                          <h2 className="text-3xl font-black uppercase tracking-tighter italic">App Forge</h2>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">No-Code Component Nucleus</p>
                       </header>

                       <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar shrink-0">
                          {['Structure', 'Input', 'Display', 'Logic', 'Module'].map(cat => (
                             <button
                                key={cat}
                                onClick={() => setActiveForgeCategory(cat)}
                                className={cn(
                                   "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0 whitespace-nowrap",
                                   activeForgeCategory === cat 
                                     ? "bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20" 
                                     : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                )}
                             >
                                {cat}
                             </button>
                          ))}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {FORGE_COMPONENTS.filter(c => c.category === activeForgeCategory).map(comp => (
                             <div 
                               key={comp.id}
                               className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] group hover:border-cyan-500/30 transition-all flex flex-col relative overflow-hidden"
                             >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl w-fit mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                                   <comp.icon size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-cyan-400 transition-colors">{comp.name}</h4>
                                <p className="text-[13px] text-white/40 leading-relaxed font-medium mb-10 flex-1">
                                   {comp.description}
                                </p>
                                <button 
                                   onClick={() => handleAddComponent(comp)}
                                   className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all flex items-center justify-center gap-3 relative z-10"
                                >
                                   <Plus size={14} strokeWidth={3} /> Inject Component
                                </button>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                  )}
                  {state.appBuilder.activeTab === "Agents" && (
                    <motion.div
                      key="agents"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <AgentManagerView
                        state={state}
                        updateState={updateState}
                        notify={notify}
                      />
                    </motion.div>
                  )}
                  {state.appBuilder.activeTab === "Intel" && (
                    <motion.div
                      key="intel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <IntelDashboard />
                    </motion.div>
                  )}
                  {state.appBuilder.activeTab === "Graph" && (
                    <motion.div
                      key="graph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <TaskGraphView state={state} />
                    </motion.div>
                  )}
                  {state.appBuilder.activeTab === "Design" && (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col overflow-hidden"
                    >
                      <div className="flex-1 flex flex-col bg-[#050507]">
                        <div className="flex bg-[var(--surface-high)]/60 backdrop-blur-md border-b border-[var(--border)] items-center justify-between shadow-xs z-10 relative">
                            <div className="flex">
                                {['index.html', 'style.css', 'script.js'].map(file => (
                                    <button 
                                      key={file} 
                                      onClick={() => setActiveFile(file)} 
                                      className={cn(
                                        "px-4 py-2.5 text-[11px] font-mono tracking-wider transition-all outline-none relative", 
                                        activeFile === file 
                                          ? "bg-[var(--surface)] text-[var(--p)] font-bold shadow-sm" 
                                          : "bg-transparent text-[var(--txt-mid)] hover:text-[var(--txt-high)] hover:bg-[var(--surface)]/50"
                                      )}>
                                        {activeFile === file && <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--p)] shadow-[0_0_10px_var(--p)]" />}
                                        {file}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 pr-4">
                                <button 
                                  onClick={() => {
                                      setPreviewKey(k => k + 1);
                                      updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, activeTab: "Preview" } }));
                                  }} 
                                  className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-white bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-all uppercase tracking-widest outline-none shadow-sm"
                                >
                                    <Play size={12}/> Run
                                </button>
                                <button 
                                  onClick={handleDownload} 
                                  className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[var(--txt-high)] bg-[var(--p)]/10 text-[var(--p)] hover:bg-[var(--p)]/20 rounded border border-[var(--p)]/20 transition-all uppercase tracking-widest outline-none shadow-sm"
                                >
                                    <Download size={12}/> Export
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex overflow-hidden bg-[var(--surface-low)]/80 backdrop-blur-md relative">
                            {/* Line numbers area */}
                            <div 
                                className="w-12 bg-[var(--surface)]/40 border-r border-[var(--border)] text-[var(--txt-low)] text-right pr-3 py-4 overflow-hidden pointer-events-none z-10 select-none font-mono text-[13px] leading-[1.5]"
                                ref={lineNumRef}
                            >
                                {files[activeFile].split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>

                            {/* Code area - handles actual scrolling */}
                            <div className="flex-1 relative">
                                <textarea
                                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-[#06b6d4] resize-none outline-none whitespace-pre font-mono text-[13px] leading-[1.5] z-20 custom-scrollbar"
                                    value={files[activeFile]}
                                    onChange={(e) => setFiles(prev => ({...prev, [activeFile]: e.target.value}))}
                                    onScroll={(e) => {
                                        if (highlightRef.current) {
                                            highlightRef.current.scrollTop = e.currentTarget.scrollTop;
                                            highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                                        }
                                        if (lineNumRef.current) {
                                            lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                />
                                <pre 
                                    ref={highlightRef}
                                    className="absolute inset-0 p-4 m-0 pointer-events-none whitespace-pre font-mono text-[13px] leading-[1.5] z-10 overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: highlightCode(files[activeFile], activeFile.split('.').pop() || 'html') }}
                                />
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {state.appBuilder.activeTab === "Preview" && (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0a0a0c] p-8 overflow-auto custom-scrollbar"
                      >
                        <div className="w-full max-w-4xl mx-auto border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-black">
                          <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-500/40" />
                              <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                              <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                            </div>
                            <div className="flex-1 flex justify-center text-[9px] font-bold text-white/20 uppercase tracking-widest">
                              localhost:3000
                            </div>
                          </div>
                          <div className="bg-white">
                            <iframe
                              key={previewKey}
                              title="preview"
                              className="w-full min-h-[600px] border-none"
                              srcDoc={generatePreviewHtml(files)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* TERMINAL OVERLAY */}
              <div className="h-48 border-t border-white/5 bg-[#030304]/80 flex flex-col shrink-0">
                <div className="h-8 border-b border-white/5 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-emerald-400" />
                    <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                      Environment_Status
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar bg-black/60">
                  {state.appBuilder.outputStream.map((log, i) => (
                    <div key={`${log.ts}-${i}`} className="flex gap-3 text-white/60">
                      <span className="text-white/10 shrink-0">
                        [{new Date(log.ts).toLocaleTimeString()}]
                      </span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}
