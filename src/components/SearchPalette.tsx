import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, Command, X, Bot, Target, Swords, Zap as ZapIcon, Hammer, FlaskConical, BookOpen, Activity, Box, Cloud, Terminal, Settings, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updater: any) => void;
  setActiveTab: (tab: string) => void;
  toggleModelLoad: (id: string) => void;
}

export default function SearchPalette({ isOpen, onClose, state, updateState, setActiveTab, toggleModelLoad }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const views = [
    { id: 'chat', label: 'Neural Chat', icon: Bot, category: 'View' },
    { id: 'gauntlet', label: 'Test Arena', icon: Target, category: 'View' },
    { id: 'duel', label: 'Battle Mode', icon: Swords, category: 'View' },
    { id: 'executive', label: 'Agent Lexicon', icon: ZapIcon, category: 'View' },
    { id: 'forge', label: 'App Forge', icon: Hammer, category: 'View' },
    { id: 'tuning', label: 'Fine-Tuning Lab', icon: FlaskConical, category: 'View' },
    { id: 'models', label: 'Model Studio', icon: Bot, category: 'View' },
    { id: 'memory', label: 'Memory Vault', icon: BookOpen, category: 'View' },
    { id: 'perf', label: 'Performance', icon: Activity, category: 'View' },
    { id: 'plugins', label: 'Plugins', icon: Box, category: 'View' },
    { id: 'infra', label: 'Cluster Config', icon: Cloud, category: 'View' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, category: 'View' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'View' },
    { id: 'help', label: 'Concierge', icon: HelpCircle, category: 'View' },
  ];

  const filteredModels = state.models
    .filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.backend.toLowerCase().includes(query.toLowerCase()))
    .map(m => ({ ...m, type: 'model', category: 'Model' }));

  const filteredViews = views.filter(v => v.label.toLowerCase().includes(query.toLowerCase()));

  const results = [...filteredViews, ...filteredModels];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: any) => {
    if (item.type === 'model') {
      updateState((s: AppState) => ({ ...s, chatModel: item.id }));
      // If we are not in models view, maybe just load/unload?
      // User says "launch any model", I'll assume it sets as active chat model and navigates to Chat
      setActiveTab('chat');
    } else {
      setActiveTab(item.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl glass bg-[var(--surface)] border border-white/10 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[60vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <Search className="text-white/20" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search models, views, or commands..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-white placeholder:text-white/10"
          />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-40">
            <span className="text-[14px]">ESC</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {results.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="text-white/10 flex justify-center"><X size={48} strokeWidth={1} /></div>
              <p className="text-xs font-black uppercase tracking-widest text-white/20 italic">No neural paths found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item: any, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-3xl transition-all text-left",
                    selectedIndex === idx ? "bg-white/10 border-white/10" : "border-transparent"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border border-white/5",
                      item.type === 'model' ? "bg-[var(--p)]/20 text-[var(--p)]" : "bg-white/5 text-white/40"
                    )}>
                      {item.icon ? <item.icon size={20} /> : <Bot size={20} />}
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-white">
                        {item.name || item.label}
                      </div>
                      <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic">
                        {item.category} {item.backend ? `• ${item.backend}` : ''}
                      </div>
                    </div>
                  </div>
                  
                  {selectedIndex === idx && (
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--p)]">Execute</span>
                      <Command size={14} className="text-[var(--p)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/2 flex items-center justify-between px-8">
           <div className="flex gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold">↑↓</div>
                 <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold">↵</div>
                 <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Select</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Zap size={12} className="text-[var(--p)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Neural Index: {state.models.length} Nodes</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
