const API_BASE = '/api';
const ADMIN_BASE = '/admin';

// Get admin password from environment or prompt user
let adminPassword: string | null = null;

export function setAdminPassword(password: string) {
  adminPassword = password;
}

async function fetchAdmin<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!adminPassword) {
    throw new Error('Admin password not set. Call setAdminPassword() first.');
  }

  headers.set('Authorization', `Bearer ${adminPassword}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Metadata types
export type MetadataType =
  | 'affected_users'
  | 'assignees'
  | 'technologies'
  | 'tags';

export interface MetadataUpdate {
  relevance_score: number;
  rank_order?: number;
  reasoning?: string;
  reviewed?: boolean;
}

// Add metadata to a criterion
export async function addCriterionMetadata(
  criterionId: string,
  type: MetadataType,
  itemId: number,
  data: MetadataUpdate
): Promise<void> {
  const typeMap: Record<MetadataType, string> = {
    affected_users: 'affected-users',
    assignees: 'assignees',
    technologies: 'technologies',
    tags: 'tags',
  };

  const idMap: Record<MetadataType, string> = {
    affected_users: 'affected_user_id',
    assignees: 'assignee_id',
    technologies: 'technology_id',
    tags: 'tag_id',
  };

  await fetchAdmin(
    `${ADMIN_BASE}/metadata/criteria/${encodeURIComponent(criterionId)}/${typeMap[type]}`,
    {
      method: 'POST',
      body: JSON.stringify({
        [idMap[type]]: itemId,
        ...data,
      }),
    }
  );
}

// Remove metadata from a criterion
export async function removeCriterionMetadata(
  criterionId: string,
  type: MetadataType,
  itemId: number
): Promise<void> {
  const typeMap: Record<MetadataType, string> = {
    affected_users: 'affected-users',
    assignees: 'assignees',
    technologies: 'technologies',
    tags: 'tags',
  };

  await fetchAdmin(
    `${ADMIN_BASE}/metadata/criteria/${encodeURIComponent(criterionId)}/${typeMap[type]}/${itemId}`,
    {
      method: 'DELETE',
    }
  );
}

// Update rankings for a metadata type
export async function updateCriterionRankings(
  criterionId: string,
  type: MetadataType,
  rankings: Record<number, number> // itemId -> rank_order
): Promise<void> {
  await fetchAdmin(
    `${ADMIN_BASE}/metadata/criteria/${encodeURIComponent(criterionId)}/rank`,
    {
      method: 'PUT',
      body: JSON.stringify({
        type,
        rankings,
      }),
    }
  );
}

// Mark metadata as reviewed
export async function markCriterionReviewed(
  criterionId: string,
  type: MetadataType,
  reviewed: boolean
): Promise<void> {
  await fetchAdmin(
    `${ADMIN_BASE}/metadata/criteria/${encodeURIComponent(criterionId)}/review`,
    {
      method: 'PUT',
      body: JSON.stringify({
        type,
        reviewed,
      }),
    }
  );
}

// Get all reference data for dropdowns
export async function getAffectedUsers() {
  const response = await fetch(`${API_BASE}/metadata/affected-users`);
  return response.json();
}

export async function getAssignees() {
  const response = await fetch(`${API_BASE}/metadata/assignees`);
  return response.json();
}

export async function getTechnologies() {
  const response = await fetch(`${API_BASE}/metadata/technologies`);
  return response.json();
}

export async function getTags() {
  const response = await fetch(`${API_BASE}/metadata/tags`);
  return response.json();
}
