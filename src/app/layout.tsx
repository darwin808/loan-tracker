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
    process.env.NEXT_PUBLIC_APP_URL ?? "https://fintrak.one"
  ),
  title: "FinTrack — Personal Finance Tracker",
  description:
    "Track loans, bills, income, and savings. Free personal finance tracker.",
  openGraph: {
    title: "FinTrack — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "FinTrack — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
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
