# WCAG Explorer - System Architecture

## Overview

WCAG Explorer is a monorepo application for browsing and filtering WCAG 2.2 success criteria with AI-generated metadata. The system consists of three main packages:

- **apps/api**: Bun-based REST API server
- **apps/web**: React + Vite frontend application
- **packages/db**: Shared SQLite database client with TypeScript types
- **packages/ai**: AI-powered metadata generation scripts

## Routing System

### URL Structure

The application uses a **path-based routing system** where filters are encoded in the URL path as segments, not query parameters. This provides clean, bookmarkable URLs.

#### URL Pattern

```
/{filter1:value1}/{filter2:value2+value3}/
```

#### Supported Filter Segments

| Segment | Format | Example | Description |
|---------|--------|---------|-------------|
| `version` | `version:X-Y` | `version:2-2` | WCAG version (2.0, 2.1, 2.2) |
| `level` | `level:x+y` | `level:a+aa` | Conformance level (A, AA, AAA) |
| `principle` | `principle:x+y` | `principle:p+o` | WCAG principles (p=Perceivable, o=Operable, u=Understandable, r=Robust) |
| `guideline` | `guideline:X-Y` | `guideline:1-2` | Specific guideline number |
| `tag` | `tag:ID` | `tag:1` | Filter by metadata tag ID |

#### Default Values

When no segments are present (`/`), these defaults apply:
- **version**: `2.2`
- **level**: `A`, `AA`
- **principle**: All principles
- **guideline**: No filter
- **tag**: No filter

Default values are **omitted from the URL** to keep URLs clean.

### URL Examples

```
/                              → Default: WCAG 2.2, Levels A+AA, All principles
/level:a/                      → Only Level A
/version:2-1/                  → WCAG 2.1, Levels A+AA
/principle:p+o/                → Perceivable + Operable principles
/guideline:1-2/                → Guideline 1.2 (Time-based Media)
/tag:1/                        → Criteria tagged with ID 1 (Alternative text)
/level:a+aa/principle:p/tag:5/ → Combined filters
```

### URL Encoding Rules

1. **Dots to Dashes**: Version and guideline numbers use dashes instead of dots
   - `2.2` → `2-2`
   - `1.4` → `1-4`

2. **Plus for Multiple Values**: Multiple values joined with `+`
   - Levels A and AA → `level:a+aa`
   - Versions 2.1 and 2.2 → `version:2-1+2-2`

3. **Short Codes**: Principles use single-letter codes
   - Perceivable → `p`
   - Operable → `o`
   - Understandable → `u`
   - Robust → `r`

4. **Lowercase**: All filter values are lowercase in URLs

### Implementation Files

**apps/web/src/lib/urlUtils.ts**
Contains the URL parsing and building logic:

- `parseURL(pathname, search)` - Converts URL path to QueryFilters object
- `buildURL(filters)` - Converts QueryFilters to canonical URL path
- `mergeWithDefaults(urlFilters)` - Applies default values to partial filters
- `getDefaultFilters()` - Returns default filter configuration

**apps/web/src/App.tsx**
Handles URL synchronization:

- Reads URL on mount and populates filters
- Updates URL when filters change (via `pushState`)
- Handles browser back/forward navigation (via `popstate`)

## Filtering System

### Frontend Flow

1. **URL Parsing**: `parseURL()` extracts filters from current URL path
2. **Merge Defaults**: `mergeWithDefaults()` fills in missing default values
3. **API Request**: `getCriteria()` sends filters as query parameters to API
4. **Display Results**: React components render filtered criteria list

### Backend Query Construction

**packages/db/src/client.ts** - `queryCriteria()` function

The database client builds dynamic SQL queries based on provided filters:

