import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  verificationUrl: string;
}

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to get started with JobPace</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
           <Section style={headerSection}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="https://jobpace-nu.vercel.app/jobpace-logo-blue.png"
                alt="JobPace"
                width={33}
                height={33}
                style={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
                JobPace
              </span>
            </div>
          </Section>
          {/* Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              Verify your email address
            </Heading>
            <Text style={paragraph}>
              Thanks for signing up for JobPace! Please click the button below
              to verify your email address and activate your account.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            {/* Expiry Notice */}
            <Text style={expiryText}>
              This link will expire in <strong>30 minutes</strong>.
            </Text>

            {/* Fallback URL */}
            <Text style={fallbackText}>
              If the button above doesn&apos;t work, copy and paste this URL
              into your browser:
            </Text>
            <Link href={verificationUrl} style={linkText}>
              {verificationUrl}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              If you didn&apos;t create a JobPace account, you can safely ignore
              this email.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} JobPace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationEmail;

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "480px",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#2563eb",
  padding: "24px 32px",
};

const logo: React.CSSProperties = {
  margin: 0,
};

const contentSection: React.CSSProperties = {
  padding: "32px 32px 24px",
};

const heading: React.CSSProperties = {
  color: "#111827",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "12px 32px",
  textDecoration: "none",
};

const expiryText: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  color: "#1e40af",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 24px",
  padding: "12px 16px",
  textAlign: "center" as const,
};

const fallbackText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const linkText: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "13px",
  lineHeight: "1.5",
  wordBreak: "break-all" as const,
};

const footerSection: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  padding: "24px 32px",
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footerCopyright: React.CSSProperties = {
  color: "#d1d5db",
  fontSize: "12px",
  margin: 0,
  textAlign: "center" as const,
};
