import React from "react"
import Link from "next/link"
import Image from "next/image"
import type { StaticImageData } from "next/image"
import { ThemeToggle } from "../ui/themeToggle"
import Auth from "../auth/auth"
import LiveSearch from "./liveSearch"
import dynamic from "next/dynamic"

const NavbarClient = dynamic(() => import("./navbarClient"), { ssr: true })

const navigation = [
  { name: "Home", href: "/" },
  { name: "Series", href: "/series" },
  { name: "Bookmarks", href: "/bookmarks" },
  { name: "Groups", href: "/groups" },
]

type Props = {
  logo: StaticImageData
}
export default function Navbar({ logo }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        {/* Main navbar row */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo section */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo || "/placeholder.svg"}
                alt={'manhwacall logo'}
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <h1 className="text-xl font-bold hidden lg:block whitespace-nowrap">{process.env.site_name as string}</h1>
            </Link>
          </div>

          {/* Desktop navigation - centered */}
          <nav className="hidden md:flex items-center justify-center">
            <ul className="flex space-x-6">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:underline text-sm whitespace-nowrap">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search bar - fills remaining space on mobile, fixed width on desktop */}
          <div className="flex-1 min-w-0 sm:flex-initial sm:w-64 lg:w-80">
            <LiveSearch />
          </div>

          {/* Right section with actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth */}
            <Auth />

            {/* Mobile menu button */}
            <NavbarClient />
          </div>
        </div>
      </div>
    </header>
  )
}