```typescript
function queryCriteria(filters: QueryFilters): PaginatedResult<Criterion> {
  let whereClauses: string[] = [];
  let params: any = {};

  // Full-text search
  if (q) {
    whereClauses.push(`c.rowid IN (SELECT rowid FROM criteria_fts WHERE criteria_fts MATCH $q)`);
    params.$q = q;
  }

  // Principle filter (supports multiple)
  if (principle) {
    const principles = Array.isArray(principle) ? principle : [principle];
    whereClauses.push(`c.principle IN (${principles.map((_, i) => `$principle${i}`).join(',')})`);
    principles.forEach((p, i) => params[`$principle${i}`] = p);
  }

  // Tag filter (joins through criteria_tags table)
  if (tag_id !== undefined) {
    whereClauses.push(`c.id IN (SELECT criterion_id FROM criteria_tags WHERE tag_id = $tag_id)`);
    params.$tag_id = tag_id;
  }

  // ... other filters

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Build and execute query
  const query = `
    SELECT c.*
    FROM criteria c
    ${whereClause}
    LIMIT $limit OFFSET $offset
  `;
}
```

### API Endpoints

**GET /api/criteria**
Returns paginated list of criteria with metadata.

Query Parameters:
- `q` (string): Full-text search query
- `principle` (string|array): Filter by principle(s)
- `guideline_id` (string): Filter by guideline
- `level` (string|array): Filter by conformance level(s)
- `version` (string|array): Filter by WCAG version(s)
- `tag_id` (number): Filter by metadata tag ID
- `page` (number): Page number (default: 1)
- `pageSize` (number): Results per page (default: 25, max: 100)

Response:
```json
{
  "items": [/* CriterionWithMetadata[] */],
  "total": 87,
  "page": 1,
  "pageSize": 25,
  "totalPages": 4
}
```

**GET /api/criteria/:id**
Returns single criterion by ID without metadata.

**GET /api/criteria/:id/metadata**
Returns single criterion with all metadata attached.

**GET /api/principles**
Returns list of WCAG principles.

**GET /api/guidelines**
Returns list of WCAG guidelines with principles.

**GET /api/versions**
Returns available WCAG versions.

**GET /api/levels**
Returns conformance levels (A, AA, AAA).

**GET /api/metadata/affected-users**
Returns all affected user types.

**GET /api/metadata/assignees**
Returns all assignee roles.

**GET /api/metadata/technologies**
Returns all technologies.

**GET /api/metadata/tags**
Returns all tags.

**GET /api/metadata/tags-by-category**
Returns tags grouped by category.

## Database Schema

### Core Tables

**criteria** - WCAG success criteria
```sql
- id (TEXT PRIMARY KEY)         - Criterion ID (e.g., "non-text-content")
- num (TEXT)                     - Number (e.g., "1.1.1")
- title (TEXT)                   - Criterion title
- description (TEXT)             - Plain text description
- level (TEXT)                   - Conformance level (A, AA, AAA)
- version (TEXT)                 - WCAG version (2.0, 2.1, 2.2)
- principle (TEXT)               - Principle name
- principle_id (TEXT)            - Principle slug
- guideline_id (TEXT)            - Guideline number (1.1, 1.2, etc.)
- guideline_title (TEXT)         - Guideline title
- handle (TEXT)                  - Short name
- content (TEXT)                 - Full HTML content
- how_to_meet (TEXT)             - URL to "How to Meet" guide
- understanding (TEXT)           - URL to Understanding document
```

**criteria_fts** - Full-text search index (FTS5)
```sql
- Indexed columns: id, num, title, description, handle, content
- Tokenizer: unicode61
```

### Metadata Reference Tables

**affected_users** - User groups affected by criteria
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- slug (TEXT UNIQUE)
- icon (TEXT)                    - Emoji icon
- created_at (TEXT)
- updated_at (TEXT)
```

**assignees** - Roles responsible for implementation
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- slug (TEXT UNIQUE)
- icon (TEXT)
- created_at (TEXT)
- updated_at (TEXT)
```

