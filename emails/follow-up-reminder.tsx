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

export interface FollowUpReminderEmailProps {
  userName: string;
  companyName: string;
  position: string;
  followUpDate: Date;
  contactName?: string;
  contactEmail?: string;
  appUrl: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const FollowUpReminderEmail = ({
  userName = "Job Seeker",
  companyName = "Acme Corp",
  position = "Software Engineer",
  followUpDate = new Date(),
  contactName,
  contactEmail,
  appUrl = APP_URL,
}: FollowUpReminderEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(followUpDate);

  const recruiterFirstName = contactName ? contactName.split(" ")[0] : "Recruiter";

  return (
    <Html>
      <Head />
      <Preview>
        Time to follow up — {position} at {companyName}
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
              Follow-up reminder, {userName}!
            </Heading>
            <Text style={paragraph}>
              This is a friendly reminder that today is the day you scheduled to
              follow up on your application for the{" "}
              <strong>{position}</strong> role at{" "}
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
                  <strong>Follow-up Date:</strong> {formattedDate}
                </Text>
              </div>
              {contactName && (
                <div style={{ ...featureItem, marginBottom: 0 }}>
                  <span style={featureCheck}>✓</span>
                  <Text style={featureText}>
                    <strong>Recruiter:</strong> {contactName}
                    {contactEmail ? ` (${contactEmail})` : ""}
                  </Text>
                </div>
              )}
            </div>

            {/* Suggested follow-up snippet */}
            <div style={noticeBox}>
              <strong>Suggested follow-up snippet:</strong>
              <br />
              <br />
              &quot;Hi {recruiterFirstName}, I wanted to follow up on my
              application for the {position} position. Please let me know if you
              need any additional information from me.&quot;
            </div>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link style={button} href={`${appUrl}/dashboard`}>
                View Application
              </Link>
            </Section>

            <Text style={paragraph}>
              Keep the momentum going! Following up shows your continued
              interest and proactive attitude.
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
              You set this follow-up reminder in JobPace.
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

export default FollowUpReminderEmail;

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
