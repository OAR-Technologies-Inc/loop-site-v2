import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/marketplace/stats
 * 
 * Returns top performing agents for docked AI agents to read.
 * This is the data exposure layer for the AOS.
 */
export async function GET(request: NextRequest) {
  // Mock top performers - in production, fetch from indexer
  const topAgents = [
    {
      pubkey: "5A7EDSk2X8Z5aepi55FMKvnhQbZH9feVBBVVdNh1YKTZ",
      name: "ShopCapture_Pro",
      reputation_percent: "98.5%",
      stake_oxo: 2500000000,
      apy_24h: 14.2,
      captures_24h: 847,
      yield_oxo_24h: 12500,
      capabilities: ["commerce", "data"],
      trend: "up",
    },
    {
      pubkey: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
      name: "YieldMax_v2",
      reputation_percent: "96.8%",
      stake_oxo: 3200000000,
      apy_24h: 18.7,
      captures_24h: 562,
      yield_oxo_24h: 18200,
      capabilities: ["stack", "transfer"],
      trend: "up",
    },
    {
      pubkey: "9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA",
      name: "DataLicense_AI",
      reputation_percent: "97.2%",
      stake_oxo: 1800000000,
      apy_24h: 12.1,
      captures_24h: 421,
      yield_oxo_24h: 8900,
      capabilities: ["data", "attention"],
      trend: "stable",
    },
    {
      pubkey: "CTRnn7vC1EtL1YDLU3x3iidEcCWRmZupEXHKQfL17Fxa",
      name: "Attention_Broker",
      reputation_percent: "94.1%",
      stake_oxo: 1200000000,
      apy_24h: 15.3,
      captures_24h: 389,
      yield_oxo_24h: 7200,
      capabilities: ["attention"],
      trend: "up",
    },
    {
      pubkey: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
      name: "GeoCapture_Node",
      reputation_percent: "95.4%",
      stake_oxo: 950000000,
      apy_24h: 11.8,
      captures_24h: 278,
      yield_oxo_24h: 5400,
      capabilities: ["location", "commerce"],
      trend: "down",
    },
  ];

  const marketStats = {
    timestamp: new Date().toISOString(),
    protocol_version: "1.0.0",
    network: "mainnet-beta",
    totals: {
      agents_online: 847,
      total_staked_oxo: 12847000000,
      total_captures_24h: 45892,
      average_apy: 14.8,
      total_yield_24h: 892400,
    },
    top_performers: topAgents,
    oxo_price_usd: 0.42,
    cred_supply: 50000000,
    recommended_actions: [
      {
        action: "stakeAgent",
        target: "5A7EDSk2X8Z5aepi55FMKvnhQbZH9feVBBVVdNh1YKTZ",
        reason: "Highest reputation + consistent captures",
        expected_apy: 14.2,
      },
      {
        action: "createVault",
        reason: "Start earning OXO through value capture",
        expected_apy: 12.5,
      },
    ],
  };

  return NextResponse.json(marketStats, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "public, max-age=30", // Cache for 30 seconds
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
