import { PaginationParams } from '../types';

export const parsePagination = (
  page?: string | number,
  perPage?: string | number
): PaginationParams => {
  const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
  const perPageNum = Math.min(100, Math.max(1, parseInt(String(perPage || '20'), 10) || 20));

  return {
    page: pageNum,
    per_page: perPageNum,
  };
};

export const getOffset = (pagination: PaginationParams): number => {
  return (pagination.page - 1) * pagination.per_page;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const statusDisplayNames: Record<string, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  closed: 'סגור',
};

export const roleDisplayNames: Record<string, string> = {
  secretary: 'מזכירה',
  housekeeper: 'אב בית',
  technician: 'טכנאי',
  admin: 'מנהל מערכת',
};
