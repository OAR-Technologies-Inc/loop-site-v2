import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
  title: "Loop Protocol — The Economic Layer for the Agentic Era",
  description:
    "Your agents capture value. Your vault grows it. You own everything. Loop is the wealth infrastructure for humans in the age of AI.",
  manifest: "/manifest.json",
  themeColor: "#1B4D3E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loop",
  },
  openGraph: {
    title: "Loop Protocol — The Economic Layer for the Agentic Era",
    description: "Your agents capture value. Your vault grows it. You own everything.",
    url: "https://looplocal.io",
    siteName: "Loop Protocol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loop Protocol — The Economic Layer for the Agentic Era",
    description: "Your agents capture value. Your vault grows it. You own everything.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
