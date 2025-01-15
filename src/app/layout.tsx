import "./globals.css";
import { Poppins } from "next/font/google";
import dynamic from "next/dynamic";
import { Toaster } from "../components/ui/toaster";
import logo from "../../public/kalsigi.webp";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import Loader from "../components/load";
import type { Viewport, Metadata } from "next";

const inter = Poppins({ subsets: ["latin"], weight: "400" });

const Footer = dynamic(() => import("../components/nav/footer"), { ssr: true });
const Cookie = dynamic(() => import("../components/nav/cookies"), {
  ssr: true,
});
const Navbar = dynamic(() => import("../components/nav/navbar"), { ssr: true });
const DynamicAds = dynamic(() => import("../components/dynamicAds"), {
  ssr: true,
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://www.${process.env.site_name}.com`),
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
    "Read Manga Free",
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
      "application/rss+xml": `https://www.${process.env.site_name}.com/rss.xml`,
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
      { url: "/kalsigi-144.png", sizes: "144x144", type: "image/png" },
      { url: "/kalsigi-192.png", sizes: "192x192", type: "image/png" },
      { url: "/kalsigi-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/kalsigi.webp", sizes: "192x192", type: "image/webp" }],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PlausibleProvider domain={process.env.PLAUSIBLE as string}>
        <body className={inter.className}>
          <Suspense fallback={<Loader></Loader>}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <main className="bg-background-100 dark:bg-background-100">
                <DynamicAds
                  options={{
                    key: "banner",
                    admpid: "257593",
                  }}
                />
                <Navbar logo={logo}></Navbar>
                <div className="min-h-dvh">{children}</div>
                <Cookie />
                <Footer logo={logo}></Footer>
              </main>
              <Toaster />
            </ThemeProvider>
          </Suspense>
        </body>
      </PlausibleProvider>
    </html>
  );
}
