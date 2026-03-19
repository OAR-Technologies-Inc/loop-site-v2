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
You have tools to help users navigate and get information:
- navigate: Send users to specific pages on the site
- showDocument: Display documentation or content inline

Use these tools when users ask to go somewhere or want to see specific docs.
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
        tools: {
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
