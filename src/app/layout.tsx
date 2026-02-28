import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://pesotrack.vercel.app"
  ),
  title: "PesoTrack — Personal Finance Tracker",
  description:
    "Track loans, bills, income, and savings. Free personal finance app for Filipinos.",
  openGraph: {
    title: "PesoTrack — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance app for Filipinos.",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary",
    title: "PesoTrack — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance app for Filipinos.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gb-bg1 text-gb-fg1`}
      >
        {children}
      </body>
    </html>
  );
}
