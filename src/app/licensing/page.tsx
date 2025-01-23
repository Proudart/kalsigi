'use client';

import { useState, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface ProtectedContentProps {
  isVisible: boolean;
}

const ProtectedContent = ({ isVisible }: ProtectedContentProps) => {
  if (!isVisible) return null;

  return (
    <div className="protected-content space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-text-900">DMCA Takedown Procedure</h2>
      
      <div className="space-y-4 bg-background-100 p-6 rounded-lg shadow-md">
        <p>
          If you believe that your copyrighted work has been copied in a way
          that constitutes copyright infringement and is accessible on this
          site, you may notify our copyright agent, as set forth in the
          Digital Millennium Copyright Act of 1998 (DMCA).
        </p>
        <h3 className="font-semibold text-lg">Required Information for DMCA Notices:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            A physical or electronic signature of a person authorized to act
            on behalf of the copyright owner
          </li>
          <li>
            Identification of the copyrighted work claimed to have been infringed
          </li>
          <li>
            Identification of the material that is claimed to be infringing
          </li>
          <li>
            Contact information for the complaining party, including address,
            telephone number, and email
          </li>
          <li>
            A statement that the complaining party in good faith believes that
            use of the material is not authorized by the copyright owner, its
            agent, or law
          </li>
          <li>
            A statement that the information in the notification is accurate
            and, under penalty of perjury, the complaining party is authorized
            to act on behalf of the owner
          </li>
        </ul>

        <div className="bg-primary-100 p-4 rounded-lg mt-4">
          <h3 className="font-semibold mb-2">Contact Information for DMCA Notices:</h3>
          <p>Email: dmca@skaihua.com</p>
          <p className="text-sm text-text-600 mt-2">
            Please allow 2-3 business days for a response
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Licensing() {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTurnstileSuccess = useCallback((token: string) => {
    setIsVerified(true);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setError("Verification failed. Please try again.");
    setIsVerified(false);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setError("Verification expired. Please verify again.");
    setIsVerified(false);
  }, []);

  return (
    <div className="min-h-screen mx-auto container min-w-full">
      <div className="flex flex-col items-center justify-center h-auto p-10 m-10 rounded-xl min-h-60 bg-silver">
        <h1 className="text-2xl font-bold text-center text-textmain mb-8">
          DMCA NOTICE
        </h1>
        
        <div className="flex flex-col text-textmain space-y-6 max-w-3xl mx-auto">
          {/* Public Content */}
          <div className="space-y-4">
            <p>
              {process.env.site_name} respects the intellectual property of others. 
              {process.env.site_name} takes matters of Intellectual property very seriously
              and is committed to meeting the needs of content owners while
              helping them manage the publication of their content online.
            </p>
            
            <p>
              The books files, which are under copyright protection, are NOT
              PUBLISHED on the website. We are not supporting digital piracy.
              Our task is to make the users familiar with the world literature
              novelties and to retain copyright.
            </p>
          </div>

          {/* Verification Section */}
          {!isVerified && (
            <div className="flex flex-col items-center space-y-4 p-6 bg-background-50 rounded-lg">
              <p className="text-center text-text-700">
                Please verify that you are human to view the DMCA takedown procedure
              </p>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
                className="mx-auto"
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          )}

          {/* Protected Content */}
          <ProtectedContent isVisible={isVerified} />
        </div>
      </div>
    </div>
  );
}