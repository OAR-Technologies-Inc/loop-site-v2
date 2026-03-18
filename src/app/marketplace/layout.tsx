/**
 * Marketplace Layout - Immersive AOS Terminal Mode
 * NO traditional navigation - all nav handled by AgentHUD OS_NAV
 * Build: 2026-03-18T20:00:00Z - Cache bust
 */
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render children directly - no wrapper divs, no nav, no header
  return <>{children}</>;
}
