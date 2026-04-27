"use client";

import Image from "next/image";
import { FiGithub } from "react-icons/fi";

interface NavbarProps {
  onLogin: () => void;
}

export default function Navbar({ onLogin }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Image
              src="/jobpace-logo-blue.png"
              alt="JobPace Logo"
              width={160}
              height={40}
              className="h-10 w-auto transition-transform group-hover:scale-105 rounded-lg"
            />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest leading-none self-start mt-4">Beta</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
            </div>
            
            <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-8">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <button 
                onClick={onLogin}
                className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white transition-all bg-zinc-900 rounded-xl group dark:bg-zinc-100 dark:text-zinc-900 hover:scale-105 active:scale-95"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-600 rounded-full group-hover:w-56 group-hover:h-56"></span>
                <span className="relative">Login</span>
              </button>
            </div>
          </div>

          {/* Mobile Login Only */}
          <div className="md:hidden">
            <button 
              onClick={onLogin}
              className="p-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
