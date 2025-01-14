import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from "next/image";

type Props = {
  logo: StaticImageData;
};

export default function footer({ logo }: Props) {
  return (
    <footer className=" border-b ">
        <hr className="my-6 dark:border-gray-200 border-gray-700 sm:mx-auto lg:my-8" />

        <div className="items-center content-center justify-center text-center align-middle mx-xl place-items-center sm:flex sm:items-center sm:justify-between container">
          <Link
            href="/"
            className="flex items-center justify-center mb-4 text-center align-middle place-items-center sm:mb-0"
          >
            <div className="w-10">
              <Image src={logo} alt={process.env.site_name as string} width={50} height={50} />
            </div>
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-text-950 ">
               {process.env.site_name} 
            </span>
          </Link>

          <ul className="flex flex-wrap items-center justify-center mb-6 text-sm text-center align-middle text-text-950 place-items-center sm:mb-0">
            <li>
              <Link href="/about" className="mr-4 hover:underline md:mr-6 ">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="mr-4 hover:underline md:mr-6 ">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/licensing" className="mr-4 hover:underline md:mr-6 ">
                Licensing
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        <span className="block text-sm text-center align-middle text-text-950 place-items-center sm:text-center">
          © 2024{" "}
          <Link href="/" className="hover:underline">
            {process.env.site_name}™
          </Link> 
          . All Rights Reserved.
        </span>
    </footer>
  );
}
