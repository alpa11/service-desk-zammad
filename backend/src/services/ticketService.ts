import { query } from '../config/database';
import { Ticket, TicketStatus, PaginationParams, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { getOffset, statusDisplayNames } from '../utils/helpers';

interface TicketFilters {
  status?: TicketStatus;
  branch_id?: number;
  housekeeper_id?: number;
  issue_type_id?: number;
  from_date?: string;
  to_date?: string;
}

interface CreateTicketData {
  branch_id: number;
  issue_type_id: number;
  description: string;
  floor?: string;
  building?: string;
  wing?: string;
  room?: string;
  created_by: number;
}

export const ticketService = {
  async getTickets(
    userId: number,
    userRole: UserRole,
    filters: TicketFilters,
    pagination: PaginationParams
  ) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (userRole === 'secretary') {
      conditions.push(`t.created_by = $${paramIndex++}`);
      params.push(userId);
    } else if (userRole === 'housekeeper' || userRole === 'technician') {
      conditions.push(`t.housekeeper_id = $${paramIndex++}`);
      params.push(userId);
    }
    // admin sees all

    // Additional filters
    if (filters.status) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.branch_id) {
      conditions.push(`t.branch_id = $${paramIndex++}`);
      params.push(filters.branch_id);
    }
    if (filters.housekeeper_id && userRole === 'admin') {
      conditions.push(`t.housekeeper_id = $${paramIndex++}`);
      params.push(filters.housekeeper_id);
    }
    if (filters.issue_type_id) {
      conditions.push(`t.issue_type_id = $${paramIndex++}`);
      params.push(filters.issue_type_id);
    }
    if (filters.from_date) {
      conditions.push(`t.created_at >= $${paramIndex++}`);
      params.push(filters.from_date);
    }
    if (filters.to_date) {
      conditions.push(`t.created_at <= $${paramIndex++}`);
      params.push(filters.to_date + ' 23:59:59');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM tickets t ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const offset = getOffset(pagination);
    params.push(pagination.per_page, offset);

    const ticketsResult = await query(
      `SELECT
        t.id, t.description, t.status, t.floor, t.building, t.wing, t.room,
        t.created_at, t.updated_at, t.closed_at,
        b.id as branch_id, b.name as branch_name, b.code as branch_code,
        it.id as issue_type_id, it.code as issue_type_code, it.name as issue_type_name,
        creator.id as created_by_id,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        hk.id as housekeeper_id,
        hk.first_name || ' ' || hk.last_name as housekeeper_name,
        EXISTS(SELECT 1 FROM ticket_photos tp WHERE tp.ticket_id = t.id) as has_photos
      FROM tickets t
      JOIN branches b ON t.branch_id = b.id
      JOIN issue_types it ON t.issue_type_id = it.id
      JOIN users creator ON t.created_by = creator.id
      JOIN users hk ON t.housekeeper_id = hk.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );

    const tickets = ticketsResult.rows.map((row) => ({
      id: row.id,
      description: row.description,
      status: row.status,
      status_display: statusDisplayNames[row.status],
      floor: row.floor,
      building: row.building,
      wing: row.wing,
      room: row.room,
      created_at: row.created_at,
      updated_at: row.updated_at,
      closed_at: row.closed_at,
      branch: {
        id: row.branch_id,
        name: row.branch_name,
        code: row.branch_code,
      },
      issue_type: {
        id: row.issue_type_id,
        code: row.issue_type_code,
        name: row.issue_type_name,
      },
      created_by: {
        id: row.created_by_id,
        name: row.created_by_name,
      },
      housekeeper: {
        id: row.housekeeper_id,
        name: row.housekeeper_name,
      },
      has_photos: row.has_photos,
    }));

    return {
      tickets,
      pagination: {
        current_page: pagination.page,
        per_page: pagination.per_page,
        total_pages: Math.ceil(totalItems / pagination.per_page),
        total_items: totalItems,
      },
    };
  },

  async getTicketById(ticketId: number, userId: number, userRole: UserRole) {
    const result = await query(
      `SELECT
        t.*,
        b.id as branch_id, b.name as branch_name, b.code as branch_code,
        it.id as issue_type_id, it.code as issue_type_code, it.name as issue_type_name,
        creator.id as created_by_id,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        hk.id as housekeeper_id,
        hk.first_name || ' ' || hk.last_name as housekeeper_name,
        closer.id as closed_by_id,
        closer.first_name || ' ' || closer.last_name as closed_by_name
      FROM tickets t
      JOIN branches b ON t.branch_id = b.id
      JOIN issue_types it ON t.issue_type_id = it.id
      JOIN users creator ON t.created_by = creator.id
      JOIN users hk ON t.housekeeper_id = hk.id
      LEFT JOIN users closer ON t.closed_by = closer.id
      WHERE t.id = $1`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      throw new AppError('קריאה לא נמצאה', 404);
    }

    const row = result.rows[0];

    // Check permissions
    if (userRole === 'secretary' && row.created_by !== userId) {
      throw new AppError('אין לך הרשאה לצפות בקריאה זו', 403);
    }
    if ((userRole === 'housekeeper' || userRole === 'technician') && row.housekeeper_id !== userId) {
      throw new AppError('אין לך הרשאה לצפות בקריאה זו', 403);
    }

    // Get photos
    const photosResult = await query(
      `SELECT tp.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM ticket_photos tp
       JOIN users u ON tp.uploaded_by = u.id
       WHERE tp.ticket_id = $1
       ORDER BY tp.uploaded_at`,
      [ticketId]
    );

    return {
      id: row.id,
      description: row.description,
      status: row.status,
      status_display: statusDisplayNames[row.status],
      floor: row.floor,
      building: row.building,
      wing: row.wing,
      room: row.room,
      internal_note: userRole !== 'secretary' ? row.internal_note : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      closed_at: row.closed_at,
      branch: {
        id: row.branch_id,
        name: row.branch_name,
        code: row.branch_code,
      },
      issue_type: {
        id: row.issue_type_id,
        code: row.issue_type_code,
        name: row.issue_type_name,
      },
      created_by: {
        id: row.created_by_id,
        name: row.created_by_name,
      },
      housekeeper: {
        id: row.housekeeper_id,
        name: row.housekeeper_name,
      },
      closed_by: row.closed_by_id
        ? {
            id: row.closed_by_id,
            name: row.closed_by_name,
          }
        : null,
      photos: photosResult.rows.map((p) => ({
        id: p.id,
        file_name: p.file_name,
        url: `/uploads/tickets/${ticketId}/${p.file_path.split('/').pop()}`,
        uploaded_at: p.uploaded_at,
        uploaded_by: {
          id: p.uploaded_by,
          name: p.uploaded_by_name,
        },
      })),
    };
  },

  async createTicket(data: CreateTicketData) {
    // Get housekeeper from branch
    const branchResult = await query(
      'SELECT housekeeper_id FROM branches WHERE id = $1 AND active = true',
      [data.branch_id]
    );

    if (branchResult.rows.length === 0) {
      throw new AppError('סניף לא נמצא או לא פעיל', 400);
    }

    const housekeeperId = branchResult.rows[0].housekeeper_id;

    const result = await query(
      `INSERT INTO tickets (branch_id, issue_type_id, description, floor, building, wing, room,
                            status, created_by, housekeeper_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, $9)
       RETURNING *`,
      [
        data.branch_id,
        data.issue_type_id,
        data.description,
        data.floor || null,
        data.building || null,
        data.wing || null,
        data.room || null,
        data.created_by,
        housekeeperId,
      ]
    );

    const ticket = result.rows[0];

    // Get additional info for response
    const fullTicket = await query(
      `SELECT
        t.id, t.description, t.status, t.created_at,
        b.name as branch_name, b.code as branch_code,
        hk.first_name || ' ' || hk.last_name as housekeeper_name
      FROM tickets t
      JOIN branches b ON t.branch_id = b.id
      JOIN users hk ON t.housekeeper_id = hk.id
      WHERE t.id = $1`,
      [ticket.id]
    );

    const row = fullTicket.rows[0];

    return {
      id: row.id,
      description: row.description,
      status: row.status,
      status_display: statusDisplayNames[row.status],
      created_at: row.created_at,
      branch: {
        id: data.branch_id,
        name: row.branch_name,
        code: row.branch_code,
      },
      housekeeper: {
        id: housekeeperId,
        name: row.housekeeper_name,
      },
    };
  },

  async updateTicketStatus(
    ticketId: number,
    newStatus: TicketStatus,
    userId: number,
    userRole: UserRole
  ) {
    const ticket = await query('SELECT status, housekeeper_id FROM tickets WHERE id = $1', [
      ticketId,
    ]);

    if (ticket.rows.length === 0) {
      throw new AppError('קריאה לא נמצאה', 404);
    }

    const currentStatus = ticket.rows[0].status;
    const housekeeperId = ticket.rows[0].housekeeper_id;

    // Check permissions
    if ((userRole === 'housekeeper' || userRole === 'technician') && housekeeperId !== userId) {
      throw new AppError('אין לך הרשאה לעדכן קריאה זו', 403);
    }

    // Validate status transition
    const allowedTransitions: Record<string, string[]> = {
      open: ['in_progress', 'closed'],
      in_progress: ['open', 'closed'],
      closed: userRole === 'admin' ? ['open'] : [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError('מעבר סטטוס לא חוקי', 400);
    }

    const updateFields = ['status = $1', 'updated_at = NOW()'];
    const params: unknown[] = [newStatus];
    let paramIndex = 2;

    if (newStatus === 'closed') {
      updateFields.push(`closed_at = NOW()`);
      updateFields.push(`closed_by = $${paramIndex++}`);
      params.push(userId);
    } else if (currentStatus === 'closed') {
      updateFields.push(`closed_at = NULL`);
      updateFields.push(`closed_by = NULL`);
    }

    params.push(ticketId);

    await query(
      `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    const updatedTicket = await query(
      'SELECT id, status, updated_at FROM tickets WHERE id = $1',
      [ticketId]
    );

    return {
      id: updatedTicket.rows[0].id,
      status: updatedTicket.rows[0].status,
      status_display: statusDisplayNames[updatedTicket.rows[0].status],
      updated_at: updatedTicket.rows[0].updated_at,
    };
  },

  async updateTicketNote(ticketId: number, note: string, userId: number, userRole: UserRole) {
    const ticket = await query('SELECT housekeeper_id FROM tickets WHERE id = $1', [ticketId]);

    if (ticket.rows.length === 0) {
      throw new AppError('קריאה לא נמצאה', 404);
    }

    if (
      (userRole === 'housekeeper' || userRole === 'technician') &&
      ticket.rows[0].housekeeper_id !== userId
    ) {
      throw new AppError('אין לך הרשאה לעדכן קריאה זו', 403);
    }

    await query('UPDATE tickets SET internal_note = $1, updated_at = NOW() WHERE id = $2', [
      note,
      ticketId,
    ]);

    return {
      id: ticketId,
      internal_note: note,
      updated_at: new Date(),
    };
  },

  async addPhoto(
    ticketId: number,
    filePath: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    userId: number
  ) {
    const result = await query(
      `INSERT INTO ticket_photos (ticket_id, file_path, file_name, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [ticketId, filePath, fileName, fileSize, mimeType, userId]
    );

    const photo = result.rows[0];

    const userResult = await query(
      "SELECT first_name || ' ' || last_name as name FROM users WHERE id = $1",
      [userId]
    );

    return {
      id: photo.id,
      ticket_id: ticketId,
      file_name: photo.file_name,
      url: `/uploads/tickets/${ticketId}/${filePath.split('/').pop()}`,
      uploaded_at: photo.uploaded_at,
      uploaded_by: {
        id: userId,
        name: userResult.rows[0].name,
      },
    };
  },

  async deletePhoto(photoId: number, userId: number, userRole: UserRole) {
    const photo = await query('SELECT * FROM ticket_photos WHERE id = $1', [photoId]);

    if (photo.rows.length === 0) {
      throw new AppError('תמונה לא נמצאה', 404);
    }

    if (userRole !== 'admin' && photo.rows[0].uploaded_by !== userId) {
      throw new AppError('אין לך הרשאה למחוק תמונה זו', 403);
    }

    await query('DELETE FROM ticket_photos WHERE id = $1', [photoId]);

    return { file_path: photo.rows[0].file_path };
  },
};