**technologies** - Technologies involved in implementation
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- slug (TEXT UNIQUE)
- icon (TEXT)
- created_at (TEXT)
- updated_at (TEXT)
```

**tags_reference** - Categorical tags for criteria
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- slug (TEXT UNIQUE)
- category (TEXT)                - Tag category (content, technical, visual, etc.)
- icon (TEXT)
- created_at (TEXT)
- updated_at (TEXT)
```

### Junction Tables (Many-to-Many with Scoring)

All junction tables include AI-generated relevance scores:

**criteria_affected_users**
```sql
- id (INTEGER PRIMARY KEY)
- criterion_id (TEXT)            - FK to criteria.id
- affected_user_id (INTEGER)     - FK to affected_users.id
- relevance_score (REAL)         - 0.0 to 1.0 (AI-generated)
- rank_order (INTEGER)           - Optional manual ranking
- reasoning (TEXT)               - AI explanation
- reviewed (BOOLEAN)             - Human review flag
- created_at (TEXT)
- updated_at (TEXT)
```

Similar structure for:
- **criteria_assignees**
- **criteria_technologies**
- **criteria_tags**

### Database Location

```
/Users/roelvangils/wcag-json/wcag-repo/wcag-explorer/data/wcag.sqlite
```

The database path is resolved from the workspace root in `packages/db/src/client.ts`.

## Metadata System

### AI-Generated Metadata

Each WCAG criterion is enriched with four categories of AI-generated metadata:

1. **Affected Users**: User groups impacted by the criterion
2. **Assignees**: Roles responsible for implementation
3. **Technologies**: Technologies involved in compliance
4. **Tags**: Categorical tags for browsing and filtering

### Relevance Scoring

Each metadata relationship includes:
- **relevance_score** (0.0-1.0): AI-generated relevance rating
- **rank_order**: Optional manual ordering
- **reasoning**: AI explanation for the relationship
- **reviewed**: Flag for human verification

### Generation Process

**packages/ai/src/cli-generate.ts**

Metadata generation uses multiple AI providers (Claude, GPT-4):

```bash
# Generate metadata for all criteria
bun run packages/ai/src/cli-generate.ts --all

# Generate for specific criterion
bun run packages/ai/src/cli-generate.ts --criterion non-text-content

# Regenerate existing metadata
bun run packages/ai/src/cli-generate.ts --all --force
```

The AI analyzes:
- Criterion title and description
- Success Criterion content
- "How to Meet" guidelines
- Understanding documents

It then assigns relevant metadata with confidence scores.

### Display in UI

**apps/web/src/components/CriterionCard.tsx**

Metadata is displayed in the expandable details section:

- **Tags**: Gray pills with icons, clickable links to filter by tag
- **Affects**: Blue pills with user icons
- **Responsibility**: Purple pills with role icons
- **Technologies**: Green pills with tech icons

Each pill includes:
- Icon (emoji or symbol)
- Name
- Tooltip with description (via `title` attribute)

Tags are `<a>` links:
```tsx
<a href={`/tag:${tag.id}`} className="...">
  {tag.icon && <span>{tag.icon}</span>}
  {tag.name}
</a>
```

Other metadata types are `<span>` elements (not clickable).

## Frontend Architecture

### Technology Stack

- **React 18**: Component library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Bun**: Package manager and runtime

### Key Components

**App.tsx** - Main application container
- URL synchronization
- Filter state management
- API data fetching
- Keyboard shortcuts (/, f)

**components/Filters.tsx** - Filter sidebar
- Version checkboxes
- Level checkboxes
- Principle checkboxes
- Guideline search
- Reset button

**components/ResultList.tsx** - Criteria list container
- Loading state
- Error state
- Empty state
- List of CriterionCard components

**components/CriterionCard.tsx** - Individual criterion display
- Collapsible details
- Metadata display (tags, users, assignees, technologies)
- Links to W3C documentation
- WCAG ID and level badges

**components/Pagination.tsx** - Page navigation
- Previous/Next buttons
- Direct page links
- Accessible labels

