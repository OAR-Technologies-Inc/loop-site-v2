import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loop Protocol — Value Infrastructure for the Agentic Era",
  description:
    "Autonomous agents capture value. Vaults compound it. You own everything. The economic layer for AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loop",
  },
  openGraph: {
    title: "Loop Protocol — Value Infrastructure for the Agentic Era",
    description: "Autonomous agents capture value. Vaults compound it. You own everything.",
    url: "https://looplocal.io",
    siteName: "Loop Protocol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loop Protocol — Value Infrastructure for the Agentic Era",
    description: "Autonomous agents capture value. Vaults compound it. You own everything.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen dark-aura antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
