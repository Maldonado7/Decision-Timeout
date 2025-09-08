import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { isClerkEnabled } from '@/lib/clerk'
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decision Timeout - Stop Overthinking & Decide Fast",
  description: "Free decision timer tool to beat analysis paralysis. Set a timer, weigh options, decide fast. Combat overthinking with our psychological decision-making framework.",
  keywords: "decision making, analysis paralysis, overthinking, productivity, timer, psychology, choices, decision tool",
  authors: [{ name: "Decision Timeout Team" }],
  creator: "Decision Timeout",
  publisher: "Decision Timeout",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://decision-timeout.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Decision Timeout - Stop Overthinking & Decide Fast",
    description: "Free decision timer tool to beat analysis paralysis. Make better decisions faster with our psychological framework.",
    url: 'https://decision-timeout.com',
    siteName: 'Decision Timeout',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Decision Timeout - Stop Overthinking',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Decision Timeout - Stop Overthinking & Decide Fast",
    description: "Free decision timer tool to beat analysis paralysis. Make better decisions faster.",
    images: ['/og-image.png'],
    creator: '@decisiontimeout',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Decision Timeout',
  },
  applicationName: 'Decision Timeout',
  referrer: 'origin-when-cross-origin',
  category: 'productivity',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkEnabled = isClerkEnabled()

  const content = (
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#4f46e5" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Decision Timeout" />
          <meta name="apple-touch-fullscreen" content="yes" />
          
          {/* PWA Install Prompt */}
          <meta name="application-name" content="Decision Timeout" />
          <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
          <meta name="msapplication-TileColor" content="#4f46e5" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* Preload critical resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          
          {/* Service Worker handled by next-pwa */}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
  )

  return clerkEnabled ? (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  ) : content;
}