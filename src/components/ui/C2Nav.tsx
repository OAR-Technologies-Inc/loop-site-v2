"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusIndicator } from "./StatusIndicator";

export function C2Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Protocol" },
    { href: "/marketplace", label: "Agents" },
    { href: "/docs", label: "Docs" },
    { href: "/security", label: "Security" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-base/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-mono text-sm font-bold">◎</span>
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            LOOP<span className="text-text-muted">.PROTOCOL</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                pathname === item.href
                  ? "text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Status & Launch */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <StatusIndicator status="online" label="Mainnet" />
          </div>
          <Link
            href="/launch"
            className="shimmer-btn px-4 py-2 text-[10px]"
          >
            Launch Agent
          </Link>
        </div>
      </nav>
    </header>
  );
}
