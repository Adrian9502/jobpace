"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError, className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type={show ? "text" : "password"}
          className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
            hasError
              ? "border-red-400 dark:border-red-600"
              : "border-gray-200 dark:border-zinc-700"
          } ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;