"use client";

/**
 * Marketplace Layout - Immersive AOS Mode
 * 
 * Navigation is handled by the OS_NAV inside AgentHUD.
 * This layout provides minimal wrapper for full-screen terminal experience.
 */
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {children}
    </div>
  );
}
