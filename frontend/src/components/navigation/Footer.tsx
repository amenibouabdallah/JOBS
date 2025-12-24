'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon
} from 'lucide-react';

const Footer = () => {
  return (
  <footer className="bg-black border-t border-border text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/assets/jobs2025_notext.svg" alt="JOBS" width={160} height={160} />
              <div>
                <h3 className="font-bold">JOBS 2K26</h3>
                <p className="text-muted-foreground">Junior Official Business Seminar</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Confédération Tunisienne des Junior Entreprises
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/showcase/jetevents/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkedinIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://www.facebook.com/JuniorEntreprisesTunisia" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/jetevents/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <InstagramIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-bold mb-4">Pages</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/generation-proud" className="text-muted-foreground hover:text-foreground transition-colors">
                  Generation Proud
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contactez Nous</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a 
                  href="mailto:jobs@jetunisie.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  jobs@jetunisie.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <PhoneIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-muted-foreground">
                  <a href="tel:+21656206552" className="block hover:text-foreground transition-colors">
                    +216 95 395 172
                  </a>
                  <a href="tel:+21694830642" className="block hover:text-foreground transition-colors">
                    +216 94 830 642
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

  <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © JOBS. 2026 All Rights Reserved. Confédération Tunisienne des Junior Entreprises
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
