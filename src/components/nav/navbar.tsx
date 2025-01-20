import React from "react"
import Link from "next/link"
import Image from "next/image"
import type { StaticImageData } from "next/image"
import { ThemeToggle } from "../ui/themeToggle"
import Auth from "../auth/auth"
import LiveSearch from "./liveSearch"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Series", href: "/series" },
  { name: "Bookmarks", href: "/bookmarks" },
]

type Props = {
  logo: StaticImageData
}

export default function Navbar({ logo }: Props) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center sm:flex-1">
          <Link href="/" className="flex items-center">
            <Image
              src={logo || "/placeholder.svg"}
              alt={process.env.site_name as string}
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-xl font-bold hidden sm:block">{process.env.site_name as string}</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1">
          <ul className="flex space-x-6">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:underline text-sm">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-2 flex-1 justify-end">
          <div className="flex-1 max-w-xs">
            <LiveSearch />
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <Auth />
        </div>
      </div>
    </header>
  )
}

