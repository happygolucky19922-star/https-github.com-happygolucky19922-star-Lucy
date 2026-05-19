import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Plus, Trash2, Shield, Info, ArrowRight, CheckCircle2, 
  HelpCircle, Search, Rocket, BarChart3, Package, Share2, Sparkles, 
  Eye, Settings2, FileText, Download, Globe, Tag, DollarSign,
  Layers, Lock, AlertTriangle, FileJson, Clock, History
} from 'lucide-react';
import { AppState, DataForgeDataset } from '../types';
import { cn } from '../lib/utils';

// Subcomponents (to be moved to separate files if they grow too large)
import { ForgeOverview } from './forge/ForgeOverview';
import { ForgeNew } from './forge/ForgeNew';
import { ForgeClean } from './forge/ForgeClean';
import { ForgeReview } from './forge/ForgeReview';
import { ForgePackage } from './forge/ForgePackage';
import { ForgeShare } from './forge/ForgeShare';
import { ForgeGuides } from './forge/ForgeGuides';
import { ForgeAdvanced } from './forge/ForgeAdvanced';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function DataForgeView({ state, updateState, notify }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'new' | 'clean' | 'review' | 'package' | 'share' | 'guides' | 'advanced'>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'new', label: 'New Dataset', icon: Plus },
    { id: 'clean', label: 'Clean', icon: Sparkles },
    { id: 'review', label: 'Review', icon: Eye },
    { id: 'package', label: 'Package', icon: Package },
    { id: 'share', label: 'Share / Sell', icon: Share2 },
    { id: 'guides', label: 'Guides', icon: HelpCircle },
    { id: 'advanced', label: 'Advanced', icon: Search }
  ];

  return (
    <div className="flex flex-col h-full bg-[#050608] relative overflow-hidden">
      {/* Background Polish */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Internal Header */}
      <header className="h-20 border-b border-white/5 flex items-center px-10 justify-between bg-black/20 backdrop-blur-md relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Database size={20} />
            </div>
            <div>
               <h2 className="text-lg font-syne font-black text-white tracking-widest uppercase italic leading-none">Data Forge</h2>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Foundational Intelligence Factory</p>
            </div>
         </div>

         <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeSection === item.id ? "bg-white text-black shadow-xl" : "text-white/30 hover:text-white"
                )}
              >
                <item.icon size={12} />
                {!['overview', 'guides', 'advanced'].includes(item.id) && <span className="hidden lg:inline">{item.label}</span>}
                {['overview', 'guides', 'advanced'].includes(item.id) && <span>{item.label}</span>}
              </button>
            ))}
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
         <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
               {activeSection === 'overview' && <ForgeOverview state={state} updateState={updateState} onAction={(section) => setActiveSection(section as any)} />}
               {activeSection === 'new' && <ForgeNew state={state} updateState={updateState} notify={notify} onComplete={() => setActiveSection('clean')} />}
               {activeSection === 'clean' && <ForgeClean state={state} updateState={updateState} notify={notify} onNext={() => setActiveSection('review')} />}
               {activeSection === 'review' && <ForgeReview state={state} updateState={updateState} notify={notify} onNext={() => setActiveSection('package')} />}
               {activeSection === 'package' && <ForgePackage state={state} updateState={updateState} notify={notify} onNext={() => setActiveSection('share')} />}
               {activeSection === 'share' && <ForgeShare state={state} updateState={updateState} notify={notify} />}
               {activeSection === 'guides' && <ForgeGuides />}
               {activeSection === 'advanced' && <ForgeAdvanced />}
            </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
}
