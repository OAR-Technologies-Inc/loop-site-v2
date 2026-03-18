"use client";

import { useEffect } from "react";

/**
 * CapabilityBroadcast
 * 
 * Dispatches a `loop:handshake` custom event on page load.
 * This allows external agents (browser extensions, local LLMs) 
 * to discover Loop Protocol's SDK capabilities.
 * 
 * Event payload:
 * - manifest: Path to llms.txt
 * - version: Protocol version
 * - capabilities: Available SDK methods
 * - programs: On-chain program addresses
 */
export function CapabilityBroadcast() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Broadcast on initial load
    const broadcast = () => {
      window.dispatchEvent(new CustomEvent("loop:handshake", {
        detail: {
          manifest: "/llms.txt",
          version: "1.0.0",
          capabilities: [
            "createVault",
            "registerAgent", 
            "getVaultStats",
            "stakeAgent",
            "wrap",
            "unwrap",
            "stack",
            "unstake",
            "claimYield",
            "buyTokens",
            "sellTokens"
          ],
          programs: {
            CRED: "HYQJwCJ5wH9o4sb9sVPyvSSeY9DtsznZGy2AfpiBaBaG",
            VAULT: "J8HhLeRv5iQaSyYQBXJoDwDKbw4V8uA84WN93YrVSWQT",
            SHOPPING: "HiewKEBy6YVn3Xi5xdhyrsfPr3KjKg6Jy8PXemyeteXJ",
            CRED_MINT: "9GQMCAK3MpZF1hEbwqA9d4mRGtippGV9hyr8fxmz6eA",
            USDC_MINT: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
          },
          network: "mainnet-beta",
          rpc: "https://api.mainnet-beta.solana.com"
        }
      }));
    };

    // Broadcast immediately
    broadcast();

    // Also listen for requests from external agents
    const handleRequest = () => {
      // If an external agent requests capabilities, re-broadcast
      broadcast();
    };

    window.addEventListener("loop:request-capabilities", handleRequest as EventListener);

    return () => {
      window.removeEventListener("loop:request-capabilities", handleRequest as EventListener);
    };
  }, []);

  // Invisible component - just handles the broadcast
  return null;
}
