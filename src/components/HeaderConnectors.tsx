import React from 'react';
import { Github, Globe, Database, Cloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

export default function HeaderConnectors({ state, updateState }: any) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[var(--surface2)] border border-[var(--border)] rounded-xl">
      <button 
        onClick={() => updateState((s: AppState) => ({ ...s, connectors: { ...s.connectors, github: !s.connectors.github } }))}
        className={cn("p-1.5 rounded-lg transition-all", state.connectors.github ? "text-[var(--p)] bg-[var(--surface)] shadow-inner" : "text-[var(--tm)] hover:text-[var(--td)]")}
        title="GitHub Sync"
      >
        <Github size={14} />
      </button>
      <button 
        onClick={() => updateState((s: AppState) => ({ ...s, connectors: { ...s.connectors, web: !s.connectors.web } }))}
        className={cn("p-1.5 rounded-lg transition-all", state.connectors.web ? "text-[var(--p)] bg-[var(--surface)] shadow-inner" : "text-[var(--tm)] hover:text-[var(--td)]")}
        title="Web Search"
      >
        <Globe size={14} />
      </button>
      <button 
        onClick={() => updateState((s: AppState) => ({ ...s, connectors: { ...s.connectors, postgres: !s.connectors.postgres } }))}
        className={cn("p-1.5 rounded-lg transition-all", state.connectors.postgres ? "text-[var(--p)] bg-[var(--surface)] shadow-inner" : "text-[var(--tm)] hover:text-[var(--td)]")}
        title="Database Bridge"
      >
        <Database size={14} />
      </button>
      <button 
        onClick={() => updateState((s: AppState) => ({ ...s, connectors: { ...s.connectors, cloud: !s.connectors.cloud } }))}
        className={cn("p-1.5 rounded-lg transition-all", state.connectors.cloud ? "text-[var(--p)] bg-[var(--surface)] shadow-inner" : "text-[var(--tm)] hover:text-[var(--td)]")}
        title="Cloud Storage"
      >
        <Cloud size={14} />
      </button>
    </div>
  );
}
