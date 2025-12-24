'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FaRocket, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { ArrowRightCircle } from 'lucide-react';

interface HeroSectionProps {}

export default function HeroSection({}: HeroSectionProps) {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        style={{
          backgroundImage: `url('/assets/landing-page-Image.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="z-0 flex-none w-full h-[80vh] md:h-screen relative"
      >
        {/* Overlay for better contrast in both themes */}
        <div className="absolute inset-0" />

        <h1 className="text-white font-extrabold tracking-tight text-4xl md:text-7xl text-start absolute left-4 bottom-36 md:left-20 md:bottom-36">
          A<span className="text-black"> JOBS</span> Worth
          <br /> remembering
        </h1>

        <div
          onClick={() => navigate('/signup')}
          className="absolute bottom-6 right-4 flex gap-2 items-center justify-center hover:translate-x-1.5 transition-transform duration-300"
        >
          <span className="text-lg md:text-2xl text-white">
            <a href="/signup">S&apos;inscrire maintenant</a>
          </span>
          <ArrowRightCircle className="w-12 h-12 md:w-16 md:h-16 text-white" size={60} />
        </div>
      </div>
    </section>
  );
}
