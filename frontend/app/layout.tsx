import { Providers } from "@/providers/Providers";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/components/layout/PageLayout";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import BottomTabs from "@/components/layout/BottomTabs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Social Media DApp",
  description: "Decentralized Social Media Platform built on Internet Computer",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <Providers>
              <AppSidebar />
              <PageLayout>
                <SidebarTrigger />
                {children}
                <Toaster />
              </PageLayout>
              <BottomTabs />
            </Providers>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
