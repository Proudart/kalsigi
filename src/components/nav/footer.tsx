import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from "next/image";

type Props = {
  logo: StaticImageData;
};

const footerLinks = [
  { name: "About", href: "/about" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Licensing", href: "/licensing" },
];

export default function Footer({ logo }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-b" role="contentinfo" aria-label="Site footer">
      <hr className="my-6 dark:border-gray-200 border-gray-700 sm:mx-auto lg:my-8" />

      <div className="container items-center content-center justify-center text-center align-middle mx-xl place-items-center sm:flex sm:items-center sm:justify-between">
        <Link
          href="/"
          className="flex items-center justify-center mb-4 text-center align-middle place-items-center sm:mb-0"
          aria-label={`${process.env.site_name} home`}
        >
          <div className="w-10">
            <Image
              src={logo}
              alt={`${process.env.site_name} logo`}
              width={50}
              height={50}
              priority={true}
            />      
          </div>
        </Link>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center mb-6 text-sm text-center align-middle text-text-950 place-items-center sm:mb-0">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="mr-4 hover:underline md:mr-6"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />

      <div className="block text-sm text-center align-middle text-text-950 place-items-center sm:text-center">
        <span>© {currentYear} </span>
        <Link
          href="/"
          className="hover:underline"
          aria-label={`${process.env.site_name} home`}
        >
          {process.env.site_name}™
        </Link>
        <span>. All Rights Reserved.</span>
      </div>
    </footer>
  );
}
