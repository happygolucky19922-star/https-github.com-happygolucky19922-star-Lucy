import React from 'react';
import UniversalModelLoader from './UniversalModelLoader';

interface ModelsViewProps {
  state: any;
  updateState: any;
  notify: any;
}

export default function ModelsView({ state, updateState, notify }: ModelsViewProps) {
  return (
    <div className="p-8 h-full bg-black overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-12">
        <UniversalModelLoader 
          state={state} 
          updateState={updateState} 
          notify={notify} 
        />
        
        {/* FOOTER STATS */}
        <div className="pt-12 border-t border-white/5 flex flex-wrap gap-12">
           <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">Memory Pressure</div>
              <div className="text-sm font-black text-white italic">4.2 GB / 32 GB (13%)</div>
           </div>
           <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">Inference Latency</div>
              <div className="text-sm font-black text-white italic">12ms (Target: &lt; 20ms)</div>
           </div>
           <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">Last Ingestion</div>
              <div className="text-sm font-black text-white italic">Detected 5m ago via /media/nvme</div>
           </div>
        </div>
      </div>
    </div>
  );
}
