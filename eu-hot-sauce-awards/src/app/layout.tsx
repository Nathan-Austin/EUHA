import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "EU Hot Sauce Awards 2026 | Heat Awards",
    template: "%s | EU Hot Sauce Awards 2026",
  },
  description:
    "Welcome to the 2026 EU Hot Sauce Awards judging portal. Discover the continent's boldest craft sauces and join the official Heat Awards tasting panel.",
  openGraph: {
    title: "EU Hot Sauce Awards 2026 | Heat Awards",
    description:
      "Europe's definitive hot sauce competition, curated by the Heat Awards. Explore the categories, meet the judges, and savour the heat.",
    url: "https://heatawards.eu",
    siteName: "EU Hot Sauce Awards",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EU Hot Sauce Awards 2026 | Heat Awards",
    description:
      "Welcome to the official judging portal for the 2026 EU Hot Sauce Awards.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
