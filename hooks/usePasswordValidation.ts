import { useState } from "react";

export interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  allMet: boolean;
}

export function usePasswordValidation() {
  const [password, setPassword] = useState("");

  const validation: PasswordValidation = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    get allMet() {
      return this.length && this.uppercase && this.lowercase && this.number;
    },
  };

  return { password, setPassword, validation };
}