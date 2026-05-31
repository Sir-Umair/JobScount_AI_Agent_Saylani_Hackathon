export interface CandidateProfile {
  full_name: string;
  professional_summary: string;
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
  projects: string;
  preferred_role: string;
  preferred_location: string;
}

export interface UploadResponse {
  message: string;
  cv_text: string;
  candidate_profile: CandidateProfile;
  cv_id: string;
}

export interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  job_url: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  education_match: string;
  reasoning: string;
  interview_questions: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
}

export interface AgentResponse {
  status: string;
  results: JobRecommendation[];
}
