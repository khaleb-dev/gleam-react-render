export interface MapLocation {
  lat: number;
  lng: number;
}

export type TaskStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "waiting";

// Add KeyNote export
export interface KeyNote {
  id: string;
  text: string;
}

export interface SubmissionDetails {
  description: string;
  link?: string;
  files_urls?: string[];
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  location: MapLocation;
  date: string;
  time: string;
  category: string;
  images: string[];
  userId: string;
  responderId?: string;
  price: number;

  // Additional fields used by components
  subject?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  key_notes?: string[];
  created_by?: string;
  difficulty?: string;
  assigned_status?: string;
  files?: string[];
  file_urls?: string[];
  responder?: Responder;
  progress_percentage?: number;
  user_final_decision?: string;
  responder_final_decision?: string;
  submit?: SubmissionDetails;
}

export enum AVAILABILITY_STATUS {
  BUSY = "busy",
  AVAILABLE = "available",
}

export interface USER_LOCATION {
  country: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  // Add lat/lng for map compatibility
  lat?: number;
  lng?: number;
}

export type Responder = {
  id?: string; // Add id property
  first_name: string;
  last_name: string;
  password: string;
  email: string;
  phone_number: string;
  role: string;
  _id?: string;
  is_verified: boolean;
  location?: USER_LOCATION;
  last_login: Date;
  has_set_transaction_pin?: boolean;
  status?: string;
  responder_id?: string;
  availability_status?: AVAILABILITY_STATUS;
  // Add properties used in map component
  name?: string;
  rating?: number;
  completedTasks?: number;
  profileImage?: string;
  isActive?: boolean;
  specializations?: string[];
  user_id?: string;
  skills?: string[];
  total_tasks_completed?: number;
  total_earned?: number;
  average_rating?: number;
  profile_image?: string;
  bio?: string;
};

export interface IUserEducation {
  _id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface IProfessionalExperience {
  _id?: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  location?: string;
}

export interface IUserAchievement {
  _id?: string;
  title: string;
  description: string;
  date_achieved: string;
  issuing_organization?: string;
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  files?: any[];
}

export interface User {
  profile_avatar?: any;
  _id?: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  has_set_transaction_pin?: boolean;
  is_verified?: boolean;
  phone_number?: string;
  role: string;
  status?: string;
  walletBalance?: number;
  wallet_id?: {
    _id: string;
    user_id: string;
    type: string;
    balance: number;
    locked_balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Enums to support the existing code
export enum AssignedStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
}

// Define task status constants for use in code
export const TaskStatusValues = {
  PENDING: "pending" as TaskStatus,
  ACCEPTED: "accepted" as TaskStatus,
  IN_PROGRESS: "in_progress" as TaskStatus,
  COMPLETED: "completed" as TaskStatus,
  CANCELLED: "cancelled" as TaskStatus,
  WAITING: "waiting" as TaskStatus,
};
