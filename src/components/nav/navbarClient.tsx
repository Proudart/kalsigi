"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import LiveSearch from "./liveSearch";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "Series", href: "/series", current: false },
  { name: "Bookmarks", href: "/bookmarks", current: false },
  { name: "Groups", href: "/groups", current: false },
];

export default function NavbarClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background-100">
        <nav className="flex flex-col space-y-4 mt-6">
          <div className="mb-4">
            <LiveSearch />
          </div>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-lg font-medium hover:underline"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}