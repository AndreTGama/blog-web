import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import QueryProvider from "@/components/providers/query-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog de tecnologia | Artigos e padrões de projeto",
  description:
    "Artigos de tecnologia, arquitetura e padrões de projeto com exemplos práticos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <QueryProvider>{children}</QueryProvider>
        <Footer />
      </body>
    </html>
  );
}
