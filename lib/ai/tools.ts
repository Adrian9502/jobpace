import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions";

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_applications",
      description:
        "Fetch all job applications for the user. Call this when you need specific details about an application before taking action.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_stage",
      description:
        'Update the STAGE (pipeline position) of a job application. Use this when user says "move X to ghosted", "X rejected me", "I got an interview at X".',
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "Company name, will use fuzzy match",
          },
          stage: {
            type: "string",
            enum: [
              "applied",
              "screening",
              "interview",
              "assessment",
              "final_interview",
              "offer",
              "hired",
              "rejected",
              "ghosted",
              "withdrawn",
            ],
            description: "The new pipeline stage",
          },
        },
        required: ["companyName", "stage"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_status",
      description:
        'Update the STATUS (outcome state) of a job application. Use this when user says "I passed the exam at X", "failed the interview at X", "X is ongoing".',
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "Company name, will use fuzzy match",
          },
          status: {
            type: "string",
            enum: ["pending", "ongoing", "passed", "failed"],
            description: "The new outcome status",
          },
        },
        required: ["companyName", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_application",
      description:
        "Add a new job application. dateApplied defaults to today if not specified.",
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "Company name",
          },
          position: {
            type: "string",
            description: "Job position / title",
          },
          stage: {
            type: "string",
            enum: [
              "applied",
              "screening",
              "interview",
              "assessment",
              "final_interview",
              "offer",
              "hired",
              "rejected",
              "ghosted",
              "withdrawn",
            ],
            description: 'Pipeline stage, defaults to "applied"',
          },
          source: {
            type: "string",
            enum: [
              "Jobstreet",
              "LinkedIn",
              "Kalibrr",
              "Indeed",
              "Referral",
              "Company Website",
              "Facebook",
              "Walk-in",
              "Other",
            ],
            description: "Where the user found the listing",
          },
          location: {
            type: "string",
            description: "Job location (e.g. Makati, Cebu, Remote)",
          },
          workSetup: {
            type: "string",
            enum: ["onsite", "hybrid", "remote"],
            description: "Work arrangement",
          },
          dateApplied: {
            type: "string",
            description: "ISO date string, defaults to today",
          },
        },
        required: ["companyName", "position"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_application",
      description:
        "Delete a job application. ONLY call this after the user has explicitly confirmed deletion in a previous message. Never call on the first mention of deleting.",
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "Company name, will use fuzzy match",
          },
          confirmed: {
            type: "boolean",
            description:
              "Must be true. AI must ask for confirmation before calling this tool.",
          },
        },
        required: ["companyName", "confirmed"],
      },
    },
  },
];
