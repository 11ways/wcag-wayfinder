import {
  queryCriteria,
  queryCriteriaWithMetadata,
  getCriterionById,
  getPrinciples,
  getGuidelines,
  getVersions,
  getLevels,
  getAffectedUsers,
  getAssignees,
  getTechnologies,
  getTags,
  getTagsByCategory,
  getCriterionWithMetadata,
  getTerms,
  getDb,
  getLanguages,
  getAllCriteriaWithTranslations,
  getCriterionWithMetadataAndTranslation,
  getTranslatedPrinciples,
  getTranslatedGuidelines
} from '@wcag-explorer/db/src/client';
import { handleAdminRoutes } from './admin-routes';

const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

// CORS headers
function corsHeaders(origin: string | null, isAdmin = false): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': isAdmin ? 'GET, POST, PUT, DELETE, OPTIONS' : 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Admin authentication middleware
function requireAuth(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return false;

  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Bearer') return false;

  return credentials === ADMIN_PASSWORD;
}

// JSON response helper
function jsonResponse(data: any, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

// Error response helper
function errorResponse(message: string, status = 400, origin: string | null = null): Response {
  return jsonResponse({ error: message }, status, origin);
}

// Parse query params helper
function parseQueryParams(url: URL): Record<string, any> {
  const params: Record<string, any> = {};

  for (const [key, value] of url.searchParams.entries()) {
    // Handle multi-value params (e.g., ?level=A&level=AA)
    if (params[key]) {
      params[key] = Array.isArray(params[key]) ? [...params[key], value] : [params[key], value];
    } else {
      params[key] = value;
    }
  }

  return params;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');

    // Handle CORS preflight
    const isAdminRoute = url.pathname.startsWith('/admin/');
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, isAdminRoute),
      });
    }

    // Admin authentication for protected routes
    if (isAdminRoute) {
      if (!requireAuth(req)) {
        return errorResponse('Unauthorized', 401, origin);
      }
    }

    // Only allow GET requests for public routes
    if (!isAdminRoute && req.method !== 'GET') {
      return errorResponse('Method not allowed', 405, origin);
    }

    try {
      // GET /api/criteria - Query with filters
      // Supports ?lang=nl for translations
      if (url.pathname === '/api/criteria') {
        const params = parseQueryParams(url);
        const lang = params.lang || 'en';

        const filters = {
          q: params.q,
          principle: params.principle,
          guideline_id: params.guideline_id,
          level: params.level,
          version: params.version,
          tag_id: params.tag_id ? parseInt(params.tag_id, 10) : undefined,
          page: params.page ? parseInt(params.page, 10) : 1,
          pageSize: params.pageSize ? Math.min(parseInt(params.pageSize, 10), 100) : 25,
        };

        // If a language is specified (not English), return with translations
        // Note: This endpoint still uses queryCriteriaWithMetadata for filtering/pagination
        // Translations are fetched separately and merged for better performance
        const result = queryCriteriaWithMetadata(filters);

        // If language is not English, merge in translations
        if (lang !== 'en') {
          const translationsMap = new Map(
            getAllCriteriaWithTranslations(lang).map(t => [t.id, t])
          );

          result.items = result.items.map(item => {
            const translation = translationsMap.get(item.id);
            return {
              ...item,
              translated_handle: translation?.translated_handle,
              translated_title: translation?.translated_title,
              translated_principle_handle: translation?.translated_principle_handle,
              translated_guideline_handle: translation?.translated_guideline_handle,
              has_translation: translation?.has_translation ?? false,
              translation_language: translation?.translation_language ?? 'en',
              translation_source_url: translation?.translation_source_url
            };
          });
        } else {
          // For English, add has_translation: true to all items
          result.items = result.items.map(item => ({
            ...item,
            has_translation: true,
            translation_language: 'en'
          }));
        }

        return jsonResponse(result, 200, origin);
      }

      // GET /api/criteria/:id - Get single criterion
      // Supports ?lang=nl for translations
      const criterionMatch = url.pathname.match(/^\/api\/criteria\/([^\/]+)$/);
      if (criterionMatch) {
        const id = decodeURIComponent(criterionMatch[1]);
        const params = parseQueryParams(url);
        const lang = params.lang || 'en';

        const criterion = getCriterionWithMetadataAndTranslation(id, lang);

        if (!criterion) {
          return errorResponse('Criterion not found', 404, origin);
        }

        return jsonResponse(criterion, 200, origin);
      }

      // GET /api/principles
      // Supports ?lang=nl for translations
      if (url.pathname === '/api/principles') {
        const params = parseQueryParams(url);
        const lang = params.lang || 'en';

        if (lang === 'en') {
          // Return simple string array for backward compatibility
          const principles = getPrinciples();
          return jsonResponse(principles, 200, origin);
        }

        // Return translated principles with both English and translated names
        const translatedPrinciples = getTranslatedPrinciples(lang);
        return jsonResponse(translatedPrinciples, 200, origin);
      }

      // GET /api/guidelines
      // Supports ?lang=nl for translations
      if (url.pathname === '/api/guidelines') {
        const params = parseQueryParams(url);
        const lang = params.lang || 'en';

        if (lang === 'en') {
          // Return standard guidelines for backward compatibility
          const guidelines = getGuidelines();
          return jsonResponse(guidelines, 200, origin);
        }

        // Return translated guidelines
        const translatedGuidelines = getTranslatedGuidelines(lang);
        return jsonResponse(translatedGuidelines, 200, origin);
      }

      // GET /api/versions
      if (url.pathname === '/api/versions') {
        const versions = getVersions();
        return jsonResponse(versions, 200, origin);
      }

      // GET /api/levels
      if (url.pathname === '/api/levels') {
        const levels = getLevels();
        return jsonResponse(levels, 200, origin);
      }

      // GET /api/languages - Get available translation languages
      if (url.pathname === '/api/languages') {
        const languages = getLanguages();
        return jsonResponse(languages, 200, origin);
      }

      // GET /api/metadata/affected-users
      if (url.pathname === '/api/metadata/affected-users') {
        const affectedUsers = getAffectedUsers();
        return jsonResponse(affectedUsers, 200, origin);
      }

      // GET /api/metadata/assignees
      if (url.pathname === '/api/metadata/assignees') {
        const assignees = getAssignees();
        return jsonResponse(assignees, 200, origin);
      }

      // GET /api/metadata/technologies
      if (url.pathname === '/api/metadata/technologies') {
        const technologies = getTechnologies();
        return jsonResponse(technologies, 200, origin);
      }

      // GET /api/metadata/tags
      if (url.pathname === '/api/metadata/tags') {
        const tags = getTags();
        return jsonResponse(tags, 200, origin);
      }

      // GET /api/metadata/tags-by-category
      if (url.pathname === '/api/metadata/tags-by-category') {
        const tagsByCategory = getTagsByCategory();
        return jsonResponse(tagsByCategory, 200, origin);
      }

      // GET /api/terms
      if (url.pathname === '/api/terms') {
        const terms = getTerms();
        return jsonResponse(terms, 200, origin);
      }

      // GET /api/criteria/:id/metadata
      const criterionMetadataMatch = url.pathname.match(/^\/api\/criteria\/([^\/]+)\/metadata$/);
      if (criterionMetadataMatch) {
        const id = decodeURIComponent(criterionMetadataMatch[1]);
        const criterion = getCriterionWithMetadata(id);

        if (!criterion) {
          return errorResponse('Criterion not found', 404, origin);
        }

        return jsonResponse(criterion, 200, origin);
      }

      // Handle admin routes
      if (isAdminRoute) {
        const adminResponse = await handleAdminRoutes(url, req, getDb());
        if (adminResponse) {
          // Add CORS headers to admin response
          const headers = new Headers(adminResponse.headers);
          const corsHeadersObj = corsHeaders(origin, true);
          for (const [key, value] of Object.entries(corsHeadersObj)) {
            headers.set(key, value);
          }
          return new Response(adminResponse.body, {
            status: adminResponse.status,
            headers
          });
        }
      }

      // 404 - Not found
      return errorResponse('Not found', 404, origin);

    } catch (error) {
      console.error('Server error:', error);
      return errorResponse(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : String(error),
        500,
        origin
      );
    }
  },
});

console.log(`🚀 API server running at http://localhost:${PORT}`);
