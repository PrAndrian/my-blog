import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { getDefaultMetadata } from "@/lib/metadata";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = getDefaultMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="app-theme"
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              <ErrorBoundary>
                <main id="main-content">{children}</main>
                <Toaster />
              </ErrorBoundary>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
