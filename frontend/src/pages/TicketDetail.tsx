import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTicket, useUpdateTicketStatus, useUpdateTicketNote, useUploadPhoto } from '../hooks/useTickets';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { Spinner } from '../components/common/Spinner';
import { ArrowRightIcon, CameraIcon } from '@heroicons/react/24/outline';
import type { TicketStatus } from '../types';

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const ticketId = Number(id);

  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const updateStatus = useUpdateTicketStatus();
  const updateNote = useUpdateTicketNote();
  const uploadPhoto = useUploadPhoto();

  const [note, setNote] = useState('');
  const [noteEditing, setNoteEditing] = useState(false);

  const canManage = user?.role !== 'secretary';

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateStatus.mutate({ id: ticketId, status: newStatus });
  };

  const handleNoteSubmit = () => {
    updateNote.mutate(
      { id: ticketId, note },
      {
        onSuccess: () => setNoteEditing(false),
      }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto.mutate({ ticketId, file });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">שגיאה בטעינת הקריאה</p>
        <Link to="/tickets" className="text-primary-600 hover:underline mt-4 inline-block">
          חזור לרשימת הקריאות
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/tickets"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="h-4 w-4 ml-1" />
          חזרה לקריאות
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">קריאה #{ticket.id}</h1>
              <StatusBadge status={ticket.status} display={ticket.status_display} />
            </div>
          </div>
        </div>

        {canManage && ticket.status !== 'closed' && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">שינוי סטטוס:</p>
            <div className="flex gap-2">
              {ticket.status === 'open' && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange('in_progress')}
                    isLoading={updateStatus.isPending}
                  >
                    התחל טיפול
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange('closed')}
                    isLoading={updateStatus.isPending}
                  >
                    סגור קריאה
                  </Button>
                </>
              )}
              {ticket.status === 'in_progress' && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange('open')}
                    isLoading={updateStatus.isPending}
                  >
                    החזר לפתוח
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange('closed')}
                    isLoading={updateStatus.isPending}
                  >
                    סגור קריאה
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">סניף</p>
              <p className="font-medium">{ticket.branch.name}</p>
              <p className="text-gray-500 text-xs">{ticket.branch.code}</p>
            </div>
            <div>
              <p className="text-gray-500">סוג תקלה</p>
              <p className="font-medium">{ticket.issue_type.name}</p>
            </div>
            {ticket.floor && (
              <div>
                <p className="text-gray-500">קומה</p>
                <p className="font-medium">{ticket.floor}</p>
              </div>
            )}
            {ticket.room && (
              <div>
                <p className="text-gray-500">חדר</p>
                <p className="font-medium">{ticket.room}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">תיאור</p>
            <p className="text-gray-900">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
            <div>
              <p className="text-gray-500">נפתח ע"י</p>
              <p className="font-medium">{ticket.created_by.name}</p>
              <p className="text-gray-500 text-xs">{formatDateTime(ticket.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">אב בית אחראי</p>
              <p className="font-medium">{ticket.housekeeper.name}</p>
            </div>
            {ticket.closed_by && (
              <div>
                <p className="text-gray-500">נסגר ע"י</p>
                <p className="font-medium">{ticket.closed_by.name}</p>
                <p className="text-gray-500 text-xs">
                  {ticket.closed_at && formatDateTime(ticket.closed_at)}
                </p>
              </div>
            )}
          </div>

          {canManage && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-2">הערה פנימית</p>
              {noteEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="הוסף הערה פנימית..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleNoteSubmit}
                      isLoading={updateNote.isPending}
                    >
                      שמור
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setNoteEditing(false)}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {ticket.internal_note ? (
                    <p className="text-gray-900 mb-2">{ticket.internal_note}</p>
                  ) : (
                    <p className="text-gray-400 italic mb-2">אין הערות</p>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setNote(ticket.internal_note || '');
                      setNoteEditing(true);
                    }}
                  >
                    {ticket.internal_note ? 'ערוך' : 'הוסף הערה'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {canManage && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-3">תמונות</p>
              <div className="flex flex-wrap gap-3">
                {ticket.photos?.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
                <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">הוסף תמונה</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadPhoto.isPending}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
