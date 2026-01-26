import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import type { TicketStatus, CreateTicketData } from '../types';
import toast from 'react-hot-toast';

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

export const useTickets = (filters: TicketFilters = {}) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsApi.getTickets(filters),
  });
};

export const useTicket = (id: number) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getTicketById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => ticketsApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('הקריאה נפתחה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בפתיחת הקריאה');
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TicketStatus }) =>
      ticketsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('הסטטוס עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון הסטטוס');
    },
  });
};

export const useUpdateTicketNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      ticketsApi.updateNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('ההערה נשמרה');
    },
    onError: () => {
      toast.error('שגיאה בשמירת ההערה');
    },
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: number; file: File }) =>
      ticketsApi.uploadPhoto(ticketId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('התמונה הועלתה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בהעלאת התמונה');
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, photoId }: { ticketId: number; photoId: number }) =>
      ticketsApi.deletePhoto(ticketId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
      toast.success('התמונה נמחקה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת התמונה');
    },
  });
};
