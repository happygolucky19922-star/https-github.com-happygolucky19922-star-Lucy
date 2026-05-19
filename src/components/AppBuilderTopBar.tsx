import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Projector, 
  ChevronDown, 
  Cpu, 
  Zap, 
  Clock, 
  Brain,
  Bot,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Code2,
  Download,
  Cloud,
  Activity,
  Box,
  Fingerprint,
  ShieldCheck,
  MoreVertical,
  Layers,
  ChevronRight,
  Share2,
  Github,
  Archive,
  Grid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface TopBarProps {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function AppBuilderTopBar({ state, updateState, notify }: TopBarProps) {
  const [manualPath, setManualPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const activeModelId = state.appBuilder.selectedModel;
  const activeModel = state.models.find(m => m.id === activeModelId);
  
  const lastSaved = state.appBuilder.lastSaved || Date.now();
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    if (lastSaved) {
      setShowSavedAnimation(true);
      const timer = setTimeout(() => setShowSavedAnimation(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffMs = Date.now() - lastSaved;
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) setTimeAgo('Just now');
      else setTimeAgo(`${minutes}m ago`);
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  const handleScan = async () => {
    setIsScanning(true);
    notify("Deep-scanning neural context... (Virtual Mode)");
    await new Promise(r => setTimeout(r, 1000));
    setIsScanning(false);
    notify("Manifest synchronized.");
  };

  return (
    <header className="h-12 border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-3xl flex items-center justify-between px-4 z-50 shrink-0 select-none shadow-sm relative">
       <div className="absolute inset-0 bg-gradient-to-r from-[var(--p)]/5 via-transparent to-transparent pointer-events-none" />
      <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-white tracking-wide">{state.metadata?.name || "Untitled_Project"}</span>
               <div className="h-4 w-px bg-[var(--border)] mx-1" />
               <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">BUILD_ID: 982-A</span>
            </div>
        <div className="h-4 w-px bg-[var(--border)]" />
        <div className="flex items-center gap-2 px-2 py-1 bg-[var(--surface-high)]/30 border border-[var(--border)] rounded-lg">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
           <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="flex items-center gap-1 text-white/40 text-[10px] font-medium relative">
            <AnimatePresence>
              {showSavedAnimation && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-7 right-0 flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 whitespace-nowrap shadow-lg backdrop-blur-md"
                >
                  <CheckCircle2 size={10} />
                  <span className="font-bold tracking-wider">Snapshot Saved</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Clock size={12} className={showSavedAnimation ? "text-emerald-400" : ""} />
            <span className={cn("transition-colors duration-300", showSavedAnimation && "text-emerald-400")}>
              {showSavedAnimation ? 'Saved just now' : (timeAgo === 'Just now' ? 'Saved just now' : `Saved ${timeAgo}`)}
            </span>
         </div>
         
         <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => updateState(s => ({ 
                ...s, 
                appBuilder: { 
                  ...s.appBuilder, 
                  coBuilder: { 
                    ...s.appBuilder.coBuilder, 
                    agenticDashboardOpen: !s.appBuilder.coBuilder.agenticDashboardOpen 
                  } 
                } 
              }))}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                state.appBuilder.coBuilder.agenticDashboardOpen
                  ? "bg-[var(--p)] text-white shadow-lg shadow-[var(--pg)]"
                  : "bg-[var(--surface-high)]/40 border border-[var(--border)] text-white/70 hover:text-white hover:bg-[var(--surface-high)]"
              )}
            >
              <Bot size={14} /> Agent Forge
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-[var(--surface-high)]/40 border border-[var(--border)] rounded-lg text-[10px] font-bold uppercase text-white/70 hover:text-white hover:bg-[var(--surface-high)] transition-all">
               <Share2 size={14} /> Share
            </button>
            
            <button className="flex items-center gap-2 px-4 py-1.5 bg-[var(--a)] rounded-lg text-[10px] font-bold uppercase text-white shadow-lg shadow-[var(--a)]/20 hover:bg-[var(--a)]/80 transition-all">
               <Zap size={14} fill="currentColor" /> Run
            </button>
            
            <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-lg text-[10px] font-bold uppercase hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               Deploy
            </button>
         </div>
      </div>
    </header>
  );
}


