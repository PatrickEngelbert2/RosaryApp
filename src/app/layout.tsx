import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { StorageRecoveryNotice } from "@/components/site/StorageRecoveryNotice";

const description =
  "Walk the Rosary helps individuals and groups pray the Rosary, lead rosary walks, customize prayer guides, and print simple guide cards.";

export const metadata: Metadata = {
  applicationName: "Walk the Rosary",
  title: {
    default: "Walk the Rosary",
    template: "%s | Walk the Rosary",
  },
  description,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Walk the Rosary",
    description,
    siteName: "Walk the Rosary",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Walk the Rosary",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50 text-ink-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <StorageRecoveryNotice />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
