import React from "react"
import type { Metadata, Viewport } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pray.ifunlove.com";
const siteName = "為你禱告";
const siteDescription =
  "寫下你的日常心情與反思，獲得正向的重新框架與專屬的基督教禱告。在每一刻找到平安、感恩與盼望。由 iFunLove 提供。";

const ogImageUrl = `${siteUrl.replace(/\/$/, "")}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "為你禱告 - 將心情化為祝福",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "禱告",
    "基督教禱告",
    "心情記錄",
    "靈修",
    "正向思考",
    "重新框架",
    "iFunLove",
    "為你禱告",
  ],
  authors: [{ name: "iFunLove", url: "https://ifunlove.com" }],
  creator: "iFunLove",
  publisher: "iFunLove",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName,
    title: "為你禱告 - 將心情化為祝福",
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "為你禱告 - 將心情化為祝福",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "為你禱告 - 將心情化為祝福",
    description: siteDescription,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(process.env.NEXT_PUBLIC_FB_APP_ID && {
    other: { "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID },
  }),
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2d5a4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${lora.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
