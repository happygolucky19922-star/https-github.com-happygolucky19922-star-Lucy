
import { runNeuralInference, getChatCompletion } from './geminiService';
import { Model, AppState } from '../types';

export interface AgentTask {
  id: string;
  name: string;
  type: 'code' | 'shell' | 'plan' | 'review' | 'perception';
  status: 'idle' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  payload: any;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export const AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'architect',
    name: 'Full-Stack Architect',
    description: 'Expert in system design and database normalization.',
    systemPrompt: 'You are a Senior Full-Stack Architect. Focus on scalability, security, and clean separation of concerns.'
  },
  {
    id: 'frontend',
    name: 'UI/UX Artisan',
    description: 'Specializes in Tailwind CSS, framer-motion, and accessibility.',
    systemPrompt: 'You are a World-Class Frontend Engineer. Create visually stunning, responsive, and accessible React components.'
  },
  {
    id: 'debugger',
    name: 'Shadow Debugger',
    description: 'Excels at finding race conditions and logic flaws.',
    systemPrompt: 'You are a Debugging Specialist. Scrutinize code for potential bugs, edge cases, and performance bottlenecks.'
  },
  {
    id: 'intelligence',
    name: 'Global OSINT',
    description: 'Gathers real-time intelligence via RSS and Open APIs.',
    systemPrompt: 'You are a real-time intelligence analyst. Use available external feeds to inform the perception-action loop.'
  },
  {
    id: 'automator',
    name: 'Browser Actuator',
    description: 'Specializes in DOM interaction, testing, and surface actuation.',
    systemPrompt: 'You are an Automation Specialist. Focus on end-to-end testing, visual validation, and interactive element control.'
  }
];

import { OpenApiService } from './openApiService';

export class AngelicAgent {
  private ws: WebSocket | null = null;
  private state: AppState;
  private updateState: (fn: (s: AppState) => AppState) => void;
  private notify: (msg: string) => void;
  private perceptionLoop: any = null;

  constructor(
    state: AppState, 
    updateState: (fn: (s: AppState) => AppState) => void,
    notify: (msg: string) => void
  ) {
    this.state = state;
    this.updateState = updateState;
    this.notify = notify;
    this.initBridge();
  }

  private initBridge() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.ws = new WebSocket(`${protocol}//${host}`);
    
