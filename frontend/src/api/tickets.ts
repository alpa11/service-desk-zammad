import { api } from './client';
import type {
  ApiResponse,
  Ticket,
  CreateTicketData,
  PaginatedResponse,
  TicketStatus,
  TicketPhoto,
} from '../types';

interface TicketFilters {
  status?: TicketStatus;
  branch_id?: number;
  housekeeper_id?: number;
  issue_type_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export const ticketsApi = {
  getTickets: async (filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
      `/tickets?${params.toString()}`
    );
    return response.data.data!;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data!;
  },

  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', data);
    return response.data.data!;
  },

  updateStatus: async (id: number, status: TicketStatus): Promise<Ticket> => {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status });
    return response.data.data!;
  },

  updateNote: async (id: number, internalNote: string): Promise<Ticket> => {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/note`, {
      internal_note: internalNote,
    });
    return response.data.data!;
  },

  uploadPhoto: async (ticketId: number, file: File): Promise<TicketPhoto> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post<ApiResponse<TicketPhoto>>(
      `/tickets/${ticketId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  deletePhoto: async (ticketId: number, photoId: number): Promise<void> => {
    await api.delete(`/tickets/${ticketId}/photos/${photoId}`);
  },
};
