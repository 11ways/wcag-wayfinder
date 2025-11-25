import { getDb } from '@wcag-explorer/db/src/client';
import type { Database } from 'bun:sqlite';

export async function handleAdminRoutes(url: URL, req: Request, db: Database): Promise<Response | null> {
  const pathname = url.pathname;

  // Helper for JSON responses
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const errorResponse = (message: string, status = 400) => {
    return jsonResponse({ error: message }, status);
  };

  // ============================================================================
  // METADATA RELATIONSHIP ENDPOINTS
  // ============================================================================

  // POST /admin/metadata/criteria/:id/affected-users
  const affectedUsersMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/affected-users$/);
  if (affectedUsersMatch && req.method === 'POST') {
    const criterionId = decodeURIComponent(affectedUsersMatch[1]);
    const body = await req.json();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO criteria_affected_users
      (criterion_id, affected_user_id, relevance_score, rank_order, reasoning, reviewed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      criterionId,
      body.affected_user_id,
      body.relevance_score,
      body.rank_order || null,
      body.reasoning || null,
      body.reviewed || 0
    );

    return jsonResponse({ success: true });
  }

  // DELETE /admin/metadata/criteria/:criterionId/affected-users/:userId
  const deleteAffectedUserMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/affected-users\/(\d+)$/);
  if (deleteAffectedUserMatch && req.method === 'DELETE') {
    const criterionId = decodeURIComponent(deleteAffectedUserMatch[1]);
    const userId = parseInt(deleteAffectedUserMatch[2], 10);

    const stmt = db.prepare('DELETE FROM criteria_affected_users WHERE criterion_id = ? AND affected_user_id = ?');
    stmt.run(criterionId, userId);

    return jsonResponse({ success: true });
  }

  // POST /admin/metadata/criteria/:id/assignees
  const assigneesMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/assignees$/);
  if (assigneesMatch && req.method === 'POST') {
    const criterionId = decodeURIComponent(assigneesMatch[1]);
    const body = await req.json();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO criteria_assignees
      (criterion_id, assignee_id, relevance_score, rank_order, reasoning, reviewed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      criterionId,
      body.assignee_id,
      body.relevance_score,
      body.rank_order || null,
      body.reasoning || null,
      body.reviewed || 0
    );

    return jsonResponse({ success: true });
  }

  // DELETE /admin/metadata/criteria/:criterionId/assignees/:assigneeId
  const deleteAssigneeMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/assignees\/(\d+)$/);
  if (deleteAssigneeMatch && req.method === 'DELETE') {
    const criterionId = decodeURIComponent(deleteAssigneeMatch[1]);
    const assigneeId = parseInt(deleteAssigneeMatch[2], 10);

    const stmt = db.prepare('DELETE FROM criteria_assignees WHERE criterion_id = ? AND assignee_id = ?');
    stmt.run(criterionId, assigneeId);

    return jsonResponse({ success: true });
  }

  // POST /admin/metadata/criteria/:id/technologies
  const technologiesMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/technologies$/);
  if (technologiesMatch && req.method === 'POST') {
    const criterionId = decodeURIComponent(technologiesMatch[1]);
    const body = await req.json();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO criteria_technologies
      (criterion_id, technology_id, relevance_score, rank_order, reasoning, reviewed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      criterionId,
      body.technology_id,
      body.relevance_score,
      body.rank_order || null,
      body.reasoning || null,
      body.reviewed || 0
    );

    return jsonResponse({ success: true });
  }

  // DELETE /admin/metadata/criteria/:criterionId/technologies/:technologyId
  const deleteTechnologyMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/technologies\/(\d+)$/);
  if (deleteTechnologyMatch && req.method === 'DELETE') {
    const criterionId = decodeURIComponent(deleteTechnologyMatch[1]);
    const technologyId = parseInt(deleteTechnologyMatch[2], 10);

    const stmt = db.prepare('DELETE FROM criteria_technologies WHERE criterion_id = ? AND technology_id = ?');
    stmt.run(criterionId, technologyId);

    return jsonResponse({ success: true });
  }

  // POST /admin/metadata/criteria/:id/tags
  const tagsMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/tags$/);
  if (tagsMatch && req.method === 'POST') {
    const criterionId = decodeURIComponent(tagsMatch[1]);
    const body = await req.json();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO criteria_tags
      (criterion_id, tag_id, relevance_score, rank_order, reasoning, reviewed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      criterionId,
      body.tag_id,
      body.relevance_score,
      body.rank_order || null,
      body.reasoning || null,
      body.reviewed || 0
    );

    return jsonResponse({ success: true });
  }

  // DELETE /admin/metadata/criteria/:criterionId/tags/:tagId
  const deleteTagMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/tags\/(\d+)$/);
  if (deleteTagMatch && req.method === 'DELETE') {
    const criterionId = decodeURIComponent(deleteTagMatch[1]);
    const tagId = parseInt(deleteTagMatch[2], 10);

    const stmt = db.prepare('DELETE FROM criteria_tags WHERE criterion_id = ? AND tag_id = ?');
    stmt.run(criterionId, tagId);

    return jsonResponse({ success: true });
  }

  // ============================================================================
  // BULK UPDATE ENDPOINTS
  // ============================================================================

  // PUT /admin/metadata/criteria/:id/rank
  const rankMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/rank$/);
  if (rankMatch && req.method === 'PUT') {
    const criterionId = decodeURIComponent(rankMatch[1]);
    const body = await req.json();
    const { type, rankings } = body; // type: 'affected_users' | 'assignees' | 'technologies' | 'tags'

    const tableName = `criteria_${type}`;
    const idColumn = type === 'affected_users' ? 'affected_user_id' :
                     type === 'assignees' ? 'assignee_id' :
                     type === 'technologies' ? 'technology_id' :
                     'tag_id';

    const stmt = db.prepare(`
      UPDATE ${tableName}
      SET rank_order = ?
      WHERE criterion_id = ? AND ${idColumn} = ?
    `);

    for (const [itemId, rankOrder] of Object.entries(rankings)) {
      stmt.run(rankOrder, criterionId, parseInt(itemId, 10));
    }

    return jsonResponse({ success: true });
  }

  // PUT /admin/metadata/criteria/:id/review
  const reviewMatch = pathname.match(/^\/admin\/metadata\/criteria\/([^\/]+)\/review$/);
  if (reviewMatch && req.method === 'PUT') {
    const criterionId = decodeURIComponent(reviewMatch[1]);
    const body = await req.json();
    const { type, reviewed } = body;

    const tableName = `criteria_${type}`;

    const stmt = db.prepare(`
      UPDATE ${tableName}
      SET reviewed = ?
      WHERE criterion_id = ?
    `);

    stmt.run(reviewed ? 1 : 0, criterionId);

    return jsonResponse({ success: true });
  }

  // Not an admin route we handle
  return null;
}
