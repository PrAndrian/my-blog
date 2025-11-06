import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { MainNav } from "@/components/navigation/MainNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Blog - AI Tech Digest",
  description: "A blog featuring productivity tips and AI-curated tech digests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="app-theme"
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              <MainNav />
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
