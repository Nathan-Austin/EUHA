import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";

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
        <div className="relative w-full h-24 sm:h-32 md:h-40 lg:h-48 bg-[#fabf14] -mb-px">
          <Image
            src="/cropped-banner-website.png"
            alt="European Hot Sauce Awards Banner"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