### State Management

State is managed through React hooks:

```typescript
// Filter state
const [filters, setFilters] = useState<QueryFilters>({});

// Search input (separate for debouncing)
const [searchInput, setSearchInput] = useState('');

// API results
const [results, setResults] = useState<PaginatedResult<Criterion>>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 25,
  totalPages: 0,
});

// UI state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Type System

**apps/web/src/lib/types.ts**

Frontend types mirror backend types from `packages/db/src/types.ts`:

```typescript
export interface Criterion {
  id: string;
  num: string;
  title: string;
  // ... core fields
  affected_users?: AffectedUserWithScore[];
  assignees?: AssigneeWithScore[];
  technologies?: TechnologyWithScore[];
  tags?: TagWithScore[];
}

export interface QueryFilters {
  q?: string;
  principle?: string[];
  guideline_id?: string;
  level?: string[];
  version?: string[];
  tag_id?: number;
  page?: number;
  pageSize?: number;
}
```

## Backend Architecture

### Technology Stack

- **Bun**: JavaScript runtime and server
- **SQLite**: Database with FTS5 support
- **TypeScript**: Type safety

### API Server

**apps/api/src/index.ts**

Simple Bun-based HTTP server:

```typescript
const server = Bun.serve({
  port: 8787,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Route handlers
    if (url.pathname === '/api/criteria') {
      const filters = parseQueryParams(url);
      const result = queryCriteriaWithMetadata(filters);
      return jsonResponse(result);
    }

    // ... other routes
  }
});
```

### Database Client

**packages/db/src/client.ts**

Provides functions for querying the SQLite database:

```typescript
// Main query function with metadata
export function queryCriteriaWithMetadata(filters: QueryFilters):
  PaginatedResult<CriterionWithMetadata>

// Single criterion queries
export function getCriterionById(id: string): CriterionWithTags | null
export function getCriterionWithMetadata(id: string): CriterionWithMetadata | null

// Reference data
export function getPrinciples(): WcagPrinciple[]
export function getGuidelines(): Guideline[]
export function getVersions(): string[]
export function getLevels(): WcagLevel[]
export function getAffectedUsers(): AffectedUser[]
export function getAssignees(): Assignee[]
export function getTechnologies(): Technology[]
export function getTags(): Tag[]
export function getTagsByCategory(): Record<string, Tag[]>
```

### CORS Configuration

```typescript
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174'
];
```

## Development Workflow

### Starting the Application

```bash
# Install dependencies
bun install

# Start both API and web servers
bun run dev

# Or start individually
bun run dev:api   # API on :8787
bun run dev:web   # Web on :5173
```

### Project Structure

```
wcag-explorer/
├── apps/
│   ├── api/              # REST API server
│   │   └── src/
│   │       ├── index.ts        # Main server file
│   │       └── admin-routes.ts # Admin endpoints
│   └── web/              # React frontend
│       └── src/
│           ├── App.tsx         # Main component
│           ├── lib/
│           │   ├── api.ts      # API client
│           │   ├── types.ts    # TypeScript types
│           │   └── urlUtils.ts # URL parsing/building
│           └── components/
│               ├── Filters.tsx
│               ├── ResultList.tsx
│               ├── CriterionCard.tsx
│               └── Pagination.tsx
├── packages/
│   ├── db/               # Shared database client
│   │   └── src/
│   │       ├── client.ts       # Query functions
│   │       └── types.ts        # Database types
│   └── ai/               # Metadata generation
│       └── src/
│           └── cli-generate.ts # Generation CLI
└── data/
    └── wcag.sqlite       # SQLite database
