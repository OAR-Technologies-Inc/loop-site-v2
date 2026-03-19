/**
 * Multi-Engine Model Registry with Fallbacks
 * 
 * FREE TIER: Google Gemini (15 RPM, 1M tokens/day free)
 * 
 * TODO: Add Groq when @ai-sdk/groq version compatibility is resolved
 */

import { google } from "@ai-sdk/google";
import { LanguageModel } from "ai";

export interface ModelProvider {
  id: string;
  name: string;
  model: string;
  provider: (model: string) => LanguageModel;
  priority: number;
  available: boolean;
  lastError?: string;
  lastErrorTime?: number;
  cooldownMs: number;
}

// Model registry - FREE TIER ONLY
export const modelRegistry: ModelProvider[] = [
  {
    id: "gemini",
    name: "Gemini 2.0 Flash",
    model: "gemini-2.0-flash-exp",
    provider: google,
    priority: 1,
    available: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    cooldownMs: 60000, // 1 minute cooldown on rate limit
  },
  // Gemini fallback model
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    model: "gemini-1.5-pro",
    provider: google,
    priority: 2,
    available: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    cooldownMs: 60000,
  },
];

/**
 * Get the next available model (respects cooldowns)
 */
export function getNextAvailableModel(): ModelProvider | null {
  const now = Date.now();
  
  // Sort by priority and filter available
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
