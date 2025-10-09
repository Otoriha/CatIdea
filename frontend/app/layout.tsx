// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP, Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./providers";
import PlausibleRouter from "../components/PlausibleRouter";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CatIdea",
  description: "日常の課題をアイデアの種に変える",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <Script
          src="https://plausible.io/js/plausible.js"
          data-domain="cat-idea.vercel.app"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${notoSansJP.variable} ${lato.variable} antialiased font-sans`}
      >
        <PlausibleRouter />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
