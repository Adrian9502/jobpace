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

interface UpdateEmailProps {
  time: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function UpdateEmail({ time = "9:00 PM" }: UpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>JobPace Update and Fixes - 7-18-26</Preview>
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
            <Text style={heroText}>
              Hello! Kamusta ang job hunting? I hope you're doing great! Laban
              lang! It takes time talaga 😄
            </Text>

            <Text style={paragraph}>
              Here are the updates on <strong>July 18, 2026</strong> ({time}):
            </Text>

            <Heading as="h2" style={sectionHeading}>
              What's New:
            </Heading>

            {/* Features List */}
            <div style={featureBox}>
              <div style={featureItem}>
                <div>
                  <Text style={featureHeading}>
                    1. Modal replaced with slide-out panel
                  </Text>
                  <Text style={featureDescription}>
                    I replaced the cramped modal for adding and editing job
                    applications with a beautiful, spacious slide-out panel
                    (drawer) to give you more room to view and edit details.
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <div>
                  <Text style={featureHeading}>
                    2. JobPace AI can now help you fill new applications!
                  </Text>
                  <Text style={featureDescription}>
                    Simply paste a job description or LinkedIn snippet, and
                    JobPace AI will automatically parse the information to fill
                    out the form fields for you in seconds.
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <div>
                  <Text style={featureHeading}>3. Linked Resume</Text>
                  <Text style={featureDescription}>
                    You can now link a specific uploaded resume to each job
                    application. Easily keep track of which tailored resume
                    version you submitted to each employer.
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <div>
                  <Text style={featureHeading}>4. Interview Prep Mode</Text>
                  <Text style={featureDescription}>
                    Toggle a distraction-free, full-screen Prep Mode for
                    applications in the interview stage to review your Company
                    Research, Job Description, Notes, and your linked resume
                    side-by-side.
                  </Text>
                </div>
              </div>

              <div style={{ ...featureItem, marginBottom: 0 }}>
                <div>
                  <Text style={featureHeading}>
                    5. Fixed Cloudinary downloading and viewing issue
                  </Text>
                  <Text style={featureDescription}>
                    Resolved a bug where viewing or downloading your uploaded
                    resumes returned a 401 error. You can now view and download
                    all of your uploaded resumes smoothly.
                  </Text>
                </div>
              </div>
            </div>

            <Text style={paragraph}>
              If you have questions, bugs, or feature requests, just reply to
              this message. I'm happy to help 😃.
            </Text>

            <Text style={paragraph}>
              Share JobPace to your classmates, friends, or anyone who is
              actively looking for a job. Let's make their life easier 💜.
            </Text>

            <Text style={paragraph}>Thank you for using JobPace 💜.</Text>

            <Text style={personalNote}>
              <em>
                * This email is not automated and was written exactly by me.
              </em>
            </Text>

            <Text style={signature}>
              Best,
              <br />
              <strong>John Adrian Bonto</strong>
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${APP_URL}/dashboard`}>
              Open JobPace
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} JobPace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default UpdateEmail;

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
  maxWidth: "520px",
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
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const heroText: React.CSSProperties = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const sectionHeading: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: 700,
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const personalNote: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 20px",
};

const signature: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
};

const featureBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px 20px",
  marginBottom: "24px",
};

const featureItem: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "20px",
};

const featureCheck: React.CSSProperties = {
  fontSize: "16px",
  flexShrink: 0,
  lineHeight: "1.4",
};

const featureHeading: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
  margin: "0 0 4px",
};

const featureDescription: React.CSSProperties = {
  color: "#4b5563",
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

const footerCopyright: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: 0,
  textAlign: "center" as const,
};
