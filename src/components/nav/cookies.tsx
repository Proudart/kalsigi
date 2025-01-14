"use client";

import React from "react";
import { getCookie, hasCookie, setCookie } from "cookies-next";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const CookieConsent = React.memo(() => {
  const [showConsent, setShowConsent] = React.useState(true);

  const generateKadkomiToken = () => {
    const existingKkt = getCookie("kkt");
    if (!existingKkt) {
      const newKkt = uuidv4();
      setCookie("kkt", newKkt, { maxAge: 365 * 24 * 60 * 60 });
    }
  };
  React.useEffect(() => {
    const checkConsent = async () => {
      const consent = await hasCookie("localConsent");
      setShowConsent(consent);
    };
    checkConsent();
    generateKadkomiToken();
  }, []);

  const acceptCookie = () => {
    setShowConsent(true);
    setCookie("localConsent", "true", { maxAge: 365 * 24 * 60 * 60 });
  };

  const rejectCookie = () => {
    setShowConsent(true);
    setCookie("localConsent", "false", { maxAge: 365 * 24 * 60 * 60 });
  };

  if (showConsent) {
    return null;
  }

  return (
    <div className="fixed  bg-opacity-70 z-50">
      <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center justify-between px-4 py-8 bg-primary-400 space-y-4">
        <span className="text-dark text-base text-center">
          This website uses cookies to improve user experience. By using our
          website you consent to all cookies in accordance with our Cookie
          Policy.
          <Link
            className="text-blue-500"
            href="https://www.cookiepolicygenerator.com/live.php?token=0u740S0Og1qR8oiFMMHCJtPnHFHLlGyR"
            
          >
            {" "}
            Learn more
          </Link>
        </span>
        <div className="flex space-x-4">
          <button
            className="bg-green-500 py-2 px-8 rounded text-white"
            onClick={acceptCookie}
          >
            Accept
          </button>
          <button
            className="bg-red-500 py-2 px-8 rounded text-white"
            onClick={rejectCookie}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
});

CookieConsent.displayName = "CookieConsent";

export default CookieConsent;
