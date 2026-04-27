"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import About from "./About";
import CTA from "./CTA";
import Footer from "./Footer";
import PolicyModal from "../PolicyModal";

export default function LandingContent() {
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const handleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const closeModal = () => setModalType(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#171717] dark:text-[#ededed] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <Navbar onLogin={handleLogin} />
      
      <main className="pt-24 sm:pt-32">
        <Hero onLogin={handleLogin} />
        <Features />
        <About />
        <CTA 
          onLogin={handleLogin} 
          onOpenTerms={() => setModalType("terms")} 
          onOpenPrivacy={() => setModalType("privacy")} 
        />
      </main>

      <Footer 
        onOpenTerms={() => setModalType("terms")} 
        onOpenPrivacy={() => setModalType("privacy")} 
      />

      {/* Modals */}
      <PolicyModal
        isOpen={modalType === "terms"}
        onClose={closeModal}
        title="Terms of Service"
        content={
          <div className="space-y-4">
            <h3>1. Introduction</h3>
            <p>Welcome to JobPace. By using our service, you agree to these terms. Please read them carefully.</p>
            <h3>2. Using our Services</h3>
            <p>You must follow any policies made available to you within the Services. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.</p>
            <h3>3. Your JobPace Account</h3>
            <p>You need a Google Account to use JobPace. To protect your account, keep your password confidential. You are responsible for the activity that happens on or through your account.</p>
            <h3>4. Privacy and Copyright Protection</h3>
            <p>JobPace’s privacy policies explain how we treat your personal data and protect your privacy when you use our Services. By using our Services, you agree that JobPace can use such data in accordance with our privacy policies.</p>
          </div>
        }
      />
      <PolicyModal
        isOpen={modalType === "privacy"}
        onClose={closeModal}
        title="Privacy Policy"
        content={
          <div className="space-y-4">
            <h3>1. Information We Collect</h3>
            <p>We collect information to provide better services to all our users. We collect information in the following ways:</p>
            <ul>
              <li><strong>Information you give us:</strong> We use your Google account information (name, email, profile picture) to personalize your experience.</li>
              <li><strong>Information we get from your use of our services:</strong> We collect information about the job applications you track (company names, positions, statuses).</li>
            </ul>
            <h3>2. How We Use Information</h3>
            <p>We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect JobPace and our users.</p>
            <h3>3. Information Security</h3>
            <p>We work hard to protect JobPace and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold.</p>
          </div>
        }
      />
    </div>
  );
}
