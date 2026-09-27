import type { Metadata } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Answers from your documents",
    template: "%s",
  },
  description: "Ask questions and get answers cited from your team's own documents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hanken.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
