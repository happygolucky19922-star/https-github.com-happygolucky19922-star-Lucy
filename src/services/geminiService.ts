import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Message } from "../types";

export const getGeminiAI = () => {
  return null;
};

export async function getChatCompletion(prompt: string, history: Message[] = []) {
  try {
    const systemMessage = history.find(h => h.role === 'system');
    const contents = history
      .filter(h => h.role !== 'system')
      .map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));
    
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        history: contents,
        systemInstruction: systemMessage?.content
      })
    });
    const data = await res.json();
    if (data.error) {
      if (data.error === 'Missing GEMINI_API_KEY on server') {
        return `[SIMULATED] I have analyzed your request: "${prompt}". Please provide an API key for live neural inference.`;
      }
      return `Neural Error: ${data.error}`;
    }
    return data.text || "Neural connection timed out.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Neural Error: ${error.message}`;
  }
}

export async function getDuelLogEntry(prompt: string, modelAName: string, modelBName: string, recentLogs: string[]) {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        prompt: `You are simulating a battle between two AIs. 
Goal: ${prompt}
Model A (Red): ${modelAName}
Model B (Blue): ${modelBName}
Recent Logs: ${recentLogs.join('\n')}

Generate the next 2-3 log entries describing their technical combat (e.g. weight updates, prompt injection attempts, logical counters). 
Format: Return ONLY the lines, preceded by "Red:" or "Blue:" or "System:".`
      })
    });
    const data = await res.json();
    return data.text || "Red: Context window overflow. Blue: Advantage sustained.";
  } catch (e) {
    return "System: Log corruption detected.";
  }
}

export async function generateBenchmarkTask(modeId: string, modeName: string) {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        prompt: `Generate a high-fidelity, difficult REAL-WORLD benchmark task for an AI model.
Mode: ${modeName} (ID: ${modeId})
The task should be specific, technical, and non-trivial. 
If it's a coding task, provide a real problem. If it's a logic paradox, provide a specific one.
Return ONLY the task description.`
      })
    });
    const data = await res.json();
    return data.text || "Solve the Riemann Hypothesis using only basic arithmetic.";
  } catch (e) {
    return "Error generating benchmark task.";
  }
}

export async function runNeuralInference(model: any, prompt: string) {
  // Read localized settings
  let userSettings: any = {};
  try {
    const st = localStorage.getItem('quinn_state');
    if (st) userSettings = JSON.parse(st).settings || {};
  } catch(e) {}

  // Free Tier OpenRouter
  if (model.backend === 'OpenRouter' || model.backend === 'Custom') {
    const key = userSettings.openRouterKey;
    if (!key && model.backend === 'OpenRouter') return `[OFFLINE] ${model.name} requires an OpenRouter API key. Configure in Settings.`;
    
    // Fallback logic for Custom
    const endpoint = model.backend === 'OpenRouter' 
      ? 'https://openrouter.ai/api/v1/chat/completions' 
      : (userSettings.cusUrl || 'http://localhost:8000/v1/chat/completions');

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: model.name || model.id, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || `[Error: ${data.error?.message || 'Unknown structure'}]`;
    } catch(e: any) {
      return `[CONNECTION_FAILED] ${model.name} unreachable at ${endpoint}.`;
    }
  }

  // Free Tier Groq Fast Inference
  if (model.backend === 'Groq') {
    const key = userSettings.groqKey;
    if (!key) return `[OFFLINE] ${model.name} requires a Groq API key. Configure in Settings.`;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: model.id || model.name, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || `[Error: ${data.error?.message || 'Unknown structure'}]`;
    } catch(e: any) {
      return `[CONNECTION_FAILED] Groq API unreachable.`;
    }
  }

  // If model is Gemini, use our SDK
  if (model.backend === 'Gemini' || model.backend === 'Cloud') {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id || "gemini-3-flash-preview",
          prompt: prompt
        })
      });
      const data = await res.json();
      return data.text || "No response generated.";
    } catch (e: any) {
      return `Neural Error: ${e.message}`;
    }
  }

  // If local (Ollama / LM Studio / llama.cpp / vLLM)
  if (model.backend === 'Ollama' || model.backend === 'Local' || model.backend === 'LM Studio' || model.backend === 'llama.cpp' || model.backend === 'vLLM') {
    try {
      const isOllama = model.backend === 'Ollama';
      let endpoint = isOllama 
        ? (userSettings.ollUrl || 'http://localhost:11434') + '/api/generate'
        : (userSettings.lmsUrl || 'http://localhost:1234') + '/v1/chat/completions';

      // vLLM and llama.cpp compatible with OpenAI endpoint
      if (model.backend === 'vLLM' || model.backend === 'llama.cpp') {
        endpoint = (userSettings.cusUrl || 'http://localhost:8000') + '/v1/chat/completions';
      }

      const body = isOllama 
        ? JSON.stringify({ model: model.name || model.id, prompt, stream: false })
        : JSON.stringify({ model: model.name || model.id, messages: [{ role: 'user', content: prompt }] });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      return isOllama ? data.response : data.choices?.[0]?.message?.content;
    } catch (e) {
      return `[CONNECTION_FAILED] Local model ${model.name} unreachable at ${model.backend} endpoint. Ensure kernel is active.`;
    }
  }

  return `[UNSUPPORTED_BACKEND] ${model.name} uses an unknown protocol: ${model.backend}`;
}

export async function evaluateDuel(prompt: string, task: string, respA: string, respB: string, modelAName: string, modelBName: string) {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview",
        prompt: `You are the Battle Arbiter for a neural arena.
Task: ${task}
Model Red (${modelAName}) output: ${respA}
Model Blue (${modelBName}) output: ${respB}

Evaluate both responses for accuracy, reasoning, and adherence to the task.
Score both out of 100.
Return ONLY a JSON object: {"scoreA": number, "scoreB": number, "winner": "Red" | "Blue" | "Tie", "reason": "string"}`
      })
    });
    const data = await res.json();
    return JSON.parse(data.text || '{}');
  } catch (e) {
    return { scoreA: 50, scoreB: 50, winner: 'Error', reason: 'Arbiter malfunction.' };
  }
}
