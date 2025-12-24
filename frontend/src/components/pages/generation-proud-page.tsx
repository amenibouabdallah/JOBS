'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GenerationProudPageProps {}

export default function GenerationProudPage({}: GenerationProudPageProps) {

  return (
    <div className="min-h-screen mt-12 bg-background text-foreground">
      {/* Generation Proud Image Section */}
      <section className="relative h-[80vh] md:h-screen flex items-center justify-center">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/generation-proud.jpeg')` }}
        >
          <div className="absolute inset-0 bg-black/40 md:bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                United We'll leave the dream
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
                <span className='text-red-700 text-3xl font-bold'>JOBS 2K26 </span>- The future Starts now
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
