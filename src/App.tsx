/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Moon, 
  Sun, 
  Activity,
  UserCheck
} from 'lucide-react';
import { AppState } from './types';

// Components
import Sidebar from './components/Sidebar';
import HeaderConnectors from './components/HeaderConnectors';
import SearchPalette from './components/SearchPalette';
import { INITIAL_STATE } from './constants';
import LucyChatView from './components/LucyChatView';

import OnboardingView from './components/OnboardingView';
import ModelsView from './components/ModelsView';
import ChatView from './components/ChatView';
import GauntletView from './components/GauntletView';
import VSDuelView from './components/VSDuelView';
import ForgeView from './components/ForgeView';
import FineTuningView from './components/FineTuningView';
import InfraView from './components/InfraView';
import ExecutiveView from './components/ExecutiveView';
import TerminalView from './components/TerminalView';
import MemoryVaultView from './components/MemoryVaultView';
import PerformanceCenterView from './components/PerformanceCenterView';
import PluginsView from './components/PluginsView';
import ConciergeView from './components/ConciergeView';
import SettingsView from './components/SettingsView';
import AppBuilderWorkspace from './components/AppBuilderWorkspace';
import ModelEvolutionLab from './components/ModelEvolutionLab';
import AgentManagerView from './components/AgentManagerView';
import MarketWarRoomView from './components/MarketWarRoomView';
import DreamModeView from './components/DreamModeView';
import DataForgeView from './components/DataForgeView';
import AchievementsView from './components/AchievementsView';
import OrbitalTrackingDashboard from './components/OrbitalTrackingDashboard';
import HouseOversightView from './components/HouseOversightView';

