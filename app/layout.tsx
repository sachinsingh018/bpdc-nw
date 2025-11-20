import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuraProvider } from '@/components/aura/useAuraContext';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bits-pilani-dubai.edu/'),
  title: 'BITS Pilani Dubai Campus: Your AI Assistant to Networking',
  description: 'Bringing Global Network to your Keyboard',
  openGraph: {
    title: 'BITS Pilani Dubai Campus: Your AI Assistant to Networking',
    description: 'Bringing Global Network to your Keyboard',
    url: 'https://www.bits-pilani-dubai.edu/',
    siteName: 'BITS Pilani Dubai Campus',
    images: [
      {
        url: 'https://www.bits-pilani-dubai.edu/imagetemplate.png',
        width: 1200,
        height: 630,
        alt: 'BITS Pilani Dubai Campus Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BITS Pilani Dubai Campus: Your AI Assistant to Networking',
    description: 'Bringing Global Network to your Keyboard',
    images: ['https://www.bits-pilani-dubai.edu/img.jpg'],
  },
};


export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(0 0% 5%)';
const THEME_COLOR_SCRIPT = `\
  (function() {
    var html = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    function updateThemeColor() {
      var isDark = html.classList.contains('dark');
      meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
    }
    var observer = new MutationObserver(updateThemeColor);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    updateThemeColor();
  })();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        {/* ✅ Force OG metadata for scrapers */}
        <meta property="og:title" content="BITS Pilani Dubai Campus: Your AI Assistant to Networking" />
        <meta property="og:description" content="Bringing Global Network to your Keyboard" />
        <meta property="og:image" content="https://www.bits-pilani-dubai.edu/img.jpg" />
        <meta property="og:url" content="https://www.bits-pilani-dubai.edu" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BITS Pilani Dubai Campus: Your AI Assistant to Networking" />
        <meta name="twitter:description" content="Bringing Global Network to your Keyboard" />
        <meta name="twitter:image" content="https://www.bits-pilani-dubai.edu/img.jpg" />
        <meta name="google" content="notranslate" />
        {/* Google Analytics Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S2ZXYKNEC9"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-S2ZXYKNEC9');
            `,
          }}
        />
        {/* Pixel font for Job Board title */}
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <AuraProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster position="top-center" />
              {children}
            </ThemeProvider>
          </AuraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
