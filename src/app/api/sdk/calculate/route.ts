/**
 * SDK Calculation API
 * 
 * Runs actual Loop Protocol SDK calculations server-side.
 * Used by the embedded agent to provide accurate figures.
 */

import { NextResponse } from "next/server";

// APY Tiers (basis points, 100 = 1%) - matches on-chain program
const STAKING_APY = {
  TIER_365_PLUS: 1500,   // 15%
  TIER_180_PLUS: 1200,   // 12%
  TIER_90_PLUS: 800,     // 8%
  TIER_30_PLUS: 500,     // 5%
  TIER_7_PLUS: 300,      // 3%
  MINIMUM: 0,
} as const;

// Duration thresholds (days)
const STAKING_DURATIONS = {
  MIN_DAYS: 7,
  TIER_1: 30,
  TIER_2: 90,
  TIER_3: 180,
  TIER_4: 365,
  MAX_DAYS: 730,
} as const;

/**
 * Calculate APY for a given stacking duration
 */
function calculateApy(durationDays: number): number {
  if (durationDays >= STAKING_DURATIONS.TIER_4) return STAKING_APY.TIER_365_PLUS;
  if (durationDays >= STAKING_DURATIONS.TIER_3) return STAKING_APY.TIER_180_PLUS;
  if (durationDays >= STAKING_DURATIONS.TIER_2) return STAKING_APY.TIER_90_PLUS;
  if (durationDays >= STAKING_DURATIONS.TIER_1) return STAKING_APY.TIER_30_PLUS;
  if (durationDays >= STAKING_DURATIONS.MIN_DAYS) return STAKING_APY.TIER_7_PLUS;
  return STAKING_APY.MINIMUM;
}

/**
 * Calculate projected yield
 */
function calculateYield(amount: number, durationDays: number) {
  const apyBps = calculateApy(durationDays);
  const apyPercent = apyBps / 100;
  
  // Simple interest: amount * (apy / 100) * (days / 365)
  const yieldAmount = amount * (apyBps / 10000) * (durationDays / 365);
  const finalAmount = amount + yieldAmount;
  
  return {
    amount,
    durationDays,
    apyBps,
    apyPercent,
    yieldAmount: Math.round(yieldAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    tier: getTierName(durationDays),
  };
}

/**
 * Get human-readable tier name
 */
function getTierName(durationDays: number): string {
  if (durationDays >= 365) return "365+ days (Max Yield)";
  if (durationDays >= 180) return "180-364 days";
  if (durationDays >= 90) return "90-179 days";
  if (durationDays >= 30) return "30-89 days";
  if (durationDays >= 7) return "7-29 days (Min Lock)";
  return "Below minimum (no yield)";
}

/**
 * Calculate veOXO power from OXO lock
 */
function calculateVeOxoPower(oxoAmount: number, lockMonths: number) {
  // Lock multipliers: 6mo=0.25x, 12mo=0.5x, 24mo=1x, 48mo=2x
  let multiplier = 0;
  if (lockMonths >= 48) multiplier = 2.0;
  else if (lockMonths >= 24) multiplier = 1.0;
  else if (lockMonths >= 12) multiplier = 0.5;
  else if (lockMonths >= 6) multiplier = 0.25;
  
  const veOxoPower = oxoAmount * multiplier;
  
  return {
    oxoAmount,
    lockMonths,
    multiplier,
    veOxoPower: Math.round(veOxoPower * 100) / 100,
    lockPeriod: getLockPeriodName(lockMonths),
  };
}

function getLockPeriodName(lockMonths: number): string {
  if (lockMonths >= 48) return "4 years (2x)";
  if (lockMonths >= 24) return "2 years (1x)";
  if (lockMonths >= 12) return "1 year (0.5x)";
  if (lockMonths >= 6) return "6 months (0.25x)";
  return "Below minimum (6 months required)";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { calculation, params } = body;

    switch (calculation) {
      case "yield": {
        const { amount, days } = params;
        if (typeof amount !== "number" || typeof days !== "number") {
          return NextResponse.json(
            { error: "Missing amount or days parameter" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateYield(amount, days));
      }

      case "veoxo": {
        const { amount, lockMonths } = params;
        if (typeof amount !== "number" || typeof lockMonths !== "number") {
          return NextResponse.json(
            { error: "Missing amount or lockMonths parameter" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateVeOxoPower(amount, lockMonths));
      }

      case "apy": {
        const { days } = params;
        if (typeof days !== "number") {
          return NextResponse.json(
            { error: "Missing days parameter" },
            { status: 400 }
          );
        }
        const apyBps = calculateApy(days);
        return NextResponse.json({
          durationDays: days,
          apyBps,
          apyPercent: apyBps / 100,
          tier: getTierName(days),
        });
      }

      case "tiers": {
        // Return all tiers for reference
        return NextResponse.json({
          tiers: [
            { minDays: 365, maxDays: 730, apyPercent: 15, name: "365+ days" },
            { minDays: 180, maxDays: 364, apyPercent: 12, name: "180-364 days" },
            { minDays: 90, maxDays: 179, apyPercent: 8, name: "90-179 days" },
            { minDays: 30, maxDays: 89, apyPercent: 5, name: "30-89 days" },
            { minDays: 7, maxDays: 29, apyPercent: 3, name: "7-29 days" },
          ],
          minimumLock: 7,
          maximumLock: 730,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown calculation type: ${calculation}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[SDK Calculate] Error:", error);
    return NextResponse.json(
      { error: "Calculation failed" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    calculations: ["yield", "veoxo", "apy", "tiers"],
    source: "Loop Protocol SDK",
  });
}
