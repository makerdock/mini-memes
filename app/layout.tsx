import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import { Comic_Neue } from "next/font/google";
import FrameAutomationProviders from '../components/frame-automation-providers';
import { ThemeProvider } from '../components/theme-provider';
import { Toaster } from '../components/ui/toaster';
import { cn } from '../lib/utils';
import '../styles/globals.css';
import '../styles/theme.css';
import { Providers } from './providers';

const comic = Comic_Neue({ subsets: ["latin"], weight: "400" });


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "mini memes",
    description:
      "Generated by `create-onchain --mini`, a Next.js template for MiniKit",
    other: {
      "fc:frame": JSON.stringify({
        version: process.env.NEXT_PUBLIC_VERSION,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `make banger memes`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
            splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <body className={cn(comic.className, 'bg-background')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>
            <FrameAutomationProviders>
              {children}
              <Toaster />
            </FrameAutomationProviders>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
