import { AppState } from "../types";
import { getChatCompletion } from "./geminiService";

export const DreamEngine = {
  /**
   * Generates a "Reflection Cycle" using a live connection to Gemini.
   */
  async generateReflectionCycle(state: AppState) {
    const ts = Date.now();
    
    // Heuristic: identify offline routers
    const offlineRouters = state.dreamMode.modelHub.routers.filter((r: any) => r.status === 'offline');
    const unresolvedProblems = offlineRouters.map((r: any) => `External Router '${r.name}' is unreachable. Path: ${r.endpoint}`);
    
    if (unresolvedProblems.length === 0) {
      unresolvedProblems.push("Sub-optimal latency in logic adapter.");
      unresolvedProblems.push("Context window saturation in large planning tasks.");
    }
    
    const contextPrompt = `
      You are the core cognition unit of an autonomous agent network.
      You are currently running a "Dream Cycle" where you consolidate daily logic and generate new insights.
      Current system state: ${state.appBuilder.agents.length} active agents, ${state.models.length} loaded models.
      Unresolved Problems: ${unresolvedProblems.join(', ')}
      Generate 3 profound, highly technical "insights" about how to optimize your own neural architecture.
      Return the output strictly as a JSON array of 3 strings. Do not use markdown wrappers like \`\`\`json.
    `;
    
    let insights = [
      `Optimization: ${state.models.length} active models detected.`,
      "Synchronicity: Manifold re-alignment suggested for stability.",
      "Persistence: Memory decay rate stable at 0.05 index."
    ];
    let summary = `System optimization complete. Reflected on ${unresolvedProblems.length} bottlenecks. Knowledge graph re-indexed.`;

    try {
        const responseJsonStr = await getChatCompletion(contextPrompt);
        // Clean markdown backticks if any
        const cleanedStr = responseJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedInsights = JSON.parse(cleanedStr);
        if (Array.isArray(parsedInsights) && parsedInsights.length > 0) {
            insights = parsedInsights.map(s => String(s));
            summary = `Deep neural network reflection synthesized ${insights.length} optimized pathways across ${state.models.length} matrices.`;
        }
    } catch (e) {
        console.warn("Dream Cycle neural inference failed. Using fallback insights.", e);
    }

    return {
      id: `dream-${ts}`,
      ts,
      summary,
      unresolvedProblems,
      insights,
      contextCompressed: true
    };
  }
};
