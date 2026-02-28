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
  title: {
    default: "FinTrak — Personal Finance Tracker",
    template: "%s — FinTrak",
  },
  description:
    "Track loans, bills, income, and savings. Free personal finance tracker with calendar view, payment scheduling, and multi-currency support.",
  keywords: ["personal finance", "loan tracker", "bill tracker", "budget", "expense tracker", "savings tracker", "finance calendar"],
  openGraph: {
    title: "FinTrak — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
    type: "website",
    locale: "en_US",
    siteName: "FinTrak",
  },
  twitter: {
    card: "summary",
    title: "FinTrak — Personal Finance Tracker",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
  },
  verification: {
    google: "pSNBprVz0WwO9uS1kluUIewbOf99APRygCG4lvr7lUQ",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
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
