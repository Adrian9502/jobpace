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

export interface InterviewReminderEmailProps {
  userName: string;
  companyName: string;
  position: string;
  interviewDate: Date;
  location?: string;
  workSetup?: string;
  contactName?: string;
  appUrl: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const InterviewReminderEmail = ({
  userName = "Job Seeker",
  companyName = "Acme Corp",
  position = "Software Engineer",
  interviewDate = new Date(),
  location,
  workSetup,
  contactName,
  appUrl = APP_URL,
}: InterviewReminderEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(interviewDate);

  return (
    <Html>
      <Head />
      <Preview>
        Your interview is today — {position} at {companyName}
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
              Interview day, {userName}!
            </Heading>
            <Text style={paragraph}>
              Today is the day! We wanted to send a quick reminder about your
              upcoming interview for the <strong>{position}</strong> role at{" "}
              <strong>{companyName}</strong>.
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
                  <strong>Date &amp; Time:</strong> {formattedDate}
                </Text>
              </div>
              <div style={featureItem}>
                <span style={featureCheck}>✓</span>
                <Text style={featureText}>
                  <strong>Location:</strong> {location || "Not specified"}
                </Text>
              </div>
              {workSetup && (
                <div style={featureItem}>
                  <span style={featureCheck}>✓</span>
                  <Text style={featureText}>
                    <strong>Work Setup:</strong> {workSetup}
                  </Text>
                </div>
              )}
              {contactName && (
                <div style={{ ...featureItem, marginBottom: 0 }}>
                  <span style={featureCheck}>✓</span>
                  <Text style={featureText}>
                    <strong>Recruiter:</strong> {contactName}
                  </Text>
                </div>
              )}
            </div>

            {/* Notice Box */}
            <div style={noticeBox}>
              Good luck today! Take a deep breath — you've prepared for this.
            </div>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link style={button} href={`${appUrl}/dashboard`}>
                View Application
              </Link>
            </Section>

            <Text style={paragraph}>
              If you need to reschedule or have any questions, check your
              application details on JobPace.
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
              You received this because you have an interview scheduled today in
              JobPace.
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

export default InterviewReminderEmail;

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

const featureText: React.CSSProperties = {
  margin: 0,
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
};

const noticeBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  color: "#1e40af",
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
