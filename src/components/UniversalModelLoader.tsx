import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderSearch, Search, Database, HardDrive, Cloud, 
  Cpu, Zap, Loader2, CheckCircle2, AlertTriangle,
  FileCode, Play, Trash2, Heart, BarChart3, Settings,
  Filter, MoreVertical, X, Sliders, Save, Clock, ChevronDown, Plus, Fingerprint
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Model, AppState } from '../types';

interface UniversalModelLoaderProps {
  state: AppState;
  updateState: (reducer: (s: AppState) => AppState) => void;
  notify: (msg: string) => void;
}

export default function UniversalModelLoader({ state, updateState, notify }: UniversalModelLoaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'All' | 'Local' | 'External' | 'Cloud'>('All');
  const [filterBackend, setFilterBackend] = useState<string>('All');
  const [filterQuant, setFilterQuant] = useState<string>('All');
  const [filterRarity, setFilterRarity] = useState<string>('All');
  const [showLoadedOnly, setShowLoadedOnly] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const safeModels = state.models?.filter(m => m != null) || [];
  const backends = ['All', ...Array.from(new Set(safeModels.map(m => m.backend).filter(Boolean)))];
  const quants = ['All', ...Array.from(new Set(safeModels.map(m => m.quantization || 'FP16')))];
  const rarities = ['All', ...Array.from(new Set(safeModels.map(m => m.rarity).filter(Boolean)))];

  useEffect(() => {
    if (state.models.length < 3) {
      scanLocalModels();
    }
  }, []);

  const scanLocalModels = async () => {
    setIsScanning(true);
    setScanProgress(0);
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      setScanProgress((i / steps) * 100);
      await new Promise(r => setTimeout(r, 150));
    }
    notify(`System Scan Complete. Refreshed local neural paths.`);
    setIsScanning(false);
  };

  const loadModel = async (model: Model) => {
    setLoadingModelId(model.id);
    notify(`Initializing ${model.backend} backend for ${model.name}...`);
    await new Promise(r => setTimeout(r, 1000));
    updateState(s => ({
      ...s,
      models: s.models.map(m => m.id === model.id ? { ...m, isLoaded: true } : { ...m, isLoaded: false })
    }));
    setLoadingModelId(null);
    notify(`Model ${model.name} is now authoritative.`);
  };

  const removeModel = (id: string) => {
    if (confirm("Permanently purge this neural core from the active list?")) {
      updateState(s => ({ ...s, models: s.models.filter(m => m.id !== id) }));
      notify("Model purged from active directory.");
    }
  };

  const updateSettings = (id: string, newConfig: Partial<Model['config']>) => {
    updateState(s => ({
      ...s,
      models: s.models.map(m => m.id === id ? { ...m, config: { ...m.config, ...newConfig } } : m)
    }));
    notify("Neural configuration stabilized.");
    setEditingModel(null);
  };

  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'modified' | 'performance'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [showHFImport, setShowHFImport] = useState(false);
  const [hfModelId, setHfModelId] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const [showCustomModel, setShowCustomModel] = useState(false);
  const [customModelForm, setCustomModelForm] = useState<{name: string, id: string, backend: string}>({
    name: '', id: '', backend: 'Ollama'
  });

  const handleHFDownload = async () => {
    if (!hfModelId) return notify("Hugging Face model ID required.");
    
    // Basic HF Handle validation: username/model-name or model-name-with-dashes
    const hfRegex = /^[a-zA-Z0-9-._]+\/[a-zA-Z0-9-._]+$/;
    const singleNameRegex = /^[a-zA-Z0-9-._]+$/;
    
    if (!hfRegex.test(hfModelId) && !singleNameRegex.test(hfModelId)) {
      return notify("Invalid Repository Handle format. Expected 'user/repo' or 'repo'.");
    }

    setDownloadProgress(0);
    notify(`Connecting to Hugging Face Hub for ${hfModelId}...`);
    
    // Simulate real download progress
    for (let i = 0; i <= 100; i += 5) {
      setDownloadProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }
    
    const newId = `hf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newModel: Model = {
      id: newId,
      name: hfModelId.split('/').pop() || hfModelId,
      backend: 'Transformers',
      isLoaded: false,
      xp: 0,
      level: 1,
      rarity: 'rare',
      source: 'External',
      quantization: 'Q4_K_M',
      size: '7.5GB',
      last_modified: Date.now(),
      score: 85,
      powerRating: 88,
      metrics: { accuracy: 0.85, latency: 45, throughput: 12 },
      config: { temperature: 0.7, topP: 0.9, maxTokens: 2048, topK: 40, repeatPenalty: 1.1, stopSequences: [] }
    };

    updateState(s => ({ ...s, models: [newModel, ...s.models] }));
    notify(`Neural weights for ${hfModelId} successfully downloaded to cache.`);
    setShowHFImport(false);
    setHfModelId('');
    setDownloadProgress(null);
  };

  const handleCustomModel = () => {
    if (!customModelForm.name || !customModelForm.id) {
      return notify("Model Name and ID are required.");
    }
    const newModel: Model = {
      id: customModelForm.id,
      name: customModelForm.name,
      backend: customModelForm.backend as any,
      isLoaded: false,
      xp: 0,
      level: 1,
      rarity: 'rare',
      source: 'External',
      quantization: 'FP16',
      size: 'Unknown',
      last_modified: Date.now(),
      score: 80,
      powerRating: 80,
      metrics: { accuracy: 0.80, latency: 50, throughput: 10 },
      config: { temperature: 0.7, topP: 0.9, maxTokens: 2048, topK: 40, repeatPenalty: 1.1, stopSequences: [] }
    };
    updateState(s => ({ ...s, models: [newModel, ...s.models] }));
    notify(`Model ${customModelForm.name} added to Neural Directory.`);
    setShowCustomModel(false);
    setCustomModelForm({ name: '', id: '', backend: 'Ollama' });
  };

  const filteredModels = state.models
    .filter(m => m != null)
    .filter(m => {
      const nameMatch = typeof m.name === 'string' ? m.name.toLowerCase() : '';
      const backendMatch = typeof m.backend === 'string' ? m.backend.toLowerCase() : '';
      const qMatch = searchQuery.toLowerCase();
      
      const matchesSearch = nameMatch.includes(qMatch) || backendMatch.includes(qMatch);
      const matchesSource = filterSource === 'All' || (m.source === filterSource);
      const matchesBackend = filterBackend === 'All' || m.backend === filterBackend;
      const matchesQuant = filterQuant === 'All' || (m.quantization || 'FP16') === filterQuant;
      const matchesRarity = filterRarity === 'All' || m.rarity === filterRarity;
      const matchesLoaded = !showLoadedOnly || m.isLoaded;
      return matchesSearch && matchesSource && matchesLoaded && matchesBackend && matchesQuant && matchesRarity;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'rarity') {
        const order = ['common', 'rare', 'epic', 'legendary'];
        comparison = order.indexOf(a.rarity) - order.indexOf(b.rarity);
      }
      else if (sortBy === 'modified') comparison = (a.last_modified || 0) - (b.last_modified || 0);
      else if (sortBy === 'performance') comparison = (a.metrics?.accuracy || 0) - (b.metrics?.accuracy || 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-syne font-black uppercase italic tracking-tighter text-white">Neural Directory</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 text-white">Universal Core Management & Calibration</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowLoadedOnly(!showLoadedOnly)}
             className={cn(
               "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border",
               showLoadedOnly ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
             )}
           >
              <Filter size={14} /> {showLoadedOnly ? "ACTIVE CORES" : "ALL CORES"}
           </button>
          
          <button 
            onClick={scanLocalModels}
            disabled={isScanning}
            className="bg-white/5 text-white/40 border border-white/5 p-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <FolderSearch size={16} />}
            SCAN LOCAL
          </button>
          
          <button 
            onClick={() => setShowHFImport(true)}
            className="bg-white/5 text-white/40 border border-white/5 p-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-[var(--p)]/20 hover:text-[var(--p)] hover:border-[var(--p)]/50 transition-all"
          >
            <Cloud size={16} /> DOWNLOAD FROM HF
          </button>

          <button 
            onClick={() => setShowCustomModel(true)}
            className="bg-white text-black p-4 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Plus size={16} /> ADD EXTERNAL API OR LOCAL MODEL
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCustomModel && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModel(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[40px] border-white/10 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">Add Custom Engine</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Connect Free APIs or Local Servers</p>
                </div>
                <button onClick={() => setShowCustomModel(false)} className="text-white/20 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest italic ml-1">Display Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Llama 3 70B (OpenRouter)"
                    value={customModelForm.name}
                    onChange={(e) => setCustomModelForm({...customModelForm, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-[var(--p)] transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest italic ml-1">Model System ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. meta-llama/llama-3-70b-instruct"
                    value={customModelForm.id}
                    onChange={(e) => setCustomModelForm({...customModelForm, id: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-[var(--p)] transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest italic ml-1">Backend Type</label>
                  <select 
                    value={customModelForm.backend}
                    onChange={(e) => setCustomModelForm({...customModelForm, backend: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
                  >
                    <option value="OpenRouter">OpenRouter (Free or Paid API)</option>
                    <option value="Groq">Groq (Fast Free API)</option>
                    <option value="Ollama">Ollama (Local URL)</option>
                    <option value="LM Studio">LM Studio (Local URL)</option>
                    <option value="vLLM">vLLM / Transform (Custom OpenAI endpoint)</option>
                    <option value="Custom">Custom / Other Free Endpoint</option>
                  </select>
                </div>

                <div className="pt-2 text-[9px] font-bold text-white/30 uppercase tracking-widest italic">
                  Ensure you have API keys configured in the settings page for OpenRouter/Groq endpoints.
                </div>

                <button 
                  onClick={handleCustomModel}
                  className="w-full py-5 bg-[var(--p)] text-white font-black uppercase italic tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <Database size={20} /> Register Core
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHFImport && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHFImport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[40px] border-white/10 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-syne font-black text-white uppercase italic tracking-tighter">HF Hub Ingress</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Direct weight acquisition from central hub</p>
                </div>
                <button onClick={() => setShowHFImport(false)} className="text-white/20 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest italic ml-1">Model Repository Handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. NousResearch/Hermes-2-Pro-Llama-3-8B"
                    value={hfModelId}
                    onChange={(e) => setHfModelId(e.target.value)}
                    disabled={downloadProgress !== null}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-medium text-white outline-none focus:border-[var(--p)] transition-all disabled:opacity-50"
                  />
                </div>

                {downloadProgress !== null && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-[var(--p)] tracking-widest">
                       <span>Streaming Weights...</span>
                       <span>{downloadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${downloadProgress}%` }}
                         className="h-full bg-[var(--p)] shadow-[0_0_15px_var(--p)]"
                       />
                    </div>
                    <div className="text-[8px] font-bold text-white/20 uppercase text-center animate-pulse">Syncing Shards to Neural Cache</div>
                  </div>
                )}

                <button 
                  onClick={handleHFDownload}
                  disabled={downloadProgress !== null}
                  className="w-full py-5 bg-[var(--p)] text-white font-black uppercase italic tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-20"
                >
                  {downloadProgress !== null ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                  {downloadProgress !== null ? "Ingress Active" : "Engage Ingress"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* GLOBAL SEARCH */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-[var(--p)] transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="FILTER BY NAME, BACKEND, OR ARCHITECTURE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-[32px] p-8 pl-16 text-xs font-mono uppercase tracking-[0.2em] outline-none focus:border-[var(--p)]/40 transition-all shadow-inner text-white placeholder:text-white/10"
          />
        </div>

        {/* ROBUST FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Neural Backend</label>
            <div className="relative">
              <select 
                value={filterBackend} 
                onChange={(e) => setFilterBackend(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
              >
                {backends.map(b => <option key={b} value={b} className="bg-[#0a0a0a]">{b}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Quantization Tier</label>
            <div className="relative">
              <select 
                value={filterQuant} 
                onChange={(e) => setFilterQuant(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
              >
                {quants.map(q => <option key={q} value={q} className="bg-[#0a0a0a]">{q}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Rarity Grade</label>
            <div className="relative">
              <select 
                value={filterRarity} 
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
              >
                {rarities.map(r => <option key={r} value={r} className="bg-[#0a0a0a]">{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Source Origin</label>
            <div className="relative">
              <select 
                value={filterSource} 
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
              >
                {['All', 'Local', 'External', 'Cloud'].map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Sort By Metric</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--p)] transition-all appearance-none cursor-pointer"
                >
                  <option value="name" className="bg-[#0a0a0a]">Name</option>
                  <option value="rarity" className="bg-[#0a0a0a]">Rarity Grade</option>
                  <option value="modified" className="bg-[#0a0a0a]">Modification Date</option>
                  <option value="performance" className="bg-[#0a0a0a]">Performance Score</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:bg-white/10 transition-all"
              >
                {sortOrder === 'asc' ? <BarChart3 size={16} /> : <BarChart3 size={16} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-[48px] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Neural Core</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Backend</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Rarity</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Size</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Quant</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic whitespace-nowrap">Modified</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/30 italic w-40 text-right pr-12 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredModels.map(model => (
                <tr 
                  key={model.id}
                  className={cn(
                    "hover:bg-white/[0.02] transition-colors group opacity-100",
                    model.isLoaded && "bg-[var(--p)]/[0.02]"
                  )}
                >
                  <td className="p-8">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative overflow-hidden",
                          model.isLoaded ? "bg-[var(--p)] text-white shadow-[0_0_20px_var(--p)]/40" : "bg-white/5 text-white/20 group-hover:bg-white/10"
                        )}>
                           {model.backend === 'Gemini' ? <Cloud size={20} /> : <Cpu size={20} />}
                           {loadingModelId === model.id && (
                             <motion.div 
                               className="absolute bottom-0 left-0 h-1 bg-white/50 w-full origin-left"
                               animate={{ scaleX: [0, 1] }}
                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                             />
                           )}
                        </div>
                        <div>
                           <div className="text-sm font-black text-white italic tracking-tight flex items-center gap-2">
                             {model.name}
                             {model.isLoaded && <CheckCircle2 size={12} className="text-emerald-400" />}
                             <div className="flex gap-1 ml-1 scale-75 origin-left">
                                {model.patentQuant && (
                                  <div className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 text-[7px] font-black uppercase flex items-center gap-1">
                                    <Lock size={8} /> 12,100,185
                                  </div>
                                )}
                                {model.patentDistill && (
                                  <div className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 text-[7px] font-black uppercase flex items-center gap-1">
                                    <Fingerprint size={8} /> 11,651,211
                                  </div>
                                )}
                             </div>
                           </div>
                           <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                             {model.id}
                             {loadingModelId === model.id && (
                               <motion.div 
                                 animate={{ opacity: [0.4, 1, 0.4] }}
                                 transition={{ repeat: Infinity, duration: 1.5 }}
                                 className="flex items-center gap-1 text-blue-400"
                               >
                                 <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                                 BOOTING...
                               </motion.div>
                             )}
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="p-8">
                     <span className="text-[9px] font-black uppercase px-3 py-1 bg-white/5 border border-white/5 rounded-full text-white/40 whitespace-nowrap">{model.backend}</span>
                  </td>
                  <td className="p-8">
                     <span className={cn(
                       "text-[9px] font-black uppercase italic whitespace-nowrap",
                       model.rarity === 'legendary' ? "text-amber-400" :
                       model.rarity === 'epic' ? "text-purple-400" :
                       model.rarity === 'rare' ? "text-blue-400" : "text-slate-400"
                     )}>
                        {model.rarity}
                     </span>
                  </td>
                  <td className="p-8">
                     <div className="text-xs font-mono text-white/60 whitespace-nowrap font-bold">{model.size || 'N/A'}</div>
                  </td>
                  <td className="p-8">
                     <div className="text-[10px] font-black uppercase p-1.5 px-3 bg-white/5 rounded-lg border border-white/5 text-white/30 inline-block whitespace-nowrap">{model.quantization || 'FP16'}</div>
                  </td>
                  <td className="p-8">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase whitespace-nowrap">
                        <Clock size={10} /> {model.last_modified ? new Date(model.last_modified).toLocaleDateString() : 'N/A'}
                     </div>
                  </td>
                  <td className="p-8 text-right pr-12">
                     <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setHfModelId(model.name); setShowHFImport(true); }}
                          className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all" 
                          title="Hugging Face Hub"
                        >
                           <Cloud size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingModel(JSON.parse(JSON.stringify(model)))}
                          className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all" 
                          title="Neural Config"
                        >
                           <Sliders size={14} />
                        </button>
                        <button 
                          onClick={() => removeModel(model.id)}
                          className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all" 
                          title="Purge Core"
                        >
                           <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (!model.isLoaded) loadModel(model); }}
                          disabled={loadingModelId === model.id}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all min-w-[100px] justify-center",
                            model.isLoaded ? "bg-emerald-500 text-black cursor-default" : "bg-white text-black hover:bg-[var(--p)] hover:text-white"
                          )}
                        >
                           {loadingModelId === model.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                           {model.isLoaded ? "ACTIVE" : "LOAD"}
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTINGS PANEL (MODAL) */}
      <AnimatePresence>
         {editingModel && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingModel(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl glass p-8 lg:p-12 rounded-[40px] lg:rounded-[56px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-6 lg:p-10">
                    <button onClick={() => setEditingModel(null)} className="p-4 rounded-full bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-8 lg:space-y-12">
                    <div className="space-y-2 lg:space-y-4">
                       <div className="flex items-center gap-4 text-[var(--p)]">
                          <Sliders size={32} />
                          <h3 className="text-2xl lg:text-3xl font-syne font-black uppercase italic tracking-tighter text-white">Kernel Calibration</h3>
                       </div>
                       <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Targeting: {editingModel.name}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
                       <div className="space-y-6">
                           <div className="space-y-3">
                             <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Temperature</label>
                                <span className="text-xs font-mono text-[var(--p)]">{editingModel.config?.temperature || 0.7}</span>
                             </div>
                             <input 
                                type="range" min="0" max="2" step="0.1"
                                value={editingModel.config?.temperature || 0.7}
                                onChange={(e) => setEditingModel({ ...editingModel, config: { ...(editingModel.config || {}), temperature: parseFloat(e.target.value) } as any })}
                                className="w-full accent-[var(--p)] h-1 bg-white/10 rounded-full appearance-none outline-none"
                             />
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Top P</label>
                                <span className="text-xs font-mono text-[var(--p)]">{editingModel.config?.topP || 0.9}</span>
                             </div>
                             <input 
                                type="range" min="0" max="1" step="0.05"
                                value={editingModel.config?.topP || 0.9}
                                onChange={(e) => setEditingModel({ ...editingModel, config: { ...(editingModel.config || {}), topP: parseFloat(e.target.value) } as any })}
                                className="w-full accent-[var(--p)] h-1 bg-white/10 rounded-full appearance-none outline-none"
                             />
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Max Tokens</label>
                                <span className="text-xs font-mono text-[var(--p)]">{editingModel.config?.maxTokens || 2048}</span>
                             </div>
                             <input 
                                type="number"
                                value={editingModel.config?.maxTokens || 2048}
                                onChange={(e) => setEditingModel({ ...editingModel, config: { ...(editingModel.config || {}), maxTokens: parseInt(e.target.value) } as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-[var(--p)]/40 transition-all font-black"
                             />
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Top K</label>
                                <span className="text-xs font-mono text-[var(--p)]">{editingModel.config?.topK || 40}</span>
                             </div>
                             <input 
                                type="number"
                                value={editingModel.config?.topK || 40}
                                onChange={(e) => setEditingModel({ ...editingModel, config: { ...(editingModel.config || {}), topK: parseInt(e.target.value) } as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-[var(--p)]/40 transition-all font-black"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Stop Sequences (Comma Separated)</label>
                       <input 
                          type="text"
                          value={editingModel.config.stopSequences?.join(', ') || ''}
                          onChange={(e) => setEditingModel({ ...editingModel, config: { ...(editingModel.config || {}), stopSequences: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as any })}
                          placeholder="e.g. \n, USER:, AI:"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-[var(--p)]/40 transition-all font-black placeholder:text-white/10 shadow-inner"
                       />
                    </div>

                    <button 
                      onClick={() => updateSettings(editingModel.id, editingModel.config)}
                      className="w-full py-5 lg:py-6 bg-white text-black rounded-[24px] lg:rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/40 italic"
                    >
                       <Save size={16} /> Stabilize Configuration
                    </button>
                 </div>

                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[var(--p)]/5 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
