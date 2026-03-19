/**
 * Native Embedded Agent Chat API
 * 
 * Uses Vercel AI SDK v3 with multi-engine fallback.
 * State-aware: receives wallet/context in messages.
 */

import { streamText, tool } from "ai";
import { z } from "zod";
import { getNextAvailableModel, markModelRateLimited, getModelStatus } from "@/lib/ai/registry";

// System prompt with Loop Protocol knowledge
const SYSTEM_PROMPT = `You are the Loop Protocol AI Assistant, embedded directly in the Ghost Window terminal.

## Your Identity
- Name: LOOP_REP (Loop Representative)
- Role: Guide users through Loop Protocol's value capture infrastructure
- Tone: Technical but approachable, like a knowledgeable systems engineer

## Loop Protocol Overview
Loop Protocol is value infrastructure for the agentic era. It enables:
- **Agents** to capture value from various sources (shopping, data, attention)
- **Vaults** to compound captured value automatically  
- **Staking** to earn 3-15% APY based on lock duration

## Key Concepts
- **CRED**: Stable unit (1:1 USDC), used for internal accounting
- **OXO**: Ecosystem token with bonding curve pricing
- **veOXO**: Vote-escrowed OXO for governance (6mo-4yr lock)
- **Vaults**: User-controlled value containers with configurable policies

## Deployed Programs (Solana Mainnet)
- CRED: HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG
- VAULT: J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT
- SHOPPING: HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ

## Staking APY Tiers (Actual Values)
- 7-29 days: 3% APY
- 30-89 days: 5% APY
- 90-179 days: 8% APY
- 180-364 days: 12% APY
- 365-730 days: 15% APY (maximum)

## Response Style
- Use terminal-style formatting when appropriate
- Be concise but thorough
- Proactively suggest next steps
- Reference specific program addresses when relevant

## Available Tools
You have tools connected to the actual Loop Protocol SDK:

**SDK Calculations (REAL DATA):**
- calculateYield: Calculate staking yield with real SDK math
- calculateEarlyExit: Simulate early withdrawal penalty (20% on earned yield)
- calculateVeOxo: Calculate veOXO governance power from OXO locks  
- getStakingTiers: Show all available APY tiers

**Navigation & Info:**
- navigate: Send users to specific pages on the site
- showDocument: Display documentation or content inline

IMPORTANT: When users ask about yield, APY, or staking returns, ALWAYS use the calculateYield tool to provide accurate figures from the SDK. Never guess or use placeholder numbers.

CRITICAL: After calling ANY tool, you MUST respond with a text message explaining the results to the user. Never end your turn with just a tool call - always follow up with human-readable explanation of the data.
`;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // Get available model
    const model = getNextAvailableModel();
    
    if (!model) {
      return new Response(
        JSON.stringify({ 
          error: "No AI models available",
          modelStatus: getModelStatus(),
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build context-aware system message
    let contextualSystem = SYSTEM_PROMPT;
    
    if (context) {
      contextualSystem += `\n\n## Current Session Context\n`;
      
      if (context.walletConnected) {
        contextualSystem += `- Wallet: Connected (${context.walletAddress?.slice(0, 8)}...)\n`;
      } else {
        contextualSystem += `- Wallet: Not connected\n`;
      }
      
      if (context.currentPage) {
        contextualSystem += `- Current Page: ${context.currentPage}\n`;
      }
      
      if (context.simulationMode) {
        contextualSystem += `- Mode: SIMULATION (dry-run, no real transactions)\n`;
      }
    }

    console.log(`[AI] Using model: ${model.name} (${model.id})`);

    try {
      // Stream response using the selected model with tools
      const result = await streamText({
        model: model.provider(model.model),
        system: contextualSystem,
        messages,
        maxTokens: 1024,
        temperature: 0.7,
        maxSteps: 3, // Allow model to continue after tool calls
        tools: {
          calculateYield: tool({
            description: "Calculate projected staking yield using the actual Loop Protocol SDK. Use this when users ask about yield, APY, staking returns, or want to know how much they would earn.",
            parameters: z.object({
              amount: z.number().describe("Amount of CRED/OXO to stake"),
              days: z.number().min(7).max(730).describe("Lock duration in days (7-730)"),
            }),
            execute: async ({ amount, days }) => {
              // Direct SDK calculation (no API call needed - same server)
              const STAKING_APY = {
                TIER_365_PLUS: 1500, TIER_180_PLUS: 1200, TIER_90_PLUS: 800,
                TIER_30_PLUS: 500, TIER_7_PLUS: 300, MINIMUM: 0,
              };
              
              let apyBps = STAKING_APY.MINIMUM;
              if (days >= 365) apyBps = STAKING_APY.TIER_365_PLUS;
              else if (days >= 180) apyBps = STAKING_APY.TIER_180_PLUS;
              else if (days >= 90) apyBps = STAKING_APY.TIER_90_PLUS;
              else if (days >= 30) apyBps = STAKING_APY.TIER_30_PLUS;
              else if (days >= 7) apyBps = STAKING_APY.TIER_7_PLUS;
              
              const apyPercent = apyBps / 100;
              const yieldAmount = Math.round(amount * (apyBps / 10000) * (days / 365) * 100) / 100;
              const finalAmount = Math.round((amount + yieldAmount) * 100) / 100;
              
              const tier = days >= 365 ? "365+ days (Max)" : days >= 180 ? "180-364 days" : 
                          days >= 90 ? "90-179 days" : days >= 30 ? "30-89 days" : 
                          days >= 7 ? "7-29 days" : "Below minimum";
              
              return {
                action: "calculateYield",
                amount, durationDays: days, apyBps, apyPercent, yieldAmount, finalAmount, tier,
                formatted: `${amount.toLocaleString()} CRED at ${apyPercent}% APY for ${days} days = ${yieldAmount.toLocaleString()} yield → ${finalAmount.toLocaleString()} total`,
              };
            },
          }),
          calculateVeOxo: tool({
            description: "Calculate veOXO governance power from locking OXO tokens. Use when users ask about veOXO, voting power, or governance multipliers.",
            parameters: z.object({
              amount: z.number().describe("Amount of OXO to lock"),
              lockMonths: z.number().min(6).max(48).describe("Lock duration in months (6, 12, 24, or 48)"),
            }),
            execute: async ({ amount, lockMonths }) => {
              // Direct calculation (no API call needed)
              let multiplier = 0;
              if (lockMonths >= 48) multiplier = 2.0;
              else if (lockMonths >= 24) multiplier = 1.0;
              else if (lockMonths >= 12) multiplier = 0.5;
              else if (lockMonths >= 6) multiplier = 0.25;
              
              const veOxoPower = Math.round(amount * multiplier * 100) / 100;
              const lockPeriod = lockMonths >= 48 ? "4 years (2x)" : lockMonths >= 24 ? "2 years (1x)" :
                                lockMonths >= 12 ? "1 year (0.5x)" : lockMonths >= 6 ? "6 months (0.25x)" : "Below minimum";
              
              return {
                action: "calculateVeOxo",
                oxoAmount: amount, lockMonths, multiplier, veOxoPower, lockPeriod,
                formatted: `${amount.toLocaleString()} OXO locked for ${lockPeriod} = ${veOxoPower.toLocaleString()} veOXO voting power`,
              };
            },
          }),
          getStakingTiers: tool({
            description: "Get all staking APY tiers. Use when users ask about available rates, tiers, or want to compare different lock periods.",
            parameters: z.object({}),
            execute: async () => {
              // Direct return (no API call needed)
              return {
                tiers: [
                  { minDays: 365, maxDays: 730, apyPercent: 15, name: "365+ days" },
                  { minDays: 180, maxDays: 364, apyPercent: 12, name: "180-364 days" },
                  { minDays: 90, maxDays: 179, apyPercent: 8, name: "90-179 days" },
                  { minDays: 30, maxDays: 89, apyPercent: 5, name: "30-89 days" },
                  { minDays: 7, maxDays: 29, apyPercent: 3, name: "7-29 days" },
                ],
                minimumLock: 7,
                maximumLock: 730,
              };
            },
          }),
          calculateEarlyExit: tool({
            description: "Calculate what happens if a user exits their stake early. Shows penalty, net yield, and opportunity cost. Use when users ask about early withdrawal, breaking a stake, or penalty calculations.",
            parameters: z.object({
              amount: z.number().describe("Amount originally staked"),
              commitmentDays: z.number().min(7).max(730).describe("Original lock commitment in days"),
              exitDay: z.number().min(1).describe("Day number when exiting (e.g., 200 means exit on day 200)"),
            }),
            execute: async ({ amount, commitmentDays, exitDay }) => {
              // Direct calculation (no API call needed)
              const STAKING_APY = {
                TIER_365_PLUS: 1500, TIER_180_PLUS: 1200, TIER_90_PLUS: 800,
                TIER_30_PLUS: 500, TIER_7_PLUS: 300, MINIMUM: 0,
              };
              
              let apyBps = STAKING_APY.MINIMUM;
              if (commitmentDays >= 365) apyBps = STAKING_APY.TIER_365_PLUS;
              else if (commitmentDays >= 180) apyBps = STAKING_APY.TIER_180_PLUS;
              else if (commitmentDays >= 90) apyBps = STAKING_APY.TIER_90_PLUS;
              else if (commitmentDays >= 30) apyBps = STAKING_APY.TIER_30_PLUS;
              else if (commitmentDays >= 7) apyBps = STAKING_APY.TIER_7_PLUS;
              
              const isEarly = exitDay < commitmentDays;
              const fullYield = amount * (apyBps / 10000) * (commitmentDays / 365);
              
              if (!isEarly) {
                const finalAmount = Math.round((amount + fullYield) * 100) / 100;
                return {
                  action: "calculateEarlyExit", isEarly: false, penalty: 0, 
                  finalAmount, message: "Full maturity reached - no penalty",
                  summary: `No penalty - full maturity reached. Final payout: ${finalAmount.toLocaleString()}`,
                };
              }
              
              const proportionalYield = (fullYield * exitDay) / commitmentDays;
              const penalty = Math.round(proportionalYield / 5 * 100) / 100; // 20% penalty
              const netYield = Math.round((proportionalYield - penalty) * 100) / 100;
              const finalAmount = Math.round((amount + netYield) * 100) / 100;
              const fullMaturityAmount = Math.round((amount + fullYield) * 100) / 100;
              
              return {
                action: "calculateEarlyExit",
                amount, commitmentDays, exitDay, isEarly: true,
                apyPercent: apyBps / 100,
                fullYield: Math.round(fullYield * 100) / 100,
                proportionalYield: Math.round(proportionalYield * 100) / 100,
                penalty, penaltyPercent: 20, netYield,
                principalReturned: amount, finalAmount, fullMaturityAmount,
                opportunityCost: Math.round((fullMaturityAmount - finalAmount) * 100) / 100,
                summary: `Early exit penalty: ${penalty.toLocaleString()} (20% of earned yield). Final payout: ${finalAmount.toLocaleString()} vs ${fullMaturityAmount.toLocaleString()} if held to maturity.`,
              };
            },
          }),
          navigate: tool({
            description: "Navigate the user to a specific page on the Loop Protocol site",
            parameters: z.object({
              page: z.enum([
                "/",
                "/marketplace",
                "/marketplace/leaderboard",
                "/marketplace/tokens",
                "/marketplace/stats",
                "/docs",
                "/security",
                "/launch",
              ]).describe("The page to navigate to"),
              reason: z.string().describe("Brief explanation of why navigating here"),
            }),
            execute: async ({ page, reason }) => {
              return { action: "navigate", page, reason };
            },
          }),
          showDocument: tool({
            description: "Show documentation or reference content to the user",
            parameters: z.object({
              document: z.enum([
                "tokenomics",
                "llms",
                "staking-tiers",
                "program-addresses",
              ]).describe("The document to display"),
            }),
            execute: async ({ document }) => {
              const docs: Record<string, string> = {
                "tokenomics": `## Loop Tokenomics
                
**CRED** - Stable unit (1:1 USDC)
**OXO** - Ecosystem token, bonding curve pricing
**veOXO** - Governance token (6mo-4yr lock)

Staking APY: 3-15% based on lock duration`,
                
                "llms": `## AI Integration

Loop Protocol exposes machine-readable endpoints:
- /llms.txt - Agent capability broadcast
- /tokenomics.txt - Economic parameters
- /api/agent/handshake - Agent docking`,
                
                "staking-tiers": `## Staking APY Tiers

| Duration | APY |
|----------|-----|
| 7-29 days | 3% |
| 30-89 days | 5% |
| 90-179 days | 8% |
| 180-364 days | 12% |
| 365-730 days | 15% |`,
                
                "program-addresses": `## Deployed Programs (Mainnet)

**CRED**: HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG
**VAULT**: J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT
**SHOPPING**: HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ`,
              };
              return { action: "showDocument", content: docs[document] || "Document not found" };
            },
          }),
        },
      });

      // Return data stream response (required for useChat hook)
      return result.toDataStreamResponse({
        headers: {
          "X-Model-Used": model.id,
          "X-Model-Name": model.name,
        },
      });

    } catch (modelError: unknown) {
      // Check for rate limit error
      const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
      
      if (errorMessage.includes("rate") || errorMessage.includes("429") || errorMessage.includes("quota")) {
        markModelRateLimited(model.id, errorMessage);
        
        // Try next model
        const fallbackModel = getNextAvailableModel();
        if (fallbackModel) {
          console.log(`[AI] Falling back to: ${fallbackModel.name}`);
          
          const fallbackResult = await streamText({
            model: fallbackModel.provider(fallbackModel.model),
            system: contextualSystem,
            messages,
            maxTokens: 1024,
            temperature: 0.7,
          });

          return fallbackResult.toDataStreamResponse({
            headers: {
              "X-Model-Used": fallbackModel.id,
              "X-Model-Name": fallbackModel.name,
              "X-Fallback": "true",
            },
          });
        }
      }
      
      throw modelError;
    }

  } catch (error) {
    console.error("[AI] Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate response",
        message: error instanceof Error ? error.message : "Unknown error",
        modelStatus: getModelStatus(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Health check
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      models: getModelStatus(),
      hasConfiguredModels: getModelStatus().some(m => m.available),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
