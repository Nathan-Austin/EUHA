import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

export const metadata: Metadata = {
  title: {
    default: "European Hot Sauce Awards | Europe's Premier Chili Competition",
    template: "%s | European Hot Sauce Awards",
  },
  description:
    "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
  openGraph: {
    title: "European Hot Sauce Awards | Europe's Premier Chili Competition",
    description:
      "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
    url: "https://heatawards.eu",
    siteName: "European Hot Sauce Awards",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "European Hot Sauce Awards | Europe's Premier Chili Competition",
    description:
      "The official site for the European Hot Sauce Awards. Enter your sauce, apply to be a judge, and discover the best hot sauces in Europe.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${archivoBlack.variable} antialiased bg-[#08040e] text-white`}>
        <GlobalNav />
        <main>{children}</main>
        <Footer />
        <CookieConsentBanner gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
