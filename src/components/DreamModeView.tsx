import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Layers, Network, Box
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';
import { DreamEngine } from '../services/dreamEngine';

// Sub-components
import { CognitionDashboard } from './dream/CognitionDashboard';
import { ModelHub } from './dream/ModelHub';
import { ReflectionEngine } from './dream/ReflectionEngine';
import { MemoryConsolidation } from './dream/MemoryConsolidation';

export default function DreamModeView({ state, updateState, notify }: { state: AppState, updateState: any, notify: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'cognition' | 'reflection' | 'hub' | 'consolidation'>('cognition');
  const [selectedTrajectory, setSelectedTrajectory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const initiateDreamCycle = async () => {
    setIsProcessing(true);
    setProcessingStatus('Initializing Reflective State...');
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStatus('Summarizing Recent Neural Activity...');
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStatus('Analyzing Model Context Hub...');
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStatus('Generating Reflective Insights...');

    const newCycle = await DreamEngine.generateReflectionCycle(state);

    updateState((s: AppState) => ({
      ...s,
      dreamMode: {
        ...s.dreamMode,
        dreamCycles: [newCycle, ...s.dreamMode.dreamCycles]
      }
    }));

    setIsProcessing(false);
    notify("Dream Cycle Complete: Neural state optimized.");
  };

  const TAB_ITEMS = [
    { id: 'cognition', label: 'Cognition Cluster', icon: Brain },
    { id: 'reflection', label: 'Reflection Engine', icon: Layers },
    { id: 'hub', label: 'Model Hub', icon: Network },
    { id: 'consolidation', label: 'Memory Consolidation', icon: Box },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white">
      {/* SUB-NAVIGATION */}
      <div className="h-16 border-b border-white/5 flex items-center px-8 shrink-0 bg-black/40">
         <div className="flex gap-2">
            {TAB_ITEMS.map(item => (
               <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id as any)}
                  className={cn(
                     "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                     activeSubTab === item.id ? "bg-white/10 text-white border border-white/10" : "text-white/30 hover:text-white hover:bg-white/5"
                  )}
               >
                  <item.icon size={14} className={activeSubTab === item.id ? "text-[var(--p)]" : ""} />
                  {item.label}
               </button>
            ))}
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
         <AnimatePresence mode="popLayout">
            <motion.div
               key={activeSubTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="h-full absolute inset-0"
            >
               {activeSubTab === 'cognition' && (
                 <CognitionDashboard 
                    state={state} 
                    isProcessing={isProcessing} 
                    processingStatus={processingStatus} 
                    onInitiate={initiateDreamCycle} 
                 />
               )}
               {activeSubTab === 'reflection' && (
                 <ReflectionEngine 
                    state={state} 
                    updateState={updateState} 
                    selectedTrajectory={selectedTrajectory} 
                    onSelect={setSelectedTrajectory} 
                 />
               )}
               {activeSubTab === 'hub' && <ModelHub state={state} updateState={updateState} />}
               {activeSubTab === 'consolidation' && <MemoryConsolidation state={state} />}
            </motion.div>
         </AnimatePresence>
      </div>

      <style>{`
         .font-syne { font-family: 'Syne', sans-serif; }
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--p); }
      `}</style>
    </div>
  );
}
