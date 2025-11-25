import type {
  Criterion,
  Guideline,
  Language,
  PaginatedResult,
  QueryFilters,
  Term,
  TranslatedPrinciple,
} from './types';

const API_BASE = import.meta.env.PROD ? 'https://api.wcag.be/api' : '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getCriteria(
  filters: QueryFilters
): Promise<PaginatedResult<Criterion>> {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  if (filters.guideline_id) params.append('guideline_id', filters.guideline_id);
  if (filters.tag_id !== undefined)
    params.append('tag_id', String(filters.tag_id));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
  if (filters.lang) params.append('lang', filters.lang);

  // Handle array params
  filters.principle?.forEach((p) => params.append('principle', p));
  filters.level?.forEach((l) => params.append('level', l));
  filters.version?.forEach((v) => params.append('version', v));

  const url = `${API_BASE}/criteria?${params.toString()}`;
  return fetchJson<PaginatedResult<Criterion>>(url);
}

export async function getCriterionById(id: string, lang?: string): Promise<Criterion> {
  const params = lang ? `?lang=${lang}` : '';
  return fetchJson<Criterion>(`${API_BASE}/criteria/${encodeURIComponent(id)}${params}`);
}

export async function getPrinciples(lang?: string): Promise<string[] | TranslatedPrinciple[]> {
  const params = lang && lang !== 'en' ? `?lang=${lang}` : '';
  return fetchJson<string[] | TranslatedPrinciple[]>(`${API_BASE}/principles${params}`);
}

export async function getGuidelines(lang?: string): Promise<Guideline[]> {
  const params = lang && lang !== 'en' ? `?lang=${lang}` : '';
  return fetchJson<Guideline[]>(`${API_BASE}/guidelines${params}`);
}

export async function getVersions(): Promise<string[]> {
  return fetchJson<string[]>(`${API_BASE}/versions`);
}

export async function getLevels(): Promise<string[]> {
  return fetchJson<string[]>(`${API_BASE}/levels`);
}

export async function getTerms(): Promise<Term[]> {
  return fetchJson<Term[]>(`${API_BASE}/terms`);
}

export async function getLanguages(): Promise<Language[]> {
  return fetchJson<Language[]>(`${API_BASE}/languages`);
}
