-- Migration: Create view for criteria with aggregated metadata
-- This eliminates N+1 queries by fetching all metadata in a single query

-- Drop existing view if it exists
DROP VIEW IF EXISTS criteria_with_metadata;

-- Create view with aggregated metadata using JSON functions
CREATE VIEW criteria_with_metadata AS
SELECT
  c.*,
  -- Affected users as JSON array
  (
    SELECT json_group_array(
      json_object(
        'id', au.id,
        'name', au.name,
        'description', au.description,
        'slug', au.slug,
        'icon', au.icon,
        'relevance_score', cau.relevance_score,
        'rank_order', cau.rank_order,
        'reasoning', cau.reasoning,
        'reviewed', cau.reviewed
      )
    )
    FROM criteria_affected_users cau
    JOIN affected_users au ON cau.affected_user_id = au.id
    WHERE cau.criterion_id = c.id
    ORDER BY cau.rank_order, cau.relevance_score DESC
  ) as affected_users_json,
  -- Assignees as JSON array
  (
    SELECT json_group_array(
      json_object(
        'id', a.id,
        'name', a.name,
        'description', a.description,
        'slug', a.slug,
        'icon', a.icon,
        'relevance_score', ca.relevance_score,
        'rank_order', ca.rank_order,
        'reasoning', ca.reasoning,
        'reviewed', ca.reviewed
      )
    )
    FROM criteria_assignees ca
    JOIN assignees a ON ca.assignee_id = a.id
    WHERE ca.criterion_id = c.id
    ORDER BY ca.rank_order, ca.relevance_score DESC
  ) as assignees_json,
  -- Technologies as JSON array
  (
    SELECT json_group_array(
      json_object(
        'id', t.id,
        'name', t.name,
        'description', t.description,
        'slug', t.slug,
        'icon', t.icon,
        'relevance_score', ct.relevance_score,
        'rank_order', ct.rank_order,
        'reasoning', ct.reasoning,
        'reviewed', ct.reviewed
      )
    )
    FROM criteria_technologies ct
    JOIN technologies t ON ct.technology_id = t.id
    WHERE ct.criterion_id = c.id
    ORDER BY ct.rank_order, ct.relevance_score DESC
  ) as technologies_json,
  -- Tags as JSON array
  (
    SELECT json_group_array(
      json_object(
        'id', tr.id,
        'name', tr.name,
        'description', tr.description,
        'slug', tr.slug,
        'category', tr.category,
        'icon', tr.icon,
        'relevance_score', ctg.relevance_score,
        'rank_order', ctg.rank_order,
        'reasoning', ctg.reasoning,
        'reviewed', ctg.reviewed
      )
    )
    FROM criteria_tags ctg
    JOIN tags_reference tr ON ctg.tag_id = tr.id
    WHERE ctg.criterion_id = c.id
    ORDER BY ctg.rank_order, ctg.relevance_score DESC
  ) as tags_json
FROM criteria c;
