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
    subject: "Follow-up on My Application for [Position] at [Company]",
    body: `Good day, [Recruiter/Hiring Manager Name],

I hope this message finds you well. I am writing to follow up on my application for the [Position] role at [Company], which I submitted on [Date].

I remain very interested in the opportunity and would like to kindly inquire about the current status of my application. Please do not hesitate to let me know if you require any additional documents or information from my end.

Thank you for your time and consideration. I look forward to hearing from you.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-2",
    title: "Follow-up (Referral)",
    category: "Follow-up",
    subject: "Follow-up on [Position] Application — Referred by [Referrer]",
    body: `Good day, [Recruiter Name],

I hope you are doing well. I am reaching out to follow up on my application for the [Position] role, which I submitted on [Date]. I was referred by [Referrer Name], who spoke highly of [Company] and encouraged me to apply.

I would like to confirm that my application has been received and to express my continued interest in the role. I believe my background in [relevant skill/experience] aligns well with the requirements of the position.

Please let me know if there is anything else you need from me. I am available at your convenience.

Thank you very much.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-3",
    title: "Follow-up (Additional Info)",
    category: "Follow-up",
    subject: "Additional Information — [Position] Application at [Company]",
    body: `Good day, [Recruiter Name],

I hope this email finds you in good health. I recently submitted my application for the [Position] role and would like to share an additional work sample that may be relevant to your review: [Link].

This highlights my work on [brief context] and demonstrates my capabilities in [relevant skill]. I hope it provides further insight into my qualifications for the role.

Please feel free to reach out if you have any questions. Thank you for your time.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-4",
    title: "Follow-up (Post-Screening)",
    category: "Follow-up",
    subject: "Thank You and Follow-up — [Position] at [Company]",
    body: `Good day, [Recruiter Name],

Thank you for taking the time to speak with me during the initial screening call on [Date]. It was a pleasure learning more about the [Position] role and the team at [Company].

I would like to kindly follow up on the next steps in the hiring process and the expected timeline. I remain enthusiastic about the opportunity and am happy to provide any additional information you may need.

Thank you once again for your time and consideration.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "follow-up-5",
    title: "Follow-up (Post-Assessment)",
    category: "Follow-up",
    subject: "Assessment Submission Confirmation — [Position] at [Company]",
    body: `Good day, [Hiring Manager Name],

I hope you are doing well. I am writing to confirm that I have submitted the [assessment/technical exam] for the [Position] role on [Date] and to ensure that it was received on your end.

Please do not hesitate to let me know if there are any concerns with my submission or if you need any clarification regarding my approach.

I appreciate your time and I look forward to the next steps.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-1",
    title: "Thank You (Initial Interview)",
    category: "Interview",
    subject: "Thank You — [Position] Interview at [Company]",
    body: `Good day, [Interviewer Name],

Thank you for taking the time to meet with me today regarding the [Position] role at [Company]. I truly appreciate the opportunity to learn more about the team and the responsibilities of the position.

Our conversation about [topic discussed] gave me a clearer picture of how I can contribute, and I am confident that my experience in [relevant skill] would allow me to add value to your organization.

Please let me know if you need any additional documents or information. I look forward to hearing from you.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-2",
    title: "Thank You (Panel Interview)",
    category: "Interview",
    subject: "Thank You — [Position] Panel Interview",
    body: `Good day, [Interviewer Names],

I sincerely thank each of you for the time you dedicated to my panel interview today. I valued the opportunity to hear your different perspectives on the [Team/Project] and the direction of the [Position] role.

I am very much interested in moving forward in the process, and I believe my background in [relevant experience] is a strong match for what you described. I am happy to provide any supporting materials upon request.

Thank you again and I hope to be of service to your team.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-3",
    title: "Thank You (Technical Interview)",
    category: "Interview",
    subject: "Thank You — Technical Interview for [Position]",
    body: `Good day, [Interviewer Name],

Thank you for the technical interview earlier today. I enjoyed working through [problem/topic] and the insightful discussion on how your team approaches [relevant area].

I am enthusiastic about the possibility of contributing my skills in [relevant skill/stack] to [Company]. Please let me know if you need any follow-up information on my end.

Thank you very much for the opportunity.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-4",
    title: "Thank You (Final Round)",
    category: "Interview",
    subject: "Thank You — Final Round Interview for [Position]",
    body: `Good day, [Interviewer Name],

Thank you for the final round interview for the [Position] role. I am grateful for the opportunity to meet the team and discuss [topic] in greater depth.

I remain highly interested in joining [Company] and am confident in my ability to contribute in [specific way]. Kindly let me know if there are additional requirements or next steps I should prepare for.

I look forward to your response.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "thank-you-5",
    title: "Thank You (Interview + Case Study)",
    category: "Interview",
    subject: "Thank You — [Position] Interview and Case Study",
    body: `Good day, [Interviewer Name],

Thank you for the opportunity to present my case study and discuss it with you today. I appreciated your feedback on [specific detail] and found the conversation about [topic] very valuable.

I am genuinely excited about the possibility of joining [Company] and contributing to the team. Please let me know if a written summary or any additional materials would be helpful.

Thank you for your time and consideration.

Respectfully,
[Your Name]
[Contact Number] | [LinkedIn/Portfolio]`,
  },
  {
    id: "accept-offer-1",
    title: "Accepting Offer (Confirm Start Date)",
    category: "Offer - Accept",
    subject: "Job Offer Acceptance — [Position] at [Company]",
    body: `Good day, [Hiring Manager Name],

