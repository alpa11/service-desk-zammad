export type UserRole = 'secretary' | 'housekeeper' | 'technician' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'closed';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  group_id: number | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Group {
  id: number;
  name: string;
  active: boolean;
  created_at: Date;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  housekeeper_id: number;
  has_floors: boolean;
  has_buildings: boolean;
  has_wings: boolean;
  floor_options: string[] | null;
  building_options: string[] | null;
  wing_options: string[] | null;
  active: boolean;
  created_at: Date;
}

export interface IssueType {
  id: number;
  code: string;
  name: string;
  category: string | null;
  active: boolean;
  display_order: number;
  created_at: Date;
}

export interface Ticket {
  id: number;
  branch_id: number;
  issue_type_id: number;
  description: string;
  floor: string | null;
  building: string | null;
  wing: string | null;
  room: string | null;
  status: TicketStatus;
  created_by: number;
  housekeeper_id: number;
  closed_by: number | null;
  internal_note: string | null;
  created_at: Date;
  updated_at: Date;
  closed_at: Date | null;
}

export interface TicketPhoto {
  id: number;
  ticket_id: number;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: number;
  uploaded_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
