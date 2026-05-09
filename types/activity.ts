export interface ActivityLog {
  id: string;
  actionType: string;
  description: string;
  applicationId: string | null;
  createdAt: string | Date | null;
}

export interface ChangeEntry {
  field: string;
  from: string | null;
  to: string | null;
}

export interface ParsedLog {
  summary: string;
  changes: ChangeEntry[];
}
