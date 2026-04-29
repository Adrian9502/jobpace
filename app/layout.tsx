import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { IBM_Plex_Sans } from "next/font/google";
import Providers from "@/components/providers";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Job Pace - Your job search, at your pace.",
  description:
    "Job Pace is a job hunting tracker built for fresh graduates who want to stay organized and stress-free during their job search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSans.className} min-h-full flex flex-col font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
