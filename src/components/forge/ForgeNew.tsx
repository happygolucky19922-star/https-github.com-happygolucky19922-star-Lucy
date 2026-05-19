import React, { useState } from 'react';
import { 
  UploadCloud, FileText, FileJson, FileType, 
  Database, Globe, Folder, FileArchive, Table, Search,
  CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { AppState, DataForgeDataset } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  state: AppState;
  updateState: (fn: (prev: AppState) => AppState) => void;
  notify: (msg: string) => void;
  onComplete: () => void;
}

export const ForgeNew: React.FC<Props> = ({ state, updateState, notify, onComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const formats = [
    { label: 'CSV/Excel', icon: Table },
    { label: 'JSON/JSONL', icon: FileJson },
    { label: 'TXT/MD', icon: FileText },
    { label: 'PDF/Docs', icon: FileType },
    { label: 'Images (OCR)', icon: FileType },
    { label: 'ZIP/Tar', icon: FileArchive },
    { label: 'Folders', icon: Folder },
    { label: 'SQL/DB', icon: Database },
    { label: 'Parquet', icon: Table },
    { label: 'URL/Web', icon: Globe }
  ];

  const handleUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    notify("Initiating neural ingestion sequence...");

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(finalizeUpload, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const finalizeUpload = () => {
    const newId = `df-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newDataset: DataForgeDataset = {
      id: newId,
      name: "New Discovery Batch",
      status: 'clean',
      healthScore: 0,
      qualityMetrics: {
        duplicates: 0,
        brokenRows: 0,
        sensitiveRisk: 0,
        aiGeneratedProb: 0,
        missingValues: 0
      },
      passport: {
        qualityScore: 0,
        humanReviewedPct: 0,
        duplicateRemovalStatus: 'Pending',
        aiContaminationRisk: 'Unknown',
        provenanceTracking: 'Active',
        lastUpdated: Date.now()
      },
      provenance: [
        { ts: Date.now(), action: 'Import', description: 'Source: Manual Upload' }
      ],
      config: {
        purpose: 'AI Training',
        license: 'Open Use',
        isSaleReady: false
      }
    };

    updateState(s => ({
      ...s,
      dataForge: {
        ...s.dataForge,
        datasets: [newDataset, ...s.dataForge.datasets],
        activeDatasetId: newId
      }
    }));

    setIsUploading(false);
    notify("Ingestion complete. Initializing health audit...");
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h3 className="text-4xl font-syne font-black text-white uppercase italic tracking-tighter">Genesis Protocol</h3>
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Step 1: Securely ingest your raw data into the sovereign factory.</p>
      </header>

      {/* Upload Area */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(); }}
        className={cn(
          "relative h-[400px] rounded-[64px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-8 overflow-hidden group",
          dragActive ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        )}
      >
         {isUploading ? (
           <div className="flex flex-col items-center gap-8 w-full max-w-md">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                 <svg className="w-full h-full rotate-[-90deg]">
                    <circle
                      cx="64" cy="64" r="60"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * uploadProgress) / 100}
                      className="text-blue-500 transition-all duration-300"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-syne font-black text-white italic">{uploadProgress}%</span>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Syncing</span>
                 </div>
              </div>
              <div className="text-center space-y-2">
                 <h4 className="text-lg font-black text-white uppercase italic">Deep Scan in Progress</h4>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed px-12">
                   Analyzing neural entropy and verifying binary integrity against global schema standards.
                 </p>
              </div>
           </div>
         ) : (
           <>
             <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:scale-110 transition-all shadow-2xl">
                <UploadCloud size={40} strokeWidth={1.5} />
             </div>
             <div className="text-center space-y-4">
                <h4 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Drop Files Here</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] max-w-sm leading-relaxed px-8">
                  Support for multi-file batches, massive archives, and sovereign data pointers.
                </p>
             </div>
             <button 
               onClick={handleUpload}
               className="px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
             >
                Choose Local Binaries
             </button>
           </>
         )}

         {/* Visual Detail */}
         <div className="absolute top-8 left-8 flex gap-2">
            {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />)}
         </div>
      </div>

      {/* Support Formats */}
      <div className="space-y-6 pt-6">
         <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center italic">Supported Protocol Interfaces</h4>
         <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {formats.map((f, i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-black transition-all">
                 <f.icon size={16} className="text-white/20" />
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center">{f.label}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
