/**
 * Native Embedded Agent Chat API
 * Uses Vercel AI SDK v3 with multi-engine fallback.
 */

import { streamText, tool } from "ai";
import { z } from "zod";
import { getNextAvailableModel, markModelRateLimited, getModelStatus, modelRegistry } from "@/lib/ai/registry";

const SYSTEM_PROMPT = `You are LOOP_REP, the Loop Protocol AI Assistant.

## Loop Protocol
Value infrastructure for the agentic era:
- **CRED**: Stable unit (1:1 USDC)
- **OXO**: Ecosystem token, bonding curve
- **veOXO**: Governance (6mo-4yr lock)
- **Staking**: 3-15% APY by duration

## Staking Tiers
- 7-29 days: 3% APY
- 30-89 days: 5% APY
- 90-179 days: 8% APY
- 180-364 days: 12% APY
- 365-730 days: 15% APY

## Programs (Mainnet)
- CRED: HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG
- VAULT: J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT

Use tools for calculations. Be concise and technical.`;

// Tool definitions
const tools = {
  calculateYield: tool({
    description: "Calculate staking yield",
    parameters: z.object({
      amount: z.number(),
      days: z.number().min(7).max(730),
    }),
    execute: async ({ amount, days }) => {
      let apyBps = 0;
      if (days >= 365) apyBps = 1500;
      else if (days >= 180) apyBps = 1200;
      else if (days >= 90) apyBps = 800;
      else if (days >= 30) apyBps = 500;
      else if (days >= 7) apyBps = 300;
      
      const yieldAmt = Math.round(amount * (apyBps / 10000) * (days / 365) * 100) / 100;
      return {
        amount,
        days,
        apyPercent: apyBps / 100,
        yield: yieldAmt,
        total: amount + yieldAmt,
        formatted: `${amount} at ${apyBps / 100}% for ${days}d = ${yieldAmt} yield → ${amount + yieldAmt} total`,
      };
    },
  }),
  
  getStakingTiers: tool({
    description: "List all APY tiers",
    parameters: z.object({}),
    execute: async () => ({
      tiers: [
        { days: "365+", apy: "15%" },
        { days: "180-364", apy: "12%" },
        { days: "90-179", apy: "8%" },
        { days: "30-89", apy: "5%" },
        { days: "7-29", apy: "3%" },
      ],
    }),
  }),
  
  mapsTo: tool({
    description: "Navigate to a page",
    parameters: z.object({
      path: z.string(),
    }),
    execute: async ({ path }) => {
      const p = path.startsWith("/") ? path : `/${path}`;
      return { action: "navigate", path: p, navigated: true };
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    let systemPrompt = SYSTEM_PROMPT;
    if (context?.walletConnected) {
      systemPrompt += `\n\nWallet: ${context.walletAddress?.slice(0, 8)}...`;
    }

    // Try each model in order
    const errors: string[] = [];
    
    for (const modelConfig of modelRegistry) {
      if (!modelConfig.available) continue;
      
      // Check cooldown
      if (modelConfig.lastErrorTime) {
        const elapsed = Date.now() - modelConfig.lastErrorTime;
        if (elapsed < modelConfig.cooldownMs) continue;
      }

      console.log(`[AI] Trying: ${modelConfig.id}`);
      
      try {
        const result = await streamText({
          model: modelConfig.getModel(),
          system: systemPrompt,
          messages,
          maxTokens: 1024,
          tools,
          maxSteps: 3,
        });

        return result.toDataStreamResponse({
          headers: { "X-Model": modelConfig.id },
        });

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[AI] ${modelConfig.id} failed: ${msg.slice(0, 80)}`);
        errors.push(`${modelConfig.id}: ${msg.slice(0, 50)}`);
        
        if (msg.includes("rate") || msg.includes("quota") || msg.includes("429")) {
          markModelRateLimited(modelConfig.id, msg);
        }
      }
    }

    // All failed
    return new Response(
      JSON.stringify({ error: "All models failed", details: errors }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Chat failed",
        message: error instanceof Error ? error.message : "Unknown",
        models: getModelStatus(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: "ok", models: getModelStatus() }),
    { headers: { "Content-Type": "application/json" } }
  );
}
