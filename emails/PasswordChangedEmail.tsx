import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordChangedEmailProps {
  name: string;
  ipAddress: string;
  time: string;
  date: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function PasswordChangedEmail({
  name,
  ipAddress,
  time,
  date,
}: PasswordChangedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Security Alert: Your JobPace password was changed</Preview>
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
              Password Changed
            </Heading>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              This is a confirmation that the password for your JobPace account
              was recently changed.
            </Text>

            <Section style={detailsContainer}>
              <Text style={detailsTitle}>Details of the change:</Text>
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailsLabel}>Date:</td>
                    <td style={detailsValue}>{date}</td>
                  </tr>
                  <tr>
                    <td style={detailsLabel}>Time:</td>
                    <td style={detailsValue}>{time}</td>
                  </tr>
                  <tr>
                    <td style={detailsLabel}>IP Address:</td>
                    <td style={detailsValue}>{ipAddress}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={paragraph}>
              <strong>Didn't make this change?</strong>
            </Text>
            <Text style={paragraph}>
              If you did not authorize this change, please reset your password
              immediately or reply to this email to contact support to secure
              your account.
            </Text>

            <Text style={paragraph}>
              Best,
              <br />
              The JobPace Security Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated security notification. Please do not reply to
              this email unless you need assistance.
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

export default PasswordChangedEmail;

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
  margin: "0 0 16px",
};

const detailsContainer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
};

const detailsTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
  margin: "0 0 12px",
};

const detailsTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const detailsLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  padding: "4px 0",
  width: "80px",
};

const detailsValue: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 500,
  padding: "4px 0",
};

const footerSection: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  padding: "24px 32px 32px",
  backgroundColor: "#f9fafb",
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
