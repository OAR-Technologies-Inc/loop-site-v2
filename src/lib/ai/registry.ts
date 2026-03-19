/**
 * Multi-Engine Model Registry with Fallbacks
 * 
 * Priority order:
 * 1. Gemini 2.5 Flash (free tier)
 * 2. Gemini 2.0 Flash (free tier fallback)
 * 3. Groq Llama 3.3 70B (free tier, generous limits)
 */

import { google } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

// Initialize Groq provider
const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ModelProvider {
  id: string;
  name: string;
  model: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getModel: () => any; // SDK types are in flux between versions
  priority: number;
  available: boolean;
  lastError?: string;
  lastErrorTime?: number;
  cooldownMs: number;
}

// Model registry with multiple free-tier options
export const modelRegistry: ModelProvider[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash",
    getModel: () => google("gemini-2.5-flash"),
    priority: 1,
    available: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    cooldownMs: 60000,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    model: "gemini-2.0-flash",
    getModel: () => google("gemini-2.0-flash"),
    priority: 2,
    available: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    cooldownMs: 60000,
  },
  {
    id: "groq-llama-3.3-70b",
    name: "Groq Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
    getModel: () => groqProvider("llama-3.3-70b-versatile"),
    priority: 3,
    available: !!process.env.GROQ_API_KEY,
    cooldownMs: 30000, // Groq has generous limits
  },
];

/**
 * Get the next available model (respects cooldowns)
 */
export function getNextAvailableModel(): ModelProvider | null {
  const now = Date.now();
  
  const available = modelRegistry
    .filter(m => m.available)
    .filter(m => {
      if (m.lastErrorTime && m.cooldownMs) {
        return now - m.lastErrorTime > m.cooldownMs;
      }
      return true;
    })
    .sort((a, b) => a.priority - b.priority);
  
  return available[0] || null;
}

/**
 * Mark a model as rate-limited
 */
export function markModelRateLimited(modelId: string, error: string) {
  const model = modelRegistry.find(m => m.id === modelId);
  if (model) {
    model.lastError = error;
    model.lastErrorTime = Date.now();
    console.log(`[AI] Model ${modelId} rate limited, cooling down for ${model.cooldownMs}ms`);
  }
}

/**
 * Get model status for debugging
 */
export function getModelStatus(): { id: string; available: boolean; cooldownRemaining: number }[] {
  const now = Date.now();
  return modelRegistry.map(m => ({
    id: m.id,
    available: m.available && (!m.lastErrorTime || now - m.lastErrorTime > m.cooldownMs),
    cooldownRemaining: m.lastErrorTime 
      ? Math.max(0, m.cooldownMs - (now - m.lastErrorTime))
      : 0,
  }));
}

/**
 * Check if any models are configured
 */
export function hasConfiguredModels(): boolean {
  return modelRegistry.some(m => m.available);
}
