import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "EU Hot Sauce Awards | Europe's Premier Chili Competition",
    template: "%s | EU Hot Sauce Awards",
  },
  description:
    "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
  openGraph: {
    title: "EU Hot Sauce Awards | Europe's Premier Chili Competition",
    description:
      "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
    url: "https://heatawards.eu",
    siteName: "EU Hot Sauce Awards",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EU Hot Sauce Awards | Europe's Premier Chili Competition",
    description:
      "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
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
      <body className={`${inter.variable} antialiased bg-[#08040e] text-white`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
