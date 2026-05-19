import React from 'react';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, Scale, Clock } from 'lucide-react';
import { DataForgeDataset } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  cp: DataForgeDataset;
}

export const DatasetPassport: React.FC<Props> = ({ cp }) => {
  const p = cp.passport;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">
             <ShieldCheck size={10} />
             Dataset Passport
          </div>
          <div className="h-px flex-1 bg-white/5" />
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Health Score</div>
             <div className="text-xl font-syne font-black text-emerald-400 italic leading-none">{p.qualityScore}%</div>
          </div>
          <div className="space-y-1">
             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Human Review</div>
             <div className="text-xl font-syne font-black text-blue-400 italic leading-none">{p.humanReviewedPct}%</div>
          </div>
          <div className="space-y-1">
             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Contamination</div>
             <div className="text-xl font-syne font-black text-white italic leading-none uppercase">{p.aiContaminationRisk}</div>
          </div>
          <div className="space-y-1">
             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Duplicates</div>
             <div className="text-xl font-syne font-black text-white italic leading-none uppercase">{p.duplicateRemovalStatus}</div>
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                <Scale size={14} />
             </div>
             <div>
                <div className="text-[10px] font-black text-white/60 uppercase italic">{cp.config.license}</div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Active License</div>
             </div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                <Clock size={14} />
             </div>
             <div>
                <div className="text-[10px] font-black text-white/60 uppercase italic">{new Date(p.lastUpdated).toLocaleDateString()}</div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Last Verified</div>
             </div>
          </div>
       </div>
    </div>
  );
};
