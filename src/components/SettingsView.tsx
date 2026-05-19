import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Settings, Database, Trash2, ShieldCheck, 
  Binary, Zap, Layout, Globe, Trash
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface SettingsViewProps {
  state: AppState;
  updateState: (fn: (s: AppState) => AppState) => void;
}

export default function SettingsView({ state, updateState }: SettingsViewProps) {
  return (
    <div className="p-8 h-full bg-black overflow-y-auto custom-scrollbar">
      <div className="max-w-xl mx-auto space-y-12 pb-24">
        <header className="space-y-4">
           <h2 className="text-4xl font-syne font-black uppercase italic text-white tracking-tighter">System Configuration</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white">Sovereign Environment & Global Parameters</p>
        </header>

        <div className="space-y-8">
          {/* Hardware Mastery */}
          <section className="glass p-8 rounded-[40px] border-white/5 space-y-8 bg-gradient-to-br from-white/2 to-transparent">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
              <ShieldCheck size={16} className="text-[var(--p)]" /> Hardware Mastery & Security
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => updateState((s: AppState) => ({ ...s, mastery: { ...s.mastery, nonlinearQuant: !s.mastery.nonlinearQuant } }))}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[24px] border transition-all group",
                  state.mastery.nonlinearQuant ? "bg-[var(--p)]/10 border-[var(--p)]/20" : "bg-white/2 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-4 text-left">
                  <Binary size={24} className={cn("transition-colors", state.mastery.nonlinearQuant ? "text-[var(--p)]" : "text-white/20")} />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">Non-linear Quantization</div>
                    <div className="text-[9px] text-white/40 font-medium">Implement US 12,100,185 B2 optimization.</div>
                  </div>
                </div>
                <div className={cn("w-12 h-6 rounded-full transition-all relative shrink-0 p-1", state.mastery.nonlinearQuant ? "bg-[var(--p)]" : "bg-white/10")}>
                  <motion.div 
                    layout
                    className="w-4 h-4 rounded-full bg-white shadow-lg shadow-black/20" 
                    animate={{ x: state.mastery.nonlinearQuant ? 24 : 0 }}
                  />
                </div>
              </button>

              <button 
                onClick={() => updateState((s: AppState) => ({ ...s, mastery: { ...s.mastery, vpuSimulation: !s.mastery.vpuSimulation } }))}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[24px] border transition-all group",
                  state.mastery.vpuSimulation ? "bg-[var(--p)]/10 border-[var(--p)]/20" : "bg-white/2 border-white/5 hover:border-white/10"
                )}
              >
                 <div className="flex items-center gap-4 text-left">
                   <Zap size={24} className={cn("transition-colors", state.mastery.vpuSimulation ? "text-[var(--p)]" : "text-white/20")} />
                   <div>
                     <div className="text-xs font-black uppercase tracking-wider text-white">VPU Acceleration</div>
                     <div className="text-[9px] text-white/40 font-medium">Simulate dedicated hardware matrix ops for kernels.</div>
                   </div>
                 </div>
                 <div className={cn("w-12 h-6 rounded-full transition-all relative shrink-0 p-1", state.mastery.vpuSimulation ? "bg-[var(--p)]" : "bg-white/10")}>
                   <motion.div 
                     layout
                     className="w-4 h-4 rounded-full bg-white shadow-lg shadow-black/20" 
                     animate={{ x: state.mastery.vpuSimulation ? 24 : 0 }}
                   />
                 </div>
              </button>

              <button 
                onClick={() => updateState((s: AppState) => ({ ...s, mastery: { ...s.mastery, totalIsolation: !s.mastery.totalIsolation } }))}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[24px] border transition-all group",
                  state.mastery.totalIsolation ? "bg-red-500/10 border-red-500/20" : "bg-white/2 border-white/5 hover:border-red-500/30"
                )}
              >
                 <div className="flex items-center gap-4 text-left">
                   <ShieldCheck size={24} className={cn("transition-colors", state.mastery.totalIsolation ? "text-red-500" : "text-white/20")} />
                   <div>
                     <div className={cn("text-xs font-black uppercase tracking-wider", state.mastery.totalIsolation ? "text-red-500" : "text-white")}>Sovereign Air-Gap (Zero-Leak)</div>
                     <div className="text-[9px] text-white/40 font-medium">Hard-code CSP and block all outbound egress traces.</div>
                   </div>
                 </div>
                 <div className={cn("w-12 h-6 rounded-full transition-all relative shrink-0 p-1", state.mastery.totalIsolation ? "bg-red-500" : "bg-white/10")}>
                   <motion.div 
                     layout
                     className="w-4 h-4 rounded-full bg-white shadow-lg shadow-black/20" 
                     animate={{ x: state.mastery.totalIsolation ? 24 : 0 }}
                   />
                 </div>
              </button>
            </div>
          </section>

          {/* Internationalization */}
          <section className="glass p-8 rounded-[40px] border-white/5 space-y-8 bg-gradient-to-br from-white/2 to-transparent">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
              <Globe size={16} className="text-[var(--p)]" /> Globalization Protocols
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {[
                 { code: 'en', name: 'English', flag: '🇺🇸' },
                 { code: 'fr', name: 'French', flag: '🇫🇷' },
                 { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                 { code: 'de', name: 'German', flag: '🇩🇪' },
                 { code: 'jp', name: 'Japanese', flag: '🇯🇵' },
                 { code: 'ru', name: 'Russian', flag: '🇷🇺' }
               ].map(lang => (
                 <button
                   key={lang.code}
                   onClick={() => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, language: lang.code } }))}
                   className={cn(
                     "flex flex-col items-center gap-2 p-5 rounded-[24px] border transition-all group",
                     state.settings.language === lang.code 
                      ? "bg-[var(--p)]/20 border-[var(--p)] text-white shadow-xl" 
                      : "bg-white/2 border-white/5 text-white/30 hover:border-white/20"
                   )}
                 >
                   <span className="text-3xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
                 </button>
               ))}
            </div>
            <p className="text-[9px] text-white/20 mt-3 italic text-center font-medium uppercase tracking-widest leading-loose">* System is partially globalized. High-density neural weights remain in sovereign format.</p>
          </section>

          {/* Visual Identity */}
          <section className="glass p-8 rounded-[40px] border-white/5 space-y-8 bg-gradient-to-br from-white/2 to-transparent">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
               <Layout size={16} className="text-[var(--p)]" /> Neural Visual Identity
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 block">Accent Color Distribution</label>
                <div className="flex flex-wrap gap-4 justify-center">
                  {[
                    { name: 'Violet', value: '#8b5cf6' },
                    { name: 'Blue', value: '#3b82f6' },
                    { name: 'Pink', value: '#ec4899' },
                    { name: 'Emerald', value: '#10b981' },
                    { name: 'Amber', value: '#f59e0b' },
                    { name: 'Crimson', value: '#ef4444' },
                  ].map(color => (
                    <button
                      key={color.value}
                      onClick={() => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, accentColor: color.value } }))}
                      className={cn(
                        "w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 active:scale-95 group relative",
                        state.settings.accentColor === color.value ? "border-white scale-110 shadow-2xl" : "border-transparent opacity-40 hover:opacity-100"
                      )}
                      style={{ 
                        backgroundColor: color.value, 
                        boxShadow: state.settings.accentColor === color.value ? `0 0 30px ${color.value}66` : 'none' 
                      }}
                    >
                       <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 block">Glassmorphism Density</label>
                  <span className="text-[10px] font-mono font-black text-[var(--p)] bg-[var(--p)]/10 px-3 py-1 rounded-full">{state.settings.glassOpacity}% Alpha</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={state.settings.glassOpacity}
                  onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, glassOpacity: parseInt(e.target.value) } }))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--p)] focus:ring-0"
                />
              </div>
            </div>
          </section>

          {/* Backend Configuration */}
          <section className="glass p-8 rounded-[40px] border-white/5 space-y-8 bg-gradient-to-br from-white/2 to-transparent">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
              <Database size={16} className="text-[var(--p)]" /> Kernel Connectivity & Free APIs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">LM Studio Endpoint</label>
                  <input 
                    type="text" 
                    value={state.settings.lmsUrl} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, lmsUrl: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="http://localhost:1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">Ollama Endpoint</label>
                  <input 
                    type="text" 
                    value={state.settings.ollUrl} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, ollUrl: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">Custom Local Endpoint</label>
                  <input 
                    type="text" 
                    value={state.settings.cusUrl || ''} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, cusUrl: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="http://localhost:8000"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">OpenRouter API Key (Free Tier)</label>
                  <input 
                    type="password" 
                    value={state.settings.openRouterKey || ''} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, openRouterKey: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="sk-or-v1-..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">Hugging Face Token</label>
                  <input 
                    type="password" 
                    value={state.settings.hfKey || ''} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, hfKey: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="hf_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-20 block">Groq API Key (Free Inference)</label>
                  <input 
                    type="password" 
                    value={state.settings.groqKey || ''} 
                    onChange={(e) => updateState((s: AppState) => ({ ...s, settings: { ...s.settings, groqKey: e.target.value } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-[var(--p)] transition-all text-white placeholder-white/20"
                    placeholder="gsk_..."
                  />
                </div>
              </div>
            </div>
          </section>

          <button 
            onClick={() => { if(confirm("Are you sure? This will wipe your neural history and local vault.")) { localStorage.removeItem('quinn_state'); window.location.reload(); } }}
            className="w-full py-6 rounded-[32px] bg-red-900/10 text-red-500 border border-red-500/20 font-black flex items-center justify-center gap-4 hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.4em] italic text-[11px] shadow-2xl hover:shadow-red-500/20"
          >
            <Trash size={18} /> FACTORY RESET SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}
