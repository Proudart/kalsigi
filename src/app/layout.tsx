import "./globals.css";
import { Poppins } from "next/font/google";
import { lazyHydrate } from 'next-lazy-hydration-on-scroll';
import { Toaster } from "../components/ui/toaster";
import logo from "../../public/manhwacall.webp";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import Loader from "../components/load";
import type { Viewport, Metadata } from "next";
import dynamic from "next/dynamic";
import { getBaseUrl } from "../lib/utils";

const inter = Poppins({ subsets: ["latin"], weight: "400", preload: true });

const Footer = dynamic(() => import("../components/nav/footer"), { 
  ssr: true, 
  loading: () => <div /> 
});

const Cookie = lazyHydrate(() => import("../components/nav/cookies"), {
  wrapperElement: 'div'
});

const Navbar = dynamic(() => import("../components/nav/navbarWrapper"), { 
  ssr: true, 
  loading: () => <div /> 
});



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${process.env.site_name}: Your Go-To Place for Quality Manga, Manhwa and Manhua Translation`,
  manifest: "/manifest.json",
  keywords: [
    "Manga",
    "Read Manga",
    "Read Manga Online",
    "Manga Online",
    "Manga Reader",
    "Manga Scans",
    "English Manga",
    "Manga Sites",
    "Manga Website",
    "Manga Translation",
    "Manga Translated",
    "Manga Scans Online",
    "Where Can I Read Manga",
    "Read Manga",
  ],
  description: `The only manga sites you'll need are those that bring together your favourite or most popular translators into one place, that is what we do at ${process.env.site_name}.`,
  openGraph: {
    siteName: `${process.env.site_name}`,
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  alternates: {
    types: {
      "application/rss+xml": `${getBaseUrl()}/rss.xml`,
    },
  },
  applicationName: `${process.env.site_name}`,
  appleWebApp: {
    title: `${process.env.site_name}`,
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/manhwacall-144.png", sizes: "144x144", type: "image/png" },
      { url: "/manhwacall-192.png", sizes: "192x192", type: "image/png" },
      { url: "/manhwacall-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/manhwacall.webp", sizes: "192x192", type: "image/webp" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* CHANGE: Use regular style tag instead of styled-jsx */}
        <style dangerouslySetInnerHTML={{ __html: `
    #initial-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--background-100);
      z-index: 9999;
      transition: opacity 0.3s;
    }
    .spinner {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      border: 0.3rem solid var(--primary-200);
      border-top: 0.3rem solid var(--primary-600);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}} />
  <script dangerouslySetInnerHTML={{
    __html: `
      // Remove the loader when everything is fully loaded
      window.addEventListener('load', function() {
        const loader = document.getElementById('initial-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(function() {
            loader.style.display = 'none';
          }, 300);
        }
      });
    `
  }} />
      </head>
      <body className={inter.className}>
        {/* ADDED: Add the spinner element to the DOM */}
        <div id="initial-loader">
          <div className="spinner"></div>
        </div>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getThemePreference() {
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                    return localStorage.getItem('theme');
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                }
                
                const theme = getThemePreference();
                document.documentElement.classList.add(theme);
                document.documentElement.style.colorScheme = theme;
              })()
            `,
          }}
        />
          <Suspense fallback={<Loader></Loader>}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <main className="bg-background">
                <Navbar logo={logo}  />
                <div className="min-h-dvh">{children}</div>
                <Cookie wrapperProps={{ className: 'cookie-consent' }} />
                <Footer logo={logo}  />
              </main>
              <Toaster />
            </ThemeProvider>
          </Suspense>
      </body>
    </html>
  );
}