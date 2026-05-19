/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

export async function llmStream(
  baseUrl: string,
  modelId: string,
  messages: Message[],
  options: {
    temperature?: number;
    maxTokens?: number;
    backend: 'LM Studio' | 'Ollama' | 'Custom' | 'Gemini' | 'llama.cpp' | 'vLLM' | 'vLLM / Transformers' | 'Local' | 'Transformers';
    onChunk: (chunk: string) => void;
  }
) {
  if (options.backend === 'Gemini') {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId || "gemini-3-flash-preview",
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      })
    });
    const data = await res.json();
    options.onChunk(data.text || '');
    return;
  }

  const isOllama = options.backend === 'Ollama';
  const url = isOllama ? `${baseUrl}/api/chat` : `${baseUrl}/v1/chat/completions`;

  const body = isOllama
    ? {
        model: modelId,
        messages: messages,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      }
    : {
        model: modelId,
        messages: messages,
        stream: true,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        try {
          if (isOllama) {
            const json = JSON.parse(trimmed);
            if (json.message?.content) options.onChunk(json.message.content);
          } else {
            const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
            const json = JSON.parse(jsonStr);
            const chunk = json.choices?.[0]?.delta?.content;
            if (chunk) options.onChunk(chunk);
          }
        } catch (e) {
          // Silently skip parse errors for partial chunks
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error(`[NETWORK_ISOLATION_FAULT] Unable to reach ${options.backend} at ${baseUrl}. Ensure the native sidecar is running and CORS is enabled. Original: ${error.message}`, { cause: error });
    }
    throw error;
  }
}

export async function detectModels(baseUrl: string, backend: 'LM Studio' | 'Ollama' | 'Custom' | 'Sidecar') {
  try {
    if (backend === 'Sidecar') {
      const response = await fetch('http://localhost:8001/api/models');
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models || []).map((m: any) => ({
        id: m.path,
        name: m.name,
        backend: 'Custom',
        size: m.size,
        rarity: m.rarity || 'common',
        score: m.score || 0,
        origin: m.origin,
        isLocalFile: true
      }));
    }

    const modelsPath = backend === 'Ollama' ? '/api/tags' : '/v1/models';
    const response = await fetch(`${baseUrl}${modelsPath}`);
    if (!response.ok) throw new Error(`Failed to fetch models from ${backend}`);
    
    const data = await response.json();
    if (backend === 'Ollama') {
      return (data.models || []).map((m: any) => ({
        id: m.name,
        name: m.name,
        backend: 'Ollama',
        size: m.size ? `${(m.size / 1e9).toFixed(1)}GB` : '?',
        rarity: 'common',
        score: 0,
      }));
    } else {
      return (data.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        backend,
        size: '?',
        rarity: 'common',
        score: 0,
      }));
    }
  } catch (error: any) {
    console.error(`Detection error: ${error.message}`);
    if (backend === 'Sidecar') return []; // Silent fail for sidecar
    throw new Error(`[SIDE_CAR_OFFLINE] Could not sync with ${backend}. Verify the service is active on ${baseUrl}.`, { cause: error });
  }
}
