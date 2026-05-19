import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Lato,
  Merriweather,
  Open_Sans,
  Playfair_Display,
  Roboto,
} from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Upgrader",
  description:
    "Upgrade resume content and design with streaming AI and templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        roboto.variable,
        lato.variable,
        openSans.variable,
        merriweather.variable,
        playfair.variable,
      )}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
