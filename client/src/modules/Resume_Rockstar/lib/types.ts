// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — TypeScript types

export interface ResumeSection {
  id: string;
  type: 'objective' | 'experience' | 'skills' | 'education' | 'certifications' | 'projects';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Resume {
  resumeId: string;
  title: string;
  sections: ResumeSection[];
  lastModified: string;
}

export interface ResumeExportRequest {
  resumeId: string;
  format: 'pdf' | 'markdown' | 'json';
}

export interface ResumeExportResponse {
  response: {
    resumeId: string;
    format: string;
    downloadUrl?: string;
    content?: string;
    generatedAt: string;
  };
  provider: string;
  timestamp: string;
}

export interface ResumeSaveRequest {
  userId?: string;
  resume: Resume;
}

export interface ResumeSaveResponse {
  response: {
    resumeId: string;
    savedAt: string;
  };
  provider: string;
  timestamp: string;
}