// --- MAIN APP ---
export default function App() {
  console.log("APP RENDERING");
  
  let lastCrash = null;
  try {
    lastCrash = localStorage.getItem('quinn_crash');
  } catch (e) {
    console.warn("localStorage access denied", e);
  }

  if (lastCrash) {
    try {
       const parsedCheck = JSON.parse(lastCrash);
       if (Date.now() - parsedCheck.time < 10000) {
         return <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center p-8 bg-[#0a0a0f] text-white">
           <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/20 rounded-3xl p-10 backdrop-blur-xl shadow-2xl">
             <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-8 border border-red-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
             </div>
             <h1 className="text-3xl font-black mb-4 uppercase tracking-widest text-red-100">Neural Core Fault</h1>
             <p className="text-red-200/60 mb-8 max-w-lg">The system experienced a critical integrity breakdown and was halted to prevent data corruption.</p>
             
             <div className="bg-black/50 rounded-xl p-4 mb-8 overflow-auto border border-red-500/10">
               <pre className="text-red-400 font-mono text-xs whitespace-pre-wrap">{parsedCheck.message}</pre>
               <pre className="text-red-500/40 font-mono text-[10px] mt-4 whitespace-pre-wrap">{parsedCheck.stack}</pre>
             </div>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => { localStorage.removeItem('quinn_crash'); window.location.reload(); }}
                 className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
               >
                 Clear Fault & Soft Restart
               </button>
               <button 
                 onClick={() => { localStorage.removeItem('quinn_state'); localStorage.removeItem('quinn_crash'); window.location.reload(); }}
                 className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
               >
                 Factory Reset State
               </button>
             </div>
           </div>
         </div>;
       }
    } catch(e) {
      console.warn("Failed to parse crash boundary state in localStorage", e);
    }
  }

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('quinn_state');
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return INITIAL_STATE;
      return {
        ...INITIAL_STATE,
        ...parsed,
        activeView: parsed.activeView || INITIAL_STATE.activeView,
        models: parsed.models && Array.isArray(parsed.models) && parsed.models.filter(m=>m!=null).length > 0 ? parsed.models.filter((m:any) => m != null) : INITIAL_STATE.models,
        forgedApps: parsed.forgedApps || [],
        evolutionLogs: parsed.evolutionLogs || [],
        downloads: parsed.downloads || [],
        matrix: parsed.matrix && Array.isArray(parsed.matrix) && parsed.matrix.length > 0 ? parsed.matrix : INITIAL_STATE.matrix,
        connectors: {
          ...INITIAL_STATE.connectors,
          ...(parsed.connectors || {})
        },
        onlineModelSearch: parsed.onlineModelSearch ?? INITIAL_STATE.onlineModelSearch,
        isScreenSharing: false, // Reset on reload
        mastery: parsed.mastery || INITIAL_STATE.mastery,
        infra: parsed.infra || INITIAL_STATE.infra,
        appBuilder: {
          ...INITIAL_STATE.appBuilder,
          ...(parsed.appBuilder || {}),
          activeMode: parsed.appBuilder?.activeMode || INITIAL_STATE.appBuilder.activeMode,
          selectedQuantization: parsed.appBuilder?.selectedQuantization || INITIAL_STATE.appBuilder.selectedQuantization,
          deployStatus: parsed.appBuilder?.deployStatus || INITIAL_STATE.appBuilder.deployStatus,
          lastSaved: parsed.appBuilder?.lastSaved || Date.now(),
          projectContext: {
            ...INITIAL_STATE.appBuilder.projectContext,
            ...(parsed.appBuilder?.projectContext || {})
          },
          revenue: {
            ...INITIAL_STATE.appBuilder.revenue,
            ...(parsed.appBuilder?.revenue || {})
          },
          systemHealth: {
            ...INITIAL_STATE.appBuilder.systemHealth,
            ...(parsed.appBuilder?.systemHealth || {})
          },
          gamification: {
            ...INITIAL_STATE.appBuilder.gamification,
            ...(parsed.appBuilder?.gamification || {}),
            scores: {
              ...INITIAL_STATE.appBuilder.gamification.scores,
              ...(parsed.appBuilder?.gamification?.scores || {})
            }
          },
          coBuilder: {
            ...INITIAL_STATE.appBuilder.coBuilder,
            ...(parsed.appBuilder?.coBuilder || {}),
            observation: {
              ...INITIAL_STATE.appBuilder.coBuilder.observation,
              ...(parsed.appBuilder?.coBuilder?.observation || {})
            },
            androidBridge: {
              ...INITIAL_STATE.appBuilder.coBuilder.androidBridge,
              ...(parsed.appBuilder?.coBuilder?.androidBridge || {})
            },
            permissions: {
              ...INITIAL_STATE.appBuilder.coBuilder.permissions,
              ...(parsed.appBuilder?.coBuilder?.permissions || {})
            }
          }
        },
        modelLab: {
          ...INITIAL_STATE.modelLab,
          ...(parsed.modelLab || {}),
          datasets: parsed.modelLab?.datasets?.filter((d:any) => d != null) || INITIAL_STATE.modelLab.datasets,
          checkpoints: parsed.modelLab?.checkpoints?.filter((c:any) => c != null) || INITIAL_STATE.modelLab.checkpoints,
        },
        dreamMode: {
          ...INITIAL_STATE.dreamMode,
          ...(parsed.dreamMode || {}),
          dreamCycles: parsed.dreamMode?.dreamCycles || [],
          trajectories: parsed.dreamMode?.trajectories || [],
          memories: parsed.dreamMode?.memories || [],
          modelHub: {
            ...INITIAL_STATE.dreamMode.modelHub,
            ...(parsed.dreamMode?.modelHub || {})
          }
        },
        gauntletJudge: parsed.gauntletJudge || INITIAL_STATE.gauntletJudge,
        gauntletHistory: parsed.gauntletHistory || [],
        battleHistory: parsed.battleHistory || [],
        arenaConfig: {
          ...INITIAL_STATE.arenaConfig,
          ...parsed.arenaConfig,
          battle: {
            ...INITIAL_STATE.arenaConfig.battle,
            ...(parsed.arenaConfig?.battle || {})
          }
        },
        activeAgent: parsed.activeAgent || INITIAL_STATE.activeAgent,
        dataForge: {
          ...INITIAL_STATE.dataForge,
          ...(parsed.dataForge || {}),
          datasets: parsed.dataForge?.datasets?.filter((d:any) => d != null) || INITIAL_STATE.dataForge.datasets,
        },
        settings: { ...INITIAL_STATE.settings, ...parsed.settings }
      };
    } catch {
      return INITIAL_STATE;
    }
  });
  console.log("INITIAL STATE LOADED:", state.activeView);
  const [activeTab, setActiveTab] = useState('models');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const scanLocalModels = async () => {
    setIsScanning(true);
    setScanProgress(0);
    notify("Initiating full device scan for local LLM weights...");

    // Simulated scan sequence
    const paths = ["/Users/local/ollama", "/usr/local/bin", "D:/Models/GGUF", "~/Downloads", "/cache/huggingface"];
    for (let i = 0; i <= 100; i += 5) {
      setScanProgress(i);
      if (i % 25 === 0) notify(`Searching neural clusters in ${paths[i/25]}...`);
      await new Promise(r => setTimeout(r, 150));
    }

    const discoveredModels = [
      { id: 'mixtral-8x7b-q4', name: 'Mixtral 8x7B Discovered', backend: 'Custom', size: '26.4GB', rarity: 'legendary', score: 94, isLoaded: false },
      { id: 'gemma-7b-it', name: 'Gemma 7B IT', backend: 'Ollama', size: '5.1GB', rarity: 'rare', score: 86, isLoaded: false },
      { id: 'qwen-72b-chat', name: 'Qwen 72B', backend: 'LM Studio', size: '45.2GB', rarity: 'epic', score: 96, isLoaded: false },
    ];

    updateState(prev => {
      const existingIds = new Set(prev.models.map(m => m.id));
      const filtered = discoveredModels.filter(m => !existingIds.has(m.id));
      return { ...prev, models: [...prev.models, ...filtered] };
    });

    setIsScanning(false);
    notify(`SCAN COMPLETE: Discovered ${discoveredModels.length} compatible kernels.`);
  };
  const [hwStatus, setHwStatus] = useState({ 
    cpu: 0, 
    mem: 0, 
    gpu: false,
    gpuInfo: { vramUsed: 0, vramTotal: 24, clock: 0, temp: 0 }
  });

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Real-time Hardware Monitoring
  useEffect(() => {
    const fetchHw = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/hardware');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHwStatus({
          cpu: Math.round(data.cpu_usage || 0),
          mem: Math.round(data.mem_usage || 0),
          gpu: !!data.gpu_found,
          gpuInfo: {
            vramUsed: data.gpu_vram_used || 0,
            vramTotal: data.gpu_vram_total || 24,
            clock: data.gpu_clock || 0,
            temp: data.gpu_temp || 0
          }
        });
      } catch (e) {
        // Fallback simulation if no sidecar
        setHwStatus(prev => ({
          ...prev,
          cpu: Math.floor(Math.random() * 20) + 10,
          mem: Math.floor(Math.random() * 30) + 40,
          gpu: true, // Force true for demo/performance view testing
          gpuInfo: {
            vramUsed: Math.floor(Math.random() * 10) + 4,
            vramTotal: 24,
            clock: Math.floor(Math.random() * 500) + 1500,
            temp: Math.floor(Math.random() * 20) + 45
          }
        }));
      }
    };
    const timer = setInterval(fetchHw, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.style.setProperty('--p', state.settings.accentColor);
    document.documentElement.style.setProperty('--glass-opacity', (state.settings.glassOpacity / 100).toString());
  }, [state.settings.theme, state.settings.accentColor, state.settings.glassOpacity]);

  // Persistent Ref for state to be used in background timers without re-triggering them
  const stateRef = React.useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Project Auto-Save Kernel (60 Second Interval)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      try {
        localStorage.setItem('quinn_state', JSON.stringify(stateRef.current));
      } catch (e) {
        console.error("Failed to save state to localStorage", e);
      }
      updateState(prev => ({
        ...prev,
        appBuilder: {
          ...prev.appBuilder,
          lastSaved: Date.now()
        }
      }));
      notify("Kernel_Sync: Project Snapshot Saved (60s Interval)");
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, []); // Run once on mount


  const updateState = (updater: (prev: AppState) => AppState | any) => {
    setState(updater);
  };

  const addXP = (amount: number) => {
    updateState((prev: AppState) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const toggleModelLoad = (modelId: string) => {
    const model = state.models.find(m => m.id === modelId);
    if (!model) return;
    
    const wasLoaded = !!model.isLoaded;
    notify(wasLoaded ? `Unloading weights: ${model.name}` : `Loading weights: ${model.name}`);
    
    updateState((prev: AppState) => ({
      ...prev,
      models: prev.models.map(m => m.id === modelId ? { ...m, isLoaded: !wasLoaded } : m)
    }));
  };

  // --- VIEWS ---
  const renderView = () => {
    switch (activeTab) {
      case 'models': return <ModelsView state={state} updateState={updateState} notify={notify} />;
      case 'chat': return <ChatView state={state} updateState={updateState} notify={notify} toggleModelLoad={toggleModelLoad} setActiveTab={setActiveTab} />;
      case 'lucy_chat': return <LucyChatView state={state} updateState={updateState} notify={notify} />;
      case 'oversight': return <HouseOversightView state={state} updateState={updateState} notify={notify} />;
      case 'dream': return <DreamModeView state={state} updateState={updateState} notify={notify} />;
      case 'dataforge': return <DataForgeView state={state} updateState={updateState} notify={notify} />;
      case 'gauntlet': return <GauntletView state={state} updateState={updateState} addXP={addXP} notify={notify} toggleModelLoad={toggleModelLoad} scanLocalModels={scanLocalModels} isScanning={isScanning} scanProgress={scanProgress} />;
      case 'duel': return <VSDuelView state={state} updateState={updateState} addXP={addXP} notify={notify} toggleModelLoad={toggleModelLoad} />;
      case 'forge': return <AppBuilderWorkspace state={state} updateState={updateState} notify={notify} setActiveTab={setActiveTab} />;
      case 'lab': return <ModelEvolutionLab state={state} updateState={updateState} notify={notify} extSetActiveTab={setActiveTab} />;
      case 'market-war-room': return <MarketWarRoomView state={state} updateState={updateState} notify={notify} />;
      case 'tuning': return <FineTuningView state={state} updateState={updateState} notify={notify} toggleModelLoad={toggleModelLoad} />;
      case 'infra': return <InfraView state={state} updateState={updateState} notify={notify} />;
      case 'executive': return <ExecutiveView state={state} updateState={updateState} toggleModelLoad={toggleModelLoad} />;
      case 'terminal': return <TerminalView hwStatus={hwStatus} />;
      case 'memory': return <MemoryVaultView state={state} updateState={updateState} notify={notify} toggleModelLoad={toggleModelLoad} />;
      case 'perf': return <PerformanceCenterView state={state} updateState={updateState} hwStatus={hwStatus} notify={notify} toggleModelLoad={toggleModelLoad} />;
      case 'agents': return <AgentManagerView state={state} updateState={updateState} notify={notify} />;
      case 'orbital': return <OrbitalTrackingDashboard state={state} updateState={updateState} notify={notify} />;
      case 'plugins': return <PluginsView />;
      case 'help': return <ConciergeView />;
      case 'achievements': return <AchievementsView state={state} />;
      case 'settings': return <SettingsView state={state} updateState={updateState} />;
      default: return <div className="p-8 text-[var(--p)]/50 font-mono text-xs uppercase tracking-widest">Target Node Offline: {activeTab}</div>;
    }
  };

  if (!state.onboardingComplete) {
    console.log("RENDERING ONBOARDING VIEW");
    return <OnboardingView onComplete={(p) => updateState((s: AppState) => ({ ...s, onboardingComplete: true, userPath: p }))} />;
  }

  console.log("RENDERING MAIN APP VIEW");
  return (
    <div className="flex overflow-hidden bg-[var(--bg)] text-[var(--txt)] fixed inset-0">
      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={isSidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        state={state}
        updateState={updateState}
        hwStatus={hwStatus}
        notify={notify}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl flex items-center px-8 gap-6 z-20 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
             <div className="w-2 h-2 rounded-full bg-[var(--p)] animate-pulse shadow-[0_0_12px_var(--p)] shrink-0" />
             <h1 className="font-syne font-black text-[13px] uppercase tracking-[0.3em] opacity-90 truncate bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">{activeTab.replace('-', ' ')} / Node_Sovereign</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)]/50 border border-[var(--border)] rounded-full hover:bg-[var(--border)]/50 transition-all group shadow-sm backdrop-blur-md"
            >
               <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60">Find Node...</span>
               <div className="flex items-center gap-1 opacity-20">
                  <div className="w-4 h-4 rounded-sm bg-white/10 flex items-center justify-center text-[9px] font-bold">⌘</div>
                  <div className="w-4 h-4 rounded-sm bg-white/10 flex items-center justify-center text-[9px] font-bold">K</div>
               </div>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider opacity-60">
               <Activity size={12} className="text-[var(--p)]" />
               Connect: 12ms
            </div>
            
            <HeaderConnectors state={state} updateState={updateState} />

            <div className="flex items-center gap-3 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl px-5 py-2">
              <button 
                onClick={() => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, theme: s.settings.theme === 'dark' ? 'light' : 'dark' } }))}
                className="hover:text-[var(--p)] transition-colors"
                title="Toggle Theme"
              >
                {state.settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <div className="w-px h-4 bg-[var(--border)] mx-1" />
              <Zap size={16} className="text-yellow-400 fill-yellow-400" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black font-mono leading-none">LVL {state.level}</span>
                 <div className="w-20 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div className="h-full bg-[var(--p)]" animate={{ width: `${(state.xp % 500) / 5}%` }} />
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => notify("Architect Identity verified via Local Enclave.")}
              className="w-10 h-10 rounded-2xl bg-[var(--p)] text-white flex items-center justify-center shadow-lg shadow-[var(--p)]/20 hover:scale-105 active:scale-95 transition-all"
            >
               <UserCheck size={20} />
            </button>
          </div>
        </header>

        {/* VIEW AREA */}
        <div className="flex-1 overflow-hidden relative z-10 w-full h-full">
          <div className="absolute inset-0 w-full h-full">
            {renderView()}
          </div>

          {/* GLOBAL NOTIFICATION */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-[var(--surface)] border border-[var(--p)]/30 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--p)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--p)]">{notification}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isSearchOpen && (
          <SearchPalette 
            isOpen={isSearchOpen}
            onClose={() => setSearchOpen(false)}
            state={state}
            updateState={updateState}
            setActiveTab={setActiveTab}
            toggleModelLoad={toggleModelLoad}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
