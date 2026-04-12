import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <Toaster 
          position="bottom-right" 
          richColors 
          toastOptions={{
            style: {
              background: "#172B4D",
              color: "#FFFFFF",
              border: "1px solid #DFE1E6",
            }
          }} 
        />
      </body>
    </html>
  );
}
