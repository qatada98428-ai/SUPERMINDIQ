export type UserRole = "student" | "trainer" | "admin";

export type ApplicationStatus = "pending" | "active" | "expired" | "rejected";

export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  status: "active" | "suspended";
  created_at: string;
  last_activity: string;
}

export interface UserProgressRecord {
  id?: string;
  user_id: string;
  current_level: string;
  last_exercise: string;
  total_answers: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy_rate: number;
  completed_exercises: number;
  training_duration_seconds: number;
  best_score: number;
  last_activity: string;
  updated_at?: string;
}

export interface TrainingSessionRecord {
  id: string;
  user_id: string;
  session_type: "flash_anzan" | "abacus" | "multiplication" | "quiz" | "teams_battle";
  level: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy_rate: number;
  duration_seconds: number;
  score: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface TrainerApplicationRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  governorate: string;
  country: string;
  bio: string;
  photo_url?: string;
  annual_fee_iqd: number;
  status: ApplicationStatus;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SchoolApplicationRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  governorate: string;
  country: string;
  address: string;
  curriculum_stage: string;
  bio: string;
  book_cover_url?: string;
  annual_fee_iqd: number;
  status: ApplicationStatus;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupporterRecord {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  link?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface AdminAuditLogRecord {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  target_type: "user" | "trainer" | "school" | "supporter" | "settings";
  target_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}
