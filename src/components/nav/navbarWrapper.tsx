"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import Navbar from "./navbar"
import { StaticImageData } from "next/image"  


const Up = dynamic(() => import("./up"), { ssr: true })
const Bug = dynamic(() => import("./bug"), { ssr: true })

type Props = {
  logo: StaticImageData
}

export default function NavbarWrapper({ logo }: Props) {
  const pathname = usePathname()

  return (
    <>
      <Navbar logo={logo} />
      <Bug />
      <Up />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('nav a').forEach(link => {
              if (link.getAttribute('href') === '${pathname}') {
                link.classList.add('text-primary-600');
              }
            });
          `,
        }}
      />
    </>
  )
}

