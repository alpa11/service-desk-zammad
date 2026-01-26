export type UserRole = 'secretary' | 'housekeeper' | 'technician' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'closed';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  group_id: number | null;
  group_name: string | null;
  permissions?: {
    can_create_ticket: boolean;
    can_view_all_tickets: boolean;
    can_manage_users: boolean;
    can_manage_branches: boolean;
  };
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user: User;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  has_floors: boolean;
  has_buildings: boolean;
  has_wings: boolean;
  floor_options: string[] | null;
  building_options: string[] | null;
  wing_options: string[] | null;
  active: boolean;
  housekeeper: {
    id: number;
    name: string;
  };
  open_tickets?: number;
}

export interface IssueType {
  id: number;
  code: string;
  name: string;
  category: string | null;
  active: boolean;
}

export interface Ticket {
  id: number;
  description: string;
  status: TicketStatus;
  status_display: string;
  floor: string | null;
  building: string | null;
  wing: string | null;
  room: string | null;
  internal_note?: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  branch: {
    id: number;
    name: string;
    code: string;
  };
  issue_type: {
    id: number;
    code: string;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  housekeeper: {
    id: number;
    name: string;
  };
  closed_by?: {
    id: number;
    name: string;
  } | null;
  has_photos?: boolean;
  photos?: TicketPhoto[];
}

export interface TicketPhoto {
  id: number;
  file_name: string;
  url: string;
  uploaded_at: string;
  uploaded_by: {
    id: number;
    name: string;
  };
}

export interface CreateTicketData {
  branch_id: number;
  issue_type_id: number;
  description: string;
  floor?: string;
  building?: string;
  wing?: string;
  room?: string;
}

export interface Group {
  id: number;
  name: string;
  active: boolean;
  members_count: number;
}

export interface Statistics {
  totals: {
    all: number;
    open: number;
    in_progress: number;
    closed: number;
  };
  today: {
    created: number;
    closed: number;
  };
  this_week: {
    created: number;
    closed: number;
  };
  this_month: {
    created: number;
    closed: number;
  };
  average_handling_time_hours: string | null;
  by_issue_type: Array<{ issue_type: string; count: number }>;
  by_branch: Array<{ branch: string; open: number; in_progress: number; closed: number }>;
  by_housekeeper: Array<{
    housekeeper: string;
    open: number;
    in_progress: number;
    closed: number;
    avg_handling_time_hours: string | null;
  }>;
}

export interface MyDashboard {
  open_tickets: number;
  in_progress_tickets: number;
  closed_today: number;
  closed_this_week: number;
  tickets_by_branch: Array<{ branch: string; open: number; in_progress: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  tickets: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
  };
}
