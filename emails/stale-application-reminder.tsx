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

export interface StaleApplicationEmailProps {
  userName: string;
  companyName: string;
  position: string;
  dateApplied: Date;
  updatedAt: Date | null;
  appUrl: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const StaleApplicationReminderEmail = ({
  userName = "Job Seeker",
  companyName = "Acme Corp",
  position = "Software Engineer",
  dateApplied = new Date(),
  updatedAt = null,
  appUrl = APP_URL,
}: StaleApplicationEmailProps) => {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedDateApplied = dateFormatter.format(dateApplied);
  const formattedUpdatedAt = updatedAt
    ? dateFormatter.format(updatedAt)
    : formattedDateApplied;

  return (
    <Html>
      <Head />
      <Preview>
        Action Required: Update your application for {position} at {companyName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                    <img
                      src={`${appUrl}/jobpace-logo-blue.png`}
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
              Stale Application Alert
            </Heading>
            <Text style={paragraph}>
              Hi {userName}, it looks like your application for{" "}
              <strong>{position}</strong> at <strong>{companyName}</strong> has
              been sitting idle for 20 days.
            </Text>

            {/* Detail Box */}
            <div style={featureBox}>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <Text style={featureText}>
                  <strong>Position:</strong> {position}
                </Text>
              </div>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <Text style={featureText}>
                  <strong>Company:</strong> {companyName}
                </Text>
              </div>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <Text style={featureText}>
                  <strong>Date Applied:</strong> {formattedDateApplied}
                </Text>
              </div>
              <div style={{ ...featureItem, marginBottom: 0 }}>
                <span style={featureCheck}>✓</span>
                <Text style={featureText}>
                  <strong>Last Updated:</strong> {formattedUpdatedAt}
                </Text>
              </div>
            </div>

            {/* Notice Box */}
            <div style={noticeBox}>
              Consider following up with the recruiter, checking for updates, or
              updating the status to "Ghosted" or "Rejected" to keep your board
              clean.
            </div>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link style={button} href={`${appUrl}/dashboard`}>
                Update Application
              </Link>
            </Section>

            <Text style={paragraph}>
              Keeping your applications updated helps you maintain an accurate
              view of your job hunt progress.
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
              You received this because you have an active application that
              hasn't been updated in 20 days on JobPace.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} JobPace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default StaleApplicationReminderEmail;

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
  color: "#f59e0b",
  fontSize: "16px",
  fontWeight: 700,
  marginTop: "1px",
  flexShrink: 0,
  lineHeight: "1.4",
};

const featureText: React.CSSProperties = {
  margin: 0,
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
};

const noticeBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  color: "#b45309",
  fontSize: "13px",
  lineHeight: "1.5",
  padding: "12px 16px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#f59e0b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "12px 32px",
  textDecoration: "none",
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#f9fafb",
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
