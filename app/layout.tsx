import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { FloatingOrderButton } from "@/components/layout/floating-order-button";
import { Navbar } from "@/components/layout/navbar";
import { SupportChatbot } from "@/components/layout/support-chatbot";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "NovaBite | E-commerce de restaurante",
  description:
    "Restaurante e-commerce funcional con Next.js, MongoDB, checkout real y facturación colombiana.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${heading.variable} ${body.variable} min-h-screen font-[family-name:var(--font-body)]`}
      >
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingOrderButton />
            <SupportChatbot />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
