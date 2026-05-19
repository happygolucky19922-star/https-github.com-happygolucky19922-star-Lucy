/**
 * System-2 Executive Reasoning Engine
 * Implements ReAct (Reasoning + Acting) loop for autonomous agents.
 */

import { llmStream } from './llm';

export interface ToolExecution {
  thought: string;
  tool: string;
  params: any;
  observation: string;
}

export class System2Executive {
  private onLog: (log: string) => void;
  private traceId: string = '';

  constructor(onLog: (log: string) => void) {
    this.onLog = onLog;
  }

  private addLog(msg: string) {
    this.onLog(msg);
  }

  async run(prompt: string, modelId: string, backend: 'LM Studio' | 'Ollama' | 'Custom' | 'Gemini') {
    this.traceId = crypto.randomUUID();
    this.addLog(`[SYSTEM] Initializing sovereign loop for session: ${this.traceId}`);
    
    let currentPrompt = `You are a System-2 Executive Agent. You have access to native Linux tools (bash, gdb, tcpdump).
Your goal: ${prompt}

Use the following format:
Thought: your reasoning about what to do next
Action: tool_name
Params: { "param1": "value" }
Observation: [Tool output will appear here]
... (repeat until finished)
Final Answer: your final response

Available Tools:
- bash: { "command": "string" }
- gdb: { "binary": "path", "commands": "string" }
- tcpdump: { "interface": "string" }

Begin.`;

    let steps = 0;
    const maxSteps = 5;

    while (steps < maxSteps) {
      this.addLog(`[STEP ${steps + 1}] Invoking LLM reasoning core...`);
      let response = '';
      
      await llmStream('http://localhost:1234', modelId, [{ role: 'user', content: currentPrompt }], {
        backend,
        onChunk: (c) => { response += c; }
      });

      this.addLog(`[REASON] ${this.extractThought(response)}`);

      const toolCall = this.parseAction(response);
      if (!toolCall) {
        this.addLog(`[FINAL] ${this.extractFinalAnswer(response)}`);
        return response;
      }

      this.addLog(`[ACTION] Executing ${toolCall.tool} via hardware sidecar...`);
      
      try {
        const toolResp = await fetch('http://localhost:8001/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: toolCall.tool,
            params: toolCall.params,
            trace_id: this.traceId
          })
        });
        const toolData = await toolResp.json();
        const observation = JSON.stringify(toolData.result);
        
        this.addLog(`[OBSERVATION] Output captured and piped to ChromaDB.`);
        currentPrompt += `\nThought: ${this.extractThought(response)}\nAction: ${toolCall.tool}\nParams: ${JSON.stringify(toolCall.params)}\nObservation: ${observation}`;
      } catch (e) {
        this.addLog(`[ERROR] Tool execution failed: ${e}`);
        break;
      }

      steps++;
    }

    return "System-2 loop terminated.";
  }

  private extractThought(text: string) {
    const match = text.match(/Thought:(.*?)(?=Action:|Final Answer:|$)/s);
    return match ? match[1].trim() : "Internalizing goal parameters...";
  }

  private parseAction(text: string) {
    const actionMatch = text.match(/Action:\s*(\w+)/);
    const paramsMatch = text.match(/Params:\s*({.*?})/s);
    if (actionMatch && paramsMatch) {
      try {
        return { tool: actionMatch[1], params: JSON.parse(paramsMatch[1]) };
      } catch { return null; }
    }
    return null;
  }

  private extractFinalAnswer(text: string) {
    const match = text.match(/Final Answer:(.*)$/s);
    return match ? match[1].trim() : text;
  }
}
