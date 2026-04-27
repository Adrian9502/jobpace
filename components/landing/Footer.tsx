"use client";

import Image from "next/image";

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export default function Footer({ onOpenTerms, onOpenPrivacy }: FooterProps) {
  return (
    <footer className="py-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/jobpace-logo-final.png"
                alt="JobPace Logo"
                width={28}
                height={28}
                className="dark:brightness-0 dark:invert opacity-80"
              />
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-500">
                JobPace
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium max-w-xs leading-relaxed">
              Empowering fresh graduates to land their dream roles with confidence and organization.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-zinc-500">
            <button onClick={onOpenTerms} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</button>
            <button onClick={onOpenPrivacy} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Github</a>
          </div>

          <p className="text-sm text-zinc-400 font-medium">© 2026 JobPace. Built with ❤️ in PH.</p>
        </div>
      </div>
    </footer>
  );
}
