'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

import { ModeToggle } from '@/components/theme-toggle';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 z-10 bg-white dark:bg-black h-16 md:h-20 flex flex-row justify-between items-center px-8 md:px-12 w-full shadow-sm">
      <Link
        href="/"
        className="w-fit h-fit hover:text-foreground text-foreground font-bold text-xl flex justify-center items-center"
      >
        <img src="/assets/jobs2025_notext.svg" alt="Jobs26 Logo" className="h-12 w-16 md:h-18 md:w-20" />
      </Link>

      <header className="sticky top-0 flex h-16 items-center gap-4 text-foreground text-xl font-normal">
        {/* Desktop Navigation */}
        <nav className="hidden flex-row md:flex md:flex-row md:items-center md:gap-3 md:justify-between md:text-sm lg:text-lg lg:gap-16 xxl:text-2xl text-foreground text-xl font-light">
          <Link
            href="/generation-proud"
            className="text-muted-foreground transition-colors hover:text-foreground hover:text-red"
          >
            Generation Proud
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground transition-colors hover:text-foreground hover:text-red"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu size="34" className="md:hidden cursor-pointer text-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background backdrop-blur-md flex flex-col justify-between">
            <nav className="mt-4 grid gap-6 text-lg font-light text-foreground py-4 w-full">
              <Link
                href="/"
                className="text-mued-foreground hover:text-foreground flex flex-row gap-2 items-center relative"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">Accueil</span>
              </Link>
              <Link
                href="/generation-proud"
                className="text-muted-foreground hover:text-foreground flex flex-row gap-2 items-center relative"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">Generation Proud</span>
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground flex flex-row gap-2 items-center relative"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">Contact</span>
              </Link>
            </nav>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  router.push("/signup");
                  setIsOpen(false);
                }} 
                className="inline bg-red-700 w-full h-10 rounded hover:bg-red-500 text-sm font-medium leading-6 text-white"
              >
                S&apos;inscrire
              </Button>
              <Button 
                onClick={() => {
                  router.push("/login");
                  setIsOpen(false);
                }} 
                className="inline bg-primary w-full h-10 rounded hover:bg-primary/80 text-sm font-medium leading-6 text-primary-foreground"
              >
                Se connecter
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex md:gap-3">
        <ModeToggle />
        <Button 
          onClick={() => router.push("/signup")} 
          className="bg-red-700 md:rounded md:hover:bg-red-500 md:text-sm md:font-medium md:leading-6 text-white"
        >
          S&apos;inscrire
        </Button>
        <Button 
          onClick={() => router.push("/login")} 
          className="bg-primary md:rounded md:hover:bg-primary/80 md:text-sm md:font-medium md:leading-6 text-primary-foreground"
        >
          Se connecter
        </Button>
      </div>
    </div>
  );
}
