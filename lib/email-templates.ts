export type EmailTemplate = {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "follow-up-1",
    title: "Follow-up (1 Week)",
    category: "Follow-up",
    subject: "Follow-up on my application for [Position] at [Company]",
    body: `Hello [Recruiter Name/Hiring Manager],

I applied for the [Position] role on [Date] and wanted to follow up on the status of my application. I remain very interested in the opportunity at [Company] and would appreciate any update on next steps.

If helpful, I can share additional information, references, or work samples.

Thank you for your time,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-2",
    title: "Follow-up (Referral)",
    category: "Follow-up",
    subject: "Checking in on [Position] application (referred by [Referrer])",
    body: `Hi [Recruiter Name],

I applied for the [Position] role on [Date] and was referred by [Referrer Name]. I wanted to check in on my application and confirm it was received.

I am excited about the role and believe my experience with [relevant skill/experience] would be a strong match. Please let me know if there is any other information I can provide.

Best regards,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-3",
    title: "Follow-up (Added Info)",
    category: "Follow-up",
    subject: "Additional info for [Position] application at [Company]",
    body: `Hello [Recruiter Name],

I recently applied for the [Position] role and wanted to share a relevant work sample: [Link]. It highlights my work on [brief context] and may be helpful as you review my application.

Please let me know if I can answer any questions or provide more detail.

Thank you,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-4",
    title: "Follow-up (Post-Screening)",
    category: "Follow-up",
    subject: "Thank you and next steps for [Position]",
    body: `Hi [Recruiter Name],

Thank you for the phone screen on [Date]. I enjoyed learning more about the [Team/Department] and the [Position] role.

I wanted to follow up on next steps and the expected timeline. Please let me know if you need anything else from me.

Best,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-5",
    title: "Follow-up (Post-Assessment)",
    category: "Follow-up",
    subject: "Assessment submission for [Position] - [Your Name]",
    body: `Hello [Hiring Manager],

I submitted the [assessment/take-home] for the [Position] role on [Date] and wanted to confirm it was received. Please let me know if anything is missing or if you have any questions about my approach.

I appreciate your time and look forward to the next steps.

Sincerely,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-1",
    title: "Thank You (Initial Interview)",
    category: "Interview",
    subject: "Thank you for the [Position] interview",
    body: `Hello [Interviewer Name],

Thank you for meeting with me today about the [Position] role. I enjoyed our conversation about [topic discussed] and learning more about the team at [Company].

I am excited about the opportunity and confident my experience with [relevant skill] would help me contribute quickly. Please let me know if I can provide anything else.

Best regards,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-2",
    title: "Thank You (Panel Interview)",
    category: "Interview",
    subject: "Thank you - [Position] panel interview",
    body: `Hi [Interviewer Names],

Thank you all for the panel interview today. I appreciated hearing each of your perspectives on the [Team/Project] and the goals for this role.

I am very interested in moving forward and believe my background in [relevant experience] aligns well with what you described. Please let me know if there is any additional information I can provide.

Thank you again,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-3",
    title: "Thank You (Technical Interview)",
    category: "Interview",
    subject: "Thank you for the technical interview - [Position]",
    body: `Hello [Interviewer Name],

Thank you for the technical interview today. I enjoyed working through [problem/topic] and discussing how your team approaches [relevant area].

I am excited about the role and would welcome the chance to contribute my skills in [relevant skill/stack]. Please let me know if you would like any follow-up details.

Best,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-4",
    title: "Thank You (Final Round)",
    category: "Interview",
    subject: "Thank you - final round for [Position]",
    body: `Hi [Interviewer Name],

Thank you for the final round interview for the [Position] role. I appreciated the chance to discuss [topic] and learn more about the team's priorities for the next quarter.

I remain very interested in the position and believe I can contribute in [specific way]. Please let me know if there are any next steps or additional materials you would like from me.

Sincerely,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-5",
    title: "Thank You (Interview + Case Study)",
    category: "Interview",
    subject: "Thank you - [Position] interview and case study",
    body: `Hello [Interviewer Name],

Thank you for the interview and the chance to walk through my case study. I enjoyed discussing [topic] and your feedback on [specific detail].

I am enthusiastic about the opportunity to join [Company]. Please let me know if you need a written summary or any supporting materials.

Best regards,
[Your Name]
[Phone] | [LinkedIn/Portfolio]`,
  },
  {
    id: "accept-offer-1",
    title: "Accepting Offer (Confirm Start Date)",
    category: "Offer - Accept",
    subject: "Offer acceptance - [Position] at [Company]",
    body: `Hello [Hiring Manager Name],

I am happy to accept the offer for the [Position] role at [Company]. I confirm a start date of [Start Date].

Please let me know the next steps and any paperwork I should complete ahead of my start date.

Thank you again for the opportunity,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "accept-offer-2",
    title: "Accepting Offer (After Negotiation)",
    category: "Offer - Accept",
    subject: "Acceptance of updated offer - [Position]",
    body: `Hi [Hiring Manager Name],

Thank you for the updated offer details. I am pleased to accept the [Position] role at [Company] with the terms discussed, including a start date of [Start Date] and a base salary of [Salary].

Please share any next steps or onboarding materials.

Best regards,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "accept-offer-3",
    title: "Accepting Offer (Request Offer Letter)",
    category: "Offer - Accept",
    subject: "Accepting offer - [Position] (requesting written confirmation)",
    body: `Hello [Hiring Manager Name],

I am excited to accept the offer for the [Position] role at [Company]. Could you please send a written offer letter confirming the role details, compensation, benefits, and start date?

Once received, I will review and sign promptly.

Thank you,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "accept-offer-4",
    title: "Accepting Offer (Remote/Hybrid Details)",
    category: "Offer - Accept",
    subject: "Offer acceptance - [Position] (work arrangement)",
    body: `Hi [Hiring Manager Name],

I am pleased to accept the [Position] role at [Company]. I confirm the agreed work arrangement ([Remote/Hybrid]) and a start date of [Start Date].

Please let me know the next steps for onboarding and equipment setup.

Sincerely,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "accept-offer-5",
    title: "Accepting Offer (Start Date Flexibility)",
    category: "Offer - Accept",
    subject: "Acceptance of offer - [Position] at [Company]",
    body: `Hello [Hiring Manager Name],

I am happy to accept the offer for the [Position] role at [Company]. My earliest start date is [Start Date], and I am also flexible to begin on [Alternate Date] if that is more convenient.

Please share the next steps and any paperwork required.

Thank you,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "decline-offer-1",
    title: "Decline Offer (Another Role)",
    category: "Offer - Decline",
    subject: "Update on [Position] offer - [Your Name]",
    body: `Hello [Hiring Manager Name],

Thank you very much for the offer to join [Company] as a [Position]. After careful consideration, I have decided to accept another opportunity that is a better fit for my current goals.

I appreciate your time and the chance to meet the team. I hope we can stay in touch in the future.

Sincerely,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "decline-offer-2",
    title: "Decline Offer (Compensation)",
    category: "Offer - Decline",
    subject: "[Position] offer decision - [Your Name]",
    body: `Hi [Hiring Manager Name],

Thank you for the offer and for the time you and the team invested in the process. After reviewing the compensation details, I have decided to decline the offer at this time.

I appreciate the opportunity and hope we can reconnect in the future if circumstances change.

Best regards,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "decline-offer-3",
    title: "Decline Offer (Role Fit)",
    category: "Offer - Decline",
    subject: "Decision on [Position] offer",
    body: `Hello [Hiring Manager Name],

Thank you for the offer to join [Company]. After careful consideration, I have decided to decline because the role is not the best fit for my current focus.

I truly appreciate the time and effort from everyone involved and wish you and the team continued success.

Sincerely,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "decline-offer-4",
    title: "Decline Offer (Timing)",
    category: "Offer - Decline",
    subject: "[Position] offer - update",
    body: `Hi [Hiring Manager Name],

Thank you for the offer. Due to timing considerations, I will need to decline at this time. I appreciate the opportunity and enjoyed learning more about [Company].

I would welcome the chance to stay in touch for future roles.

Best,
[Your Name]
[Phone] | [Email]`,
  },
  {
    id: "decline-offer-5",
    title: "Decline Offer (Personal Reasons)",
    category: "Offer - Decline",
    subject: "Thank you for the [Position] offer",
    body: `Hello [Hiring Manager Name],

Thank you for offering me the [Position] role at [Company]. After careful consideration, I have decided to decline the offer due to personal reasons.

I am grateful for your time and the opportunity to meet the team. I hope we can connect again in the future.

Sincerely,
[Your Name]
[Phone] | [Email]`,
  },
];