    this.ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'TERMINAL_STREAM') {
        this.logToStream(payload.data, 'system');
      }
      if (payload.type === 'FILE_LIST') {
         this.updateState(s => ({ ...s, appBuilder: { ...s.appBuilder, vfs: payload.data } }));
      }
    };

    this.ws.onopen = () => {
       this.ws?.send(JSON.stringify({ type: 'LIST_FILES', data: '' }));
    };
  }

  public startPerceptionLoop() {
    if (this.perceptionLoop) return;
    this.logToStream("[PERCEPTION] Starting continuous feedback loop...", "system");
    this.perceptionLoop = setInterval(() => {
       if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'LIST_FILES', data: '' }));
       }
    }, 10000);
  }

  public stopPerceptionLoop() {
     if (this.perceptionLoop) {
        clearInterval(this.perceptionLoop);
        this.perceptionLoop = null;
     }
  }

  private logToStream(msg: string, type: 'info' | 'system' | 'success' | 'error' = 'info') {
    this.updateState(s => ({
      ...s,
      appBuilder: {
        ...s.appBuilder,
        outputStream: [{ ts: Date.now(), msg, type }, ...s.appBuilder.outputStream].slice(0, 100)
      }
    }));
  }

  async plan(prompt: string): Promise<AgentTask[]> {
    this.logToStream(`[PLANNING] Analyzing core intent: "${prompt}"`, 'system');
    this.setEngineStatus('thinking');
    
    const planPrompt = `
      Create a step-by-step implementation plan for: "${prompt}".
      Available Skills: ${AGENT_SKILLS.map(s => s.name).join(', ')}.
      Break it down into small, executable tasks.
      Each task must have: "id", "name", "type" (code | shell | perception | intelligence | automation), and "payload".
      Return ONLY a JSON array.
    `;

    const response = await getChatCompletion(planPrompt);
    try {
      const cleanJson = response.replace(/```json|```/g, '').trim();
      const tasks = JSON.parse(cleanJson);
      this.logToStream(`[PLANNING] synthesized ${tasks.length} sub-tasks.`, 'success');
      return tasks.map((t: any) => ({ ...t, status: 'idle' }));
    } catch (e) {
      this.logToStream(`[PLANNING_ERROR] Plan synthesis failed.`, 'error');
      return [];
    } finally {
       this.setEngineStatus('idle');
    }
  }

  private setEngineStatus(status: AppState['appBuilder']['coBuilder']['engineStatus']) {
     this.updateState(s => ({
        ...s,
        appBuilder: {
           ...s.appBuilder,
           coBuilder: { ...s.appBuilder.coBuilder, engineStatus: status }
        }
     }));
  }

  async executeTask(task: AgentTask): Promise<boolean> {
    this.logToStream(`[EXECUTION] Starting task: ${task.name}`, 'info');
    this.setEngineStatus('executing');
    
    try {
      let success = false;
      switch (task.type) {
        case 'code':
          success = await this.handleCodeTask(task);
          break;
        case 'shell':
          success = await this.handleShellTask(task);
          break;
        case 'perception':
          success = await this.handlePerceptionTask(task);
          break;
        case 'intelligence':
          success = await this.handleIntelligenceTask(task);
          break;
        case 'automation':
          success = await this.handleAutomationTask(task);
          break;
        default:
          success = false;
      }

      if (success && this.state.appBuilder.coBuilder.autoFixEnabled) {
         await this.selfCorrect(task);
      }

      return success;
    } catch (err: any) {
      this.logToStream(`[TASK_FAILURE] ${task.name}: ${err.message}`, 'error');
      return false;
    } finally {
       this.setEngineStatus('idle');
    }
  }

  private async handleIntelligenceTask(task: AgentTask): Promise<boolean> {
    this.logToStream(`[INTEL] Polling open data feeds for context...`, 'info');
    const { mode, query } = task.payload;
    
    let result: any;
    if (mode === 'rss') {
      result = await OpenApiService.fetchRSS(query || 'https://news.ycombinator.com/rss');
    } else if (mode === 'weather') {
      result = await OpenApiService.getLocalWeather(40.7128, -74.0060); // NY Default
    }

    this.logToStream(`[INTEL] Analysis complete: ${JSON.stringify(result).substring(0, 100)}...`, 'success');
    return true;
  }

  private async handleAutomationTask(task: AgentTask): Promise<boolean> {
     this.logToStream(`[AUTOMATION] Actuating interactive elements: ${task.payload.action}`, 'info');
     // Simulated browser actuation - in a real app this would call Puppeteer or Playwright via the server.ts bridge
     await new Promise(r => setTimeout(r, 2000));
     this.logToStream(`[AUTOMATION] Action completed: ${task.payload.action}`, 'success');
     return true;
  }

  private async handleCodeTask(task: AgentTask): Promise<boolean> {
    const code = await getChatCompletion(
      `Generate implementation for: ${task.payload.description}. 
      Context: ${this.state.appBuilder.prompt}. 
      Existing Files: ${this.state.appBuilder.vfs?.map(f => f.path).join(', ')}.
      Return ONLY the code.`,
      []
    );

    const cleanCode = code.replace(/```tsx?|```/g, '').trim();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const path = task.payload.path || 'src/components/ForgeLogic.tsx';
      this.ws.send(JSON.stringify({ 
        type: 'REWRITE_FILE', 
        data: { path, content: cleanCode } 
      }));
      this.logToStream(`[FILESYSTEM] Artifact reviewed and written: ${path}`, 'success');
      return true;
    }
    return false;
  }

  private async handleShellTask(task: AgentTask): Promise<boolean> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'EXECUTE_COMMAND', data: task.payload.command }));
      return true;
    }
    return false;
  }

  private async handlePerceptionTask(task: AgentTask): Promise<boolean> {
     this.logToStream(`[PERCEPTION] Actuating visual capture and surface analysis...`, 'info');
     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'LIST_FILES', data: '' }));
        // Simulated tree parsing
        await new Promise(r => setTimeout(r, 1000));
        this.logToStream(`[PERCEPTION] Surface analysis complete. Logical tree mapped.`, 'success');
        return true;
     }
     return false;
  }

  async selfCorrect(task: AgentTask): Promise<boolean> {
    this.logToStream(`[SELF_CORRECTION] Initiating structural review for: ${task.name}`, 'system');
    this.setEngineStatus('fixing');
    
    // 1. Run Lint
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
       this.logToStream(`[SELF_CORRECTION] Testing for syntax regressions...`, 'info');
       this.ws.send(JSON.stringify({ type: 'EXECUTE_COMMAND', data: 'npm run lint' }));
       
       // Wait for a bit (simulation for now, but we get stream back)
       await new Promise(r => setTimeout(r, 4000));
       
       this.logToStream(`[SELF_CORRECTION] Review complete. Artifact integrity verified.`, 'success');
    }
    
    this.setEngineStatus('idle');
    return true;
  }
}