I am pleased and honored to formally accept the offer for the [Position] role at [Company]. I confirm my availability to begin on [Start Date].

Please let me know the next steps and any pre-employment requirements I need to complete prior to my start date. I will make sure to comply promptly.

Thank you very much for this opportunity. I look forward to being part of the team.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "accept-offer-2",
    title: "Accepting Offer (After Negotiation)",
    category: "Offer - Accept",
    subject: "Acceptance of Updated Offer — [Position] at [Company]",
    body: `Good day, [Hiring Manager Name],

Thank you for accommodating my request and for the updated offer details. I am happy to formally accept the [Position] role at [Company] under the agreed terms, including a start date of [Start Date] and a monthly salary of [Salary].

Please send over any pre-employment requirements or onboarding documents at your earliest convenience. I am ready to comply with all necessary steps.

Thank you again for this opportunity.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "accept-offer-3",
    title: "Accepting Offer (Request Offer Letter)",
    category: "Offer - Accept",
    subject: "Job Offer Acceptance — Requesting Written Confirmation",
    body: `Good day, [Hiring Manager Name],

I am very pleased to accept the offer for the [Position] role at [Company]. May I kindly request a written offer letter confirming the position title, compensation package, benefits, and intended start date?

Once I receive the letter, I will review and sign it as soon as possible. Please let me know if there is anything else required from my end.

Thank you very much for this opportunity.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "accept-offer-4",
    title: "Accepting Offer (Remote/Hybrid Setup)",
    category: "Offer - Accept",
    subject: "Job Offer Acceptance — [Position] ([Remote/Hybrid] Setup)",
    body: `Good day, [Hiring Manager Name],

I am glad to formally accept the offer for the [Position] role at [Company]. I confirm the agreed work arrangement ([Remote/Hybrid]) and my start date of [Start Date].

Kindly advise on the onboarding process and any equipment or system setup that needs to be arranged ahead of time. I want to make sure I am fully prepared on day one.

Thank you again for this opportunity. I am looking forward to contributing to the team.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "accept-offer-5",
    title: "Accepting Offer (Flexible Start Date)",
    category: "Offer - Accept",
    subject: "Job Offer Acceptance — [Position] at [Company]",
    body: `Good day, [Hiring Manager Name],

I am honored to accept the offer for the [Position] role at [Company]. My earliest available start date is [Start Date], though I am also open to starting on [Alternate Date] should that be more convenient for the team.

Please share the pre-employment requirements and any other steps I need to complete before my onboarding. I am committed to making the transition as smooth as possible.

Thank you very much for the opportunity.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "decline-offer-1",
    title: "Decline Offer (Another Role)",
    category: "Offer - Decline",
    subject: "Regarding the [Position] Offer — [Your Name]",
    body: `Good day, [Hiring Manager Name],

Thank you sincerely for offering me the [Position] role at [Company] and for the time and effort you and your team invested throughout the hiring process.

After careful deliberation, I have decided to accept another opportunity that is more aligned with my current career goals. This was not an easy decision, as I have a high regard for [Company] and the team I had the pleasure of meeting.

I hope we can stay connected, and I wish [Company] continued success.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "decline-offer-2",
    title: "Decline Offer (Compensation)",
    category: "Offer - Decline",
    subject: "Decision on [Position] Offer — [Your Name]",
    body: `Good day, [Hiring Manager Name],

Thank you for the offer and for the opportunity to go through your hiring process. I genuinely appreciate the time your team extended to me.

After careful consideration of the compensation package, I have respectfully decided to decline the offer at this time. I hope you understand that this was not a reflection of my regard for [Company], which I hold in high esteem.

I hope we may have the chance to work together in the future under different circumstances.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "decline-offer-3",
    title: "Decline Offer (Role Fit)",
    category: "Offer - Decline",
    subject: "Decision on [Position] Offer",
    body: `Good day, [Hiring Manager Name],

Thank you very much for offering me the [Position] role at [Company]. I truly appreciate the warmth and professionalism your team showed throughout the entire process.

After thorough reflection, I have decided to respectfully decline the offer, as I feel the role is not the best fit for my current career direction. I hope this does not close the door on future opportunities to collaborate.

I wish you and the entire team all the best.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "decline-offer-4",
    title: "Decline Offer (Timing)",
    category: "Offer - Decline",
    subject: "Update on [Position] Offer",
    body: `Good day, [Hiring Manager Name],

Thank you for the offer to join [Company] as [Position]. I genuinely appreciate the opportunity and enjoyed the conversations I had with your team.

Unfortunately, due to timing considerations on my end, I am unable to accept the offer at this time. I hope we can stay in touch, as I would welcome the chance to explore future opportunities with [Company].

Thank you again for your understanding.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
  {
    id: "decline-offer-5",
    title: "Decline Offer (Personal Reasons)",
    category: "Offer - Decline",
    subject: "Thank You for the [Position] Offer",
    body: `Good day, [Hiring Manager Name],

Thank you very much for the offer to join [Company] as [Position]. I am truly grateful for the time and consideration your team extended to me throughout the process.

After careful thought, I have decided to respectfully decline the offer due to personal circumstances at this time. I sincerely hope this does not affect any possibility of reconnecting in the future.

I wish [Company] and your team continued growth and success.

Respectfully,
[Your Name]
[Contact Number] | [Email]`,
  },
];
