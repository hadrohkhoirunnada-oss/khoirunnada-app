export type UserStatus = 'pending' | 'active' | 'rejected' | 'inactive';

export interface Profile {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  phone?: string;
  role_title?: string;
  status: UserStatus;
  is_member: boolean;
  is_treasurer: boolean;
  is_admin: boolean;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export type BookingStatus =
  | 'new'
  | 'contacted'
  | 'negotiation'
  | 'waiting_dp'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface Booking {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  event_type: string;
  event_name?: string;
  event_date: string;
  event_time: string;
  location: string;
  location_detail?: string;
  notes?: string;
  status: BookingStatus;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  converted_job_id?: string;
}

export type JobStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  booking_id?: string;
  title: string;
  event_type: string;
  customer_name: string;
  customer_phone?: string;
  event_date: string;
  gather_time: string;
  start_time: string;
  location: string;
  maps_url: string;
  dress_code?: string;
  transport_info?: string;
  notes?: string;
  status: JobStatus;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export type AttendanceStatus = 'attending' | 'not_attending' | 'maybe' | 'no_response';

export interface JobAttendance {
  id: string;
  job_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  status: AttendanceStatus;
  note?: string;
  updated_at: string;
}

export interface JobAssignment {
  id: string;
  job_id: string;
  user_id: string;
  user_name: string;
  role_name: string;
  notes?: string;
  created_at: string;
}

export interface QosidahVerse {
  arabic: string;
  latin: string;
  translation: string;
}

export interface Qosidah {
  id: string;
  title: string;
  alternate_title?: string;
  arabic_text: string;
  latin_text: string;
  translation: string;
  category_id: string;
  category_name?: string;
  tags: string[];
  notes?: string;
  audio_url?: string;
  is_active: boolean;
  sort_order: number;
  verses?: QosidahVerse[];
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface QosidahCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export type FinanceType = 'income' | 'expense';

export interface FinanceCategory {
  id: string;
  name: string;
  type: FinanceType;
  is_active: boolean;
  created_at: string;
}

export interface FinanceTransaction {
  id: string;
  type: FinanceType;
  category_id: string;
  category_name: string;
  amount: number;
  transaction_date: string;
  description: string;
  job_id?: string;
  job_title?: string;
  attachment_url?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export type NotificationType =
  | 'job_new'
  | 'job_update'
  | 'job_cancelled'
  | 'announcement'
  | 'approval'
  | 'finance';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_type: 'all' | 'member' | 'treasurer' | 'admin';
  target_id?: string;
  target_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
}
