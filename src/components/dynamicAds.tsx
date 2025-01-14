"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AdOptions {
  key: string;
  admpid: string;
}

interface AdManagerProps {
  options: AdOptions;
}

export default function AdManager({ options }: AdManagerProps) {
  useEffect(() => {
    // Cleanup function to remove any ad-related elements when component unmounts
    return () => {
      // Add any necessary cleanup code here
      const scripts = document.querySelectorAll('script[src*="wpadmngr.com"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <>
      <Script
        id="ad-manager-script"
        src="https://js.wpadmngr.com/static/adManager.js"
        strategy="afterInteractive"
        data-admpid={options.admpid}
        onError={(e) => {
          console.error('Ad Manager script failed to load:', e);
        }}
        onLoad={() => {
        }}
      />
    </>
  );
}
