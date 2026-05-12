"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Mail, Globe } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const socials = [
  {
    href: "https://github.com/Adrian9502",
    icon: <GitHubIcon />,
    label: "GitHub",
    hover: "hover:text-zinc-900 dark:hover:text-white",
  },
  {
    href: "https://www.linkedin.com/in/john-adrian-bonto-a65704283/",
    icon: <LinkedInIcon />,
    label: "LinkedIn",
    hover: "hover:text-blue-600 dark:hover:text-blue-400",
  },
  {
    href: "mailto:bontojohnadrian@gmail.com",
    icon: <Mail className="w-4 h-4" />,
    label: "Email",
    hover: "hover:text-red-500",
  },
  {
    href: "https://johnadrianbonto.is-a.dev/",
    icon: <Globe className="w-4 h-4" />,
    label: "Portfolio",
    hover: "hover:text-purple-500",
  },
];

export default function DeveloperModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="relative flex items-center justify-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            About the Developer
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Developer Profile */}
          <div className="flex flex-col items-center text-center">
            <div className="w-30 h-30 relative rounded-full overflow-hidden mb-3 border-2 border-zinc-100 dark:border-zinc-800 shadow-sm">
              <Image
                src="/photo.jpg"
                alt="John Adrian Bonto"
                fill
                className="object-cover"
                sizes="100px"
              />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              John Adrian Bonto
            </h4>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
              Aspiring Software Engineer
            </p>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                title={s.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${s.hover}`}
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>

          {/* System Purpose */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 text-center">
            <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              The Story Behind JobPace
            </h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              In April 2026, I was feeling the pressure of finally entering the
              real world and job hunting made it worse. You apply to a dozen
              places, lose track of who you've followed up with, and suddenly
              you don't even remember where you stand with half of them. That
              overwhelm is exactly why I built JobPace, to keep everything in
              one place so the search feels less chaotic and more in control.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