```

### Adding New Filters

To add a new filter type:

1. **Update QueryFilters type** in `packages/db/src/types.ts`
```typescript
export interface QueryFilters {
  // ... existing filters
  my_new_filter?: string;
}
```

2. **Update URL parsing** in `apps/web/src/lib/urlUtils.ts`
```typescript
case 'myfilter': {
  filters.my_new_filter = value;
  break;
}
```

3. **Update URL building** in `apps/web/src/lib/urlUtils.ts`
```typescript
if (filters.my_new_filter) {
  segments.push(`myfilter:${filters.my_new_filter}`);
}
```

4. **Update API client** in `apps/web/src/lib/api.ts`
```typescript
if (filters.my_new_filter) {
  params.append('my_new_filter', filters.my_new_filter);
}
```

5. **Update database query** in `packages/db/src/client.ts`
```typescript
if (my_new_filter) {
  whereClauses.push(`c.my_column = $my_new_filter`);
  params.$my_new_filter = my_new_filter;
}
```

### Testing

```bash
# Run backend tests
bun test

# Test API endpoints
curl http://localhost:8787/api/criteria
curl http://localhost:8787/api/criteria/non-text-content
curl "http://localhost:8787/api/criteria?tag_id=1&level=A"

# Test database queries directly
bun run test-metadata.ts
```

## Performance Considerations

### Database Indexing

```sql
CREATE INDEX idx_criteria_principle ON criteria(principle);
CREATE INDEX idx_criteria_level ON criteria(level);
CREATE INDEX idx_criteria_version ON criteria(version);
CREATE INDEX idx_criteria_guideline ON criteria(guideline_id);
CREATE INDEX idx_criteria_tags_tag_id ON criteria_tags(tag_id);
CREATE INDEX idx_criteria_tags_criterion_id ON criteria_tags(criterion_id);
```

### Query Optimization

- **FTS5** for full-text search (better than LIKE queries)
- **Pagination** limits results (default 25, max 100)
- **WAL mode** for better concurrent access
- **Prepared statements** prevent SQL injection and improve performance

### Frontend Optimization

- **Debounced search** (300ms delay)
- **URL-based state** (no unnecessary re-renders)
- **Lazy loading** (details hidden by default)
- **Efficient re-renders** (React.memo where appropriate)

## Security

### API Security

- **CORS**: Restricts origin access
- **No authentication** for read-only public endpoints
- **Admin routes** protected with Bearer token
- **SQL injection prevention** via prepared statements
- **Input validation** on all parameters

### Admin Routes

```bash
# Set admin password
export ADMIN_PASSWORD=your-secure-password

# Use in requests
curl -H "Authorization: Bearer your-secure-password" \
  http://localhost:8787/admin/...
```

## Deployment

### Environment Variables

```bash
# API Configuration
PORT=8787
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
ADMIN_PASSWORD=your-secure-password

# Production mode
NODE_ENV=production
```

### Build Process

```bash
# Build frontend
cd apps/web
bun run build

# Output: apps/web/dist/

# API runs directly (no build needed with Bun)
cd apps/api
bun run src/index.ts
```

### Static Hosting

The frontend can be deployed to any static host:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

The API can be deployed to:
- Fly.io
- Railway
- Render
- Any VPS with Bun installed

## Future Enhancements

### Planned Features

- [ ] Bookmarking/favorites
- [ ] Export filtered results (CSV, JSON)
- [ ] Advanced search operators
- [ ] Filtering by multiple tags (AND/OR logic)
- [ ] Filtering by affected users, assignees, technologies
- [ ] Comparison view for multiple criteria
- [ ] Print-friendly view
- [ ] Offline support (PWA)
- [ ] Dark mode toggle
- [ ] Custom tag creation
- [ ] Collaborative annotations

### Technical Debt

- [ ] Add comprehensive test suite
- [ ] Implement proper error boundaries
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add E2E tests
- [ ] Improve accessibility (ARIA labels, keyboard nav)
- [ ] Add analytics
- [ ] Set up CI/CD pipeline
- [ ] Add database migrations system
- [ ] Implement caching layer (Redis)

## Contributing

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits
- Descriptive variable names
- Comments for complex logic

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Commit with descriptive message
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request with description

### Reporting Issues

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)
