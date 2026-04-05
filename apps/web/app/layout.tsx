import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./styles/design-tokens.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WildCard",
  description:
    "A global, gamified prediction market for trading opinions with virtual tokens.",
  icons: {
    icon: [{ url: "/wildcard-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
