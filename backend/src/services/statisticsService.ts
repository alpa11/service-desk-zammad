import { query } from '../config/database';

interface StatisticsFilters {
  from_date?: string;
  to_date?: string;
  branch_id?: number;
  housekeeper_id?: number;
}

export const statisticsService = {
  async getStatistics(filters: StatisticsFilters) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.from_date) {
      conditions.push(`t.created_at >= $${paramIndex++}`);
      params.push(filters.from_date);
    }
    if (filters.to_date) {
      conditions.push(`t.created_at <= $${paramIndex++}`);
      params.push(filters.to_date + ' 23:59:59');
    }
    if (filters.branch_id) {
      conditions.push(`t.branch_id = $${paramIndex++}`);
      params.push(filters.branch_id);
    }
    if (filters.housekeeper_id) {
      conditions.push(`t.housekeeper_id = $${paramIndex++}`);
      params.push(filters.housekeeper_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get totals
    const totalsResult = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as created_today,
        COUNT(*) FILTER (WHERE DATE(closed_at) = CURRENT_DATE) as closed_today,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) as created_this_week,
        COUNT(*) FILTER (WHERE closed_at >= DATE_TRUNC('week', CURRENT_DATE)) as closed_this_week,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as created_this_month,
        COUNT(*) FILTER (WHERE closed_at >= DATE_TRUNC('month', CURRENT_DATE)) as closed_this_month,
        AVG(EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600) FILTER (WHERE closed_at IS NOT NULL) as avg_handling_time
      FROM tickets t
      ${whereClause}`,
      params
    );

    const totals = totalsResult.rows[0];

    // Get by issue type
    const byIssueTypeResult = await query(
      `SELECT
        it.name as issue_type,
        COUNT(*) as count
      FROM tickets t
      JOIN issue_types it ON t.issue_type_id = it.id
      ${whereClause}
      GROUP BY it.id, it.name
      ORDER BY count DESC`,
      params
    );

    // Get by branch
    const byBranchResult = await query(
      `SELECT
        b.name as branch,
        COUNT(*) FILTER (WHERE t.status = 'open') as open,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status = 'closed') as closed
      FROM tickets t
      JOIN branches b ON t.branch_id = b.id
      ${whereClause}
      GROUP BY b.id, b.name
      ORDER BY b.name`,
      params
    );

    // Get by housekeeper
    const byHousekeeperResult = await query(
      `SELECT
        u.first_name || ' ' || u.last_name as housekeeper,
        COUNT(*) FILTER (WHERE t.status = 'open') as open,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status = 'closed') as closed,
        AVG(EXTRACT(EPOCH FROM (t.closed_at - t.created_at)) / 3600) FILTER (WHERE t.closed_at IS NOT NULL) as avg_handling_time
      FROM tickets t
      JOIN users u ON t.housekeeper_id = u.id
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY open DESC`,
      params
    );

    return {
      totals: {
        all: parseInt(totals.total, 10),
        open: parseInt(totals.open, 10),
        in_progress: parseInt(totals.in_progress, 10),
        closed: parseInt(totals.closed, 10),
      },
      today: {
        created: parseInt(totals.created_today, 10),
        closed: parseInt(totals.closed_today, 10),
      },
      this_week: {
        created: parseInt(totals.created_this_week, 10),
        closed: parseInt(totals.closed_this_week, 10),
      },
      this_month: {
        created: parseInt(totals.created_this_month, 10),
        closed: parseInt(totals.closed_this_month, 10),
      },
      average_handling_time_hours: totals.avg_handling_time
        ? parseFloat(totals.avg_handling_time).toFixed(1)
        : null,
      by_issue_type: byIssueTypeResult.rows.map((r) => ({
        issue_type: r.issue_type,
        count: parseInt(r.count, 10),
      })),
      by_branch: byBranchResult.rows.map((r) => ({
        branch: r.branch,
        open: parseInt(r.open, 10),
        in_progress: parseInt(r.in_progress, 10),
        closed: parseInt(r.closed, 10),
      })),
      by_housekeeper: byHousekeeperResult.rows.map((r) => ({
        housekeeper: r.housekeeper,
        open: parseInt(r.open, 10),
        in_progress: parseInt(r.in_progress, 10),
        closed: parseInt(r.closed, 10),
        avg_handling_time_hours: r.avg_handling_time
          ? parseFloat(r.avg_handling_time).toFixed(1)
          : null,
      })),
    };
  },

  async getMyDashboard(userId: number) {
    const result = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
        COUNT(*) FILTER (WHERE DATE(closed_at) = CURRENT_DATE) as closed_today,
        COUNT(*) FILTER (WHERE closed_at >= DATE_TRUNC('week', CURRENT_DATE)) as closed_this_week
      FROM tickets
      WHERE housekeeper_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    const byBranchResult = await query(
      `SELECT
        b.name as branch,
        COUNT(*) FILTER (WHERE t.status = 'open') as open,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress
      FROM tickets t
      JOIN branches b ON t.branch_id = b.id
      WHERE t.housekeeper_id = $1 AND t.status IN ('open', 'in_progress')
      GROUP BY b.id, b.name
      ORDER BY open DESC, in_progress DESC`,
      [userId]
    );

    return {
      open_tickets: parseInt(stats.open_tickets, 10),
      in_progress_tickets: parseInt(stats.in_progress_tickets, 10),
      closed_today: parseInt(stats.closed_today, 10),
      closed_this_week: parseInt(stats.closed_this_week, 10),
      tickets_by_branch: byBranchResult.rows.map((r) => ({
        branch: r.branch,
        open: parseInt(r.open, 10),
        in_progress: parseInt(r.in_progress, 10),
      })),
    };
  },
};
