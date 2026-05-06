import {
  Body,
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

interface WelcomeEmailProps {
  name: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to JobPace - let's get you hired!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                    <img
                      src={`${APP_URL}/jobpace-logo-blue.png`}
                      alt="JobPace"
                      width={33}
                      height={33}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        display: "block",
                      }}
                    />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      JobPace
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              Welcome, {name}!
            </Heading>
            <Text style={paragraph}>
              We're glad you're here. JobPace was built to take the chaos out of
              your job search - one application at a time.
            </Text>

            {/* Features */}
            <div style={featureBox}>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <div>
                  <Text style={featureHeading}>Add your first application</Text>
                  <Text style={featureDescription}>
                    Track where you've applied and keep all the details in one
                    place.
                  </Text>
                </div>
              </div>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <div>
                  <Text style={featureHeading}>Move through stages</Text>
                  <Text style={featureDescription}>
                    Drag and drop applications across your Kanban board as you
                    progress.
                  </Text>
                </div>
              </div>
              <div style={{ ...featureItem, marginBottom: 0 }}>
                <span style={featureCheck}>✓</span>
                <div>
                  <Text style={featureHeading}>Analyze your progress</Text>
                  <Text style={featureDescription}>
                    See your response rates and identify where you can improve.
                  </Text>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link style={button} href={`${APP_URL}/dashboard`}>
                Go to Dashboard
              </Link>
            </Section>

            <Text style={paragraph}>
              If you have any questions, just reply to this email. I'm happy to
              help.
            </Text>
            <Text style={paragraph}>
              Best,
              <br />
              John Adrian Bonto
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You received this email because you recently created a JobPace
              account.
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

export default WelcomeEmail;

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

const featureBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "24px",
};

const featureItem: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "16px",
};

const featureCheck: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "16px",
  fontWeight: 700,
  marginTop: "1px",
  flexShrink: 0,
  lineHeight: "1.4",
};

const featureHeading: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
  margin: "0 0 2px",
};

const featureDescription: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: 0,
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
