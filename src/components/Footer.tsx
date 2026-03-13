"use client";

import Link from "next/link";

const footerLinks = {
  Protocol: [
    { label: "How It Works", href: "#protocol" },
    { label: "Tokenomics", href: "#tokenomics" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Whitepaper", href: "/whitepaper.pdf" },
  ],
  Developers: [
    { label: "Documentation", href: "https://docs.looplocal.io" },
    { label: "GitHub", href: "https://github.com/southerncory/loop-protocol" },
    { label: "SDK", href: "https://docs.looplocal.io/sdk" },
    { label: "API Reference", href: "https://docs.looplocal.io/api" },
  ],
  Community: [
    { label: "Twitter", href: "https://twitter.com/loopprotocol" },
    { label: "Discord", href: "https://discord.gg/loop" },
    { label: "Blog", href: "/blog" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="url(#footer-logo-gradient)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="10"
                    stroke="url(#footer-logo-gradient)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="20" cy="20" r="3" fill="#D4AF37" />
                  <defs>
                    <linearGradient
                      id="footer-logo-gradient"
                      x1="0"
                      y1="0"
                      x2="40"
                      y2="40"
                    >
                      <stop stopColor="#1B4D3E" />
                      <stop offset="1" stopColor="#2D7A5E" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-display text-lg font-bold">Loop</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              The economic layer for the agentic era.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-medium text-text-primary mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} OAR Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-text-muted">
              Built on{" "}
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-light hover:text-forest transition-colors"
              >
                Solana
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
