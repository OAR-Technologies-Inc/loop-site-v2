/**
 * Multi-Engine Model Registry with Fallbacks
 * 
 * Cycles through providers when rate limits are hit:
 * 1. Google Gemini (primary)
 * 2. Anthropic Claude
 */

import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
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

// Model registry with fallback order
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
  {
    id: "anthropic",
    name: "Claude 3.5 Haiku",
    model: "claude-3-5-haiku-latest",
    provider: anthropic,
    priority: 2,
    available: !!process.env.ANTHROPIC_API_KEY,
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
