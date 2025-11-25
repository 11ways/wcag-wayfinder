# WCAG Explorer - Metadata Enhancement Plan

## Overview

This document outlines the comprehensive plan to extend the WCAG Explorer with rich metadata including:
- **Affected User Types** (disabilities/personas)
- **Assignees** (responsible professionals)
- **Technologies** (implementation methods)
- **Tags** (categorization)

Each relationship will include relevance scoring and ranking to prioritize the most important associations.

---

## 1. Database Schema Design

### 1.1 New Reference Tables

#### `affected_users`
```sql
CREATE TABLE affected_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- emoji or icon name
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Seed Data**:
- People with a visual impairment
- People with an auditory impairment
- People with a cognitive impairment
- People who are colorblind
- People with a motor impairment
- People using mobile devices
- People using screen readers
- People with low vision
- Elderly users
- People with photosensitive epilepsy

---

#### `assignees`
```sql
CREATE TABLE assignees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  color TEXT, -- for UI badges
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Seed Data**:
- Front-end Developer
- Back-end Developer
- UX/UI Designer
- Content Editor
- Content Translator
- Product Manager
- QA Tester

---

#### `technologies`
```sql
CREATE TABLE technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Seed Data**:
- HTML and WAI-ARIA
- CSS
- JavaScript
- Server-side technologies
- PDF
- Native mobile apps
- Video/Audio encoding

---

#### `tags`
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  category TEXT, -- for grouping (e.g., 'media', 'interaction', 'content')
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Seed Data**: All 73 tags from your list (animation, audio, auto complete, etc.)

---

### 1.2 Junction Tables (Many-to-Many with Scoring)

#### `criteria_affected_users`
```sql
CREATE TABLE criteria_affected_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id INTEGER NOT NULL,
  affected_user_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL, -- 0.0 to 1.0
  rank_order INTEGER, -- 1, 2, 3... for display ordering
  reasoning TEXT, -- AI explanation
  reviewed BOOLEAN DEFAULT 0, -- manual review status
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (affected_user_id) REFERENCES affected_users (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, affected_user_id)
);

CREATE INDEX idx_cau_criterion ON criteria_affected_users(criterion_id);
CREATE INDEX idx_cau_score ON criteria_affected_users(relevance_score DESC);
```

#### `criteria_assignees`
```sql
CREATE TABLE criteria_assignees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id INTEGER NOT NULL,
  assignee_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL,
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES assignees (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, assignee_id)
);

CREATE INDEX idx_ca_criterion ON criteria_assignees(criterion_id);
```

#### `criteria_technologies`
```sql
CREATE TABLE criteria_technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id INTEGER NOT NULL,
  technology_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL,
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, technology_id)
);

CREATE INDEX idx_ct_criterion ON criteria_technologies(criterion_id);
```

#### `criteria_tags`
```sql
CREATE TABLE criteria_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criterion_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  relevance_score REAL NOT NULL,
  rank_order INTEGER,
  reasoning TEXT,
  reviewed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criterion_id) REFERENCES criteria (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
  UNIQUE(criterion_id, tag_id)
);

CREATE INDEX idx_ctag_criterion ON criteria_tags(criterion_id);
CREATE INDEX idx_ctag_tag ON criteria_tags(tag_id);
```

---

### 1.3 Migration Strategy

**Files**:
- `migrations/006_add_metadata_tables.sql` - Create tables
- `migrations/007_seed_reference_data.sql` - Populate reference tables

**Approach**:
- Non-destructive: Existing `criteria` table unchanged
- Additive: New tables with foreign keys
- Idempotent: Can run multiple times safely

---

## 2. AI Prompt Engineering

### 2.1 Prompt Template

```
You are an expert WCAG accessibility consultant analyzing success criteria to determine metadata relationships.

## Task
Analyze the following WCAG success criterion and determine:
1. Which user groups are most affected by violations of this criterion
2. Which professionals are responsible for implementing/fixing this criterion
3. Which technologies are required to implement this criterion
4. Which tags best categorize this criterion

## Success Criterion
**Number**: {num}
**Level**: {level}
**Title**: {title}
**Description**: {description}

## Available Options

### Affected Users (select all that apply with confidence scores):
- People with a visual impairment
- People with an auditory impairment
- People with a cognitive impairment
- People who are colorblind
- People with a motor impairment
- People using mobile devices
- People using screen readers
- People with low vision
- Elderly users
- People with photosensitive epilepsy

### Assignees (select primary and secondary):
- Front-end Developer
- Back-end Developer
- UX/UI Designer
- Content Editor
- Content Translator
- Product Manager
- QA Tester

### Technologies (select all that apply):
- HTML and WAI-ARIA
- CSS
- JavaScript
- Server-side technologies
- PDF
- Native mobile apps
- Video/Audio encoding

### Tags (select 3-7 most relevant):
{full_tag_list}

## Scoring Rubric
- **1.0 (100%)**: Directly and primarily affected/responsible/required
- **0.8 (80%)**: Significantly affected/responsible/required
- **0.6 (60%)**: Moderately affected/responsible/required
- **0.4 (40%)**: Somewhat affected/responsible/required
- **0.2 (20%)**: Tangentially affected/responsible/required

## Output Format
Return ONLY valid JSON (no markdown, no explanations outside JSON):

{
  "affected_users": [
    {"name": "exact name from list", "score": 0.95, "reasoning": "brief explanation"},
    ...
  ],
  "assignees": [
    {"name": "exact name from list", "score": 0.9, "reasoning": "brief explanation"},
    ...
  ],
  "technologies": [
    {"name": "exact name from list", "score": 0.85, "reasoning": "brief explanation"},
    ...
  ],
  "tags": [
    {"name": "exact name from list", "score": 0.98, "reasoning": "brief explanation"},
    ...
  ]
}

## Guidelines
- Only include items with score >= 0.5
- Order by score (highest first)
- Provide brief reasoning for each selection
- Be conservative: only include truly relevant items
- Consider practical implementation, not just theoretical impact
```

### 2.2 Few-Shot Examples

**Example 1: SC 1.1.1 (Non-text Content)**
```json
{
  "affected_users": [
    {"name": "People with a visual impairment", "score": 1.0, "reasoning": "Cannot perceive images without text alternatives"},
    {"name": "People using screen readers", "score": 1.0, "reasoning": "Screen readers need text alternatives to convey image content"},
    {"name": "People with a cognitive impairment", "score": 0.7, "reasoning": "Benefit from text alternatives that can be simplified"}
  ],
  "assignees": [
    {"name": "Front-end Developer", "score": 0.95, "reasoning": "Implements alt text, aria-labels, and text alternatives in HTML"},
    {"name": "Content Editor", "score": 0.85, "reasoning": "Creates meaningful alt text descriptions for images"},
    {"name": "UX/UI Designer", "score": 0.6, "reasoning": "Designs content structure including alternative text requirements"}
  ],
  "technologies": [
    {"name": "HTML and WAI-ARIA", "score": 1.0, "reasoning": "Alt attributes, aria-label, aria-labelledby required"}
  ],
  "tags": [
    {"name": "images", "score": 1.0, "reasoning": "Primary focus is image alternatives"},
    {"name": "text alternatives", "score": 1.0, "reasoning": "Core requirement"},
    {"name": "content", "score": 0.8, "reasoning": "Applies to all non-text content"},
    {"name": "icons", "score": 0.7, "reasoning": "Icons need text alternatives"},
    {"name": "buttons", "score": 0.6, "reasoning": "Icon buttons need accessible names"}
  ]
}
```

**Example 2: SC 1.4.3 (Contrast)**
```json
{
  "affected_users": [
    {"name": "People with low vision", "score": 1.0, "reasoning": "Low contrast text is unreadable"},
    {"name": "People who are colorblind", "score": 0.8, "reasoning": "Certain color combinations are indistinguishable"},
    {"name": "Elderly users", "score": 0.7, "reasoning": "Age-related vision decline affects contrast sensitivity"},
    {"name": "People using mobile devices", "score": 0.6, "reasoning": "Outdoor glare reduces effective contrast"}
  ],
  "assignees": [
    {"name": "UX/UI Designer", "score": 0.95, "reasoning": "Chooses colors and ensures contrast ratios in designs"},
    {"name": "Front-end Developer", "score": 0.75, "reasoning": "Implements colors and can use CSS variables for themes"}
  ],
  "technologies": [
    {"name": "CSS", "score": 1.0, "reasoning": "Colors defined in CSS"},
    {"name": "HTML and WAI-ARIA", "score": 0.3, "reasoning": "Some inline styles in HTML"}
  ],
  "tags": [
    {"name": "contrast", "score": 1.0, "reasoning": "Core requirement"},
    {"name": "color", "score": 0.9, "reasoning": "Related to color choices"},
    {"name": "text", "score": 0.8, "reasoning": "Text contrast specifically"},
    {"name": "visual cues", "score": 0.6, "reasoning": "Contrast provides visual distinction"}
  ]
}
```

### 2.3 AI Provider Considerations

**Option A: OpenAI GPT-4**
- Pros: Excellent JSON output, reliable, good reasoning
- Cons: Cost (~$0.03 per criterion), requires API key
- Model: `gpt-4-turbo-preview` or `gpt-4o`

**Option B: Anthropic Claude**
- Pros: Excellent reasoning, strong instruction following, cheaper
- Cons: Requires API key, quota limits
- Model: `claude-3-5-sonnet-20241022`

**Option C: Local Model (Ollama)**
- Pros: Free, private, no API limits
- Cons: Slower, requires setup, less consistent JSON
- Model: `llama3.1:70b` or `qwen2.5:32b`

**Recommendation**: Start with Claude 3.5 Sonnet (best balance of quality/cost/speed)

### 2.4 Post-Processing

After AI response, system should:
1. Parse JSON response
2. Validate all names exist in reference tables
3. Use fuzzy matching for slight variations
4. Calculate rank_order from scores
5. Flag for manual review if confidence low
6. Store reasoning for transparency

---

## 3. Management Application Architecture

### 3.1 Application Structure

```
wcag-explorer/
├── apps/
│   ├── web/              # Existing public app
│   ├── api/              # Existing API
│   └── admin/            # NEW: Management app
│       ├── src/
│       │   ├── components/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── CriteriaList.tsx
│       │   │   ├── CriterionEditor.tsx
│       │   │   ├── AIBatchProcessor.tsx
│       │   │   ├── ReferenceDataManager.tsx
│       │   │   └── MetadataEditor.tsx
│       │   ├── lib/
│       │   │   ├── api.ts
│       │   │   ├── ai-client.ts
│       │   │   └── types.ts
│       │   ├── App.tsx
│       │   └── index.tsx
│       ├── package.json
│       └── vite.config.ts
```

### 3.2 Tech Stack

**Frontend**:
- React 18 + TypeScript
- Vite for build
- React Router for navigation
- TanStack Query for API state
- Tailwind CSS for styling
- Headless UI for components
- React DnD for drag-and-drop ranking

**Backend**:
- Extend existing Bun API
- New routes under `/api/admin/*`
- Middleware for authentication
- AI client library (OpenAI/Anthropic SDK)
- Rate limiting for AI calls

**Database**:
- Same SQLite database
- New tables (schema above)
- Additional indexes for performance

---

## 4. Management UI Design

### 4.1 Dashboard View

```
┌─────────────────────────────────────────────┐
│  WCAG Metadata Manager                      │
├─────────────────────────────────────────────┤
│                                             │
│  Statistics                                 │
│  ┌────────────────┬────────────────────┐   │
│  │ Total Criteria │ Metadata Complete  │   │
│  │      87        │       12 (14%)     │   │
│  └────────────────┴────────────────────┘   │
│                                             │
│  Progress by Category                       │
│  Affected Users  [████░░░░░░] 40%          │
│  Assignees       [██░░░░░░░░] 20%          │
│  Technologies    [███░░░░░░░] 30%          │
│  Tags            [█░░░░░░░░░] 10%          │
│                                             │
│  Quick Actions                              │
│  [Run AI Batch Processing]                  │
│  [View Criteria Needing Review]             │
│  [Manage Reference Data]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 Criteria List View

```
┌─────────────────────────────────────────────────────────────┐
│  All Criteria                                   [+ Filters]  │
├──────┬───────────────────────────┬──────────┬───────────────┤
│ Num  │ Title                     │ Status   │ Actions       │
├──────┼───────────────────────────┼──────────┼───────────────┤
│ 1.1.1│ Non-text Content          │ ✓ Complete│ [Edit]       │
│ 1.2.1│ Audio-only and Video-only │ ⚠ Partial│ [Edit]       │
│ 1.2.2│ Captions (Prerecorded)    │ ✗ Empty  │ [Edit] [AI]  │
│ ...  │                           │          │              │
└──────┴───────────────────────────┴──────────┴──────────────┘

[Bulk Actions ▼] [Export CSV] [Import CSV]
```

### 4.3 Criterion Editor View

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Metadata: 1.1.1 Non-text Content                      │
├────────────────────────┬────────────────────────────────────┤
│ Criterion Info         │ Metadata Editor                    │
│                        │                                    │
│ Number: 1.1.1          │ Tabs: [Affected Users]            │
│ Level: A               │       [Assignees]                 │
│ Title: Non-text...     │       [Technologies]              │
│                        │       [Tags]                      │
│ Description:           │                                    │
│ All non-text content   │ ┌──────────────────────────────┐ │
│ that is presented to   │ │ Selected (3)                 │ │
│ the user has a text    │ │                              │ │
│ alternative...         │ │ 1. ⠿ People with visual...  │ │
│                        │ │    Score: ███████████ 95%    │ │
│ [View Full SC]         │ │    [Edit] [Remove]           │ │
│                        │ │                              │ │
│                        │ │ 2. ⠿ People using screen...│ │
│                        │ │    Score: ██████████ 90%     │ │
│                        │ │    [Edit] [Remove]           │ │
│                        │ │                              │ │
│                        │ │ 3. ⠿ People with cognitive  │ │
│                        │ │    Score: ███████░░░ 70%     │ │
│                        │ │    [Edit] [Remove]           │ │
│                        │ └──────────────────────────────┘ │
│                        │                                    │
│                        │ ┌──────────────────────────────┐ │
│                        │ │ Add More...                  │ │
│                        │ │ [ ] People with auditory...  │ │
│                        │ │ [ ] People who are colorblind│ │
│                        │ │ [ ] People with motor...     │ │
│                        │ └──────────────────────────────┘ │
│                        │                                    │
│                        │ [💡 AI Suggest] [Save] [Cancel]   │
└────────────────────────┴────────────────────────────────────┘
```

### 4.4 AI Batch Processor View

```
┌─────────────────────────────────────────────────────────────┐
│ AI Batch Metadata Generation                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Select Criteria Range:                                      │
│ ○ All criteria (87)                                         │
│ ● Only criteria without metadata (75)                       │
│ ○ Specific range: [1.1.1] to [4.1.3]                       │
│ ○ By level: [✓ A] [✓ AA] [ ] AAA                           │
│                                                             │
│ AI Provider:                                                │
│ ◉ Claude 3.5 Sonnet    Estimated cost: $2.25               │
│ ○ GPT-4 Turbo          Estimated cost: $3.50               │
│                                                             │
│ Options:                                                    │
│ [✓] Save AI reasoning                                       │
│ [✓] Flag for manual review                                  │
│ [ ] Auto-approve suggestions with score > 80%              │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Progress: ████████████░░░░░░░░ 60%                    │  │
│ │                                                        │  │
│ │ Processing: 1.4.3 Contrast (Minimum)                  │  │
│ │ Completed: 52/87                                       │  │
│ │ Errors: 2                                              │  │
│ │                                                        │  │
│ │ [Pause] [Cancel]                                       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [Start Processing]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API Endpoints

### 5.1 Public API (Read-Only)

#### Get Criterion with Metadata
```
GET /api/criteria/:id/metadata
Response: {
  criterion: { id, num, title, ... },
  affected_users: [{ id, name, score, rank_order }, ...],
  assignees: [{ id, name, score, rank_order }, ...],
  technologies: [{ id, name, score, rank_order }, ...],
  tags: [{ id, name, score, rank_order }, ...]
}
```

#### Get All Reference Data
```
GET /api/affected-users
GET /api/assignees
GET /api/technologies
GET /api/tags

Response: [{ id, name, slug, description }, ...]
```

#### Filter Criteria by Metadata
```
GET /api/criteria?affected_user=visual-impairment
GET /api/criteria?tag=images&tag=buttons
GET /api/criteria?assignee=frontend-developer&level=AA

Response: { items: [...], total: N }
```

### 5.2 Admin API (Authenticated)

#### Manage Relationships
```
POST   /api/admin/criteria/:id/affected-users
  Body: { affected_user_id, score, reasoning }

PUT    /api/admin/criteria/:id/affected-users/:userId
  Body: { score, rank_order, reasoning }

DELETE /api/admin/criteria/:id/affected-users/:userId
```

#### AI Suggestions
```
POST   /api/admin/ai/suggest-metadata
  Body: { criterion_id }
  Response: { affected_users: [...], assignees: [...], ... }

POST   /api/admin/ai/batch-process
  Body: { criterion_ids: [], options: {...} }
  Response: { job_id }

GET    /api/admin/ai/batch-process/:jobId/status
  Response: { status, progress, results: [...] }
```

#### Reference Data Management
```
GET    /api/admin/affected-users
POST   /api/admin/affected-users
PUT    /api/admin/affected-users/:id
DELETE /api/admin/affected-users/:id
```

---

## 6. Implementation Phases

### Phase 1: Database Schema (Week 1)
**Deliverables**:
- [ ] Migration SQL for all new tables
- [ ] Seed data for reference tables (affected users, assignees, technologies, tags)
- [ ] Database indexes
- [ ] Test data population

**Files**:
- `apps/api/migrations/006_add_metadata_tables.sql`
- `apps/api/migrations/007_seed_reference_data.sql`
- `apps/api/src/db/seeds/`

---

### Phase 2: AI Prompt Development (Week 1-2)
**Deliverables**:
- [ ] Final prompt template
- [ ] 5-10 few-shot examples
- [ ] AI client library
- [ ] Response parsing & validation
- [ ] Test AI suggestions on 10 sample criteria
- [ ] Iterate based on quality

**Files**:
- `apps/api/src/lib/ai-client.ts`
- `apps/api/src/lib/prompts/metadata-suggestion.ts`
- `apps/api/src/lib/validators/ai-response.ts`

---

### Phase 3: Admin API Backend (Week 2-3)
**Deliverables**:
- [ ] Extend existing API with admin routes
- [ ] CRUD endpoints for relationships
- [ ] AI suggestion endpoint
- [ ] Batch processing with job queue
- [ ] Authentication middleware
- [ ] Error handling & logging

**Files**:
- `apps/api/src/routes/admin/`
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/services/metadata-service.ts`
- `apps/api/src/services/ai-service.ts`

---

### Phase 4: Admin UI Frontend (Week 3-5)
**Deliverables**:
- [ ] Set up admin React app
- [ ] Dashboard with statistics
- [ ] Criteria list view
- [ ] Criterion editor (tabs, drag-drop)
- [ ] AI batch processor UI
- [ ] Reference data management
- [ ] Settings page

**Files**:
- `apps/admin/` (entire new app)
- Component library
- API client
- State management

---

### Phase 5: AI Batch Processing (Week 5-6)
**Deliverables**:
- [ ] Run AI on all 87 criteria
- [ ] Review and adjust suggestions
- [ ] Mark metadata as reviewed
- [ ] Export results for backup
- [ ] Documentation of decisions

**Artifacts**:
- Completed database with metadata
- Review notes
- Quality assessment report

---

### Phase 6: Main App Integration (Week 6-7)
**Deliverables**:
- [ ] Update criterion cards to show metadata chips
- [ ] Add "Affected Users" filter
- [ ] Add "Role/Assignee" filter
- [ ] Add "Technology" filter
- [ ] Add "Tags" filter with autocomplete
- [ ] Filter combinations
- [ ] Update URL routing for new filters

**Files**:
- `apps/web/src/components/CriterionCard.tsx` (enhanced)
- `apps/web/src/components/Filters.tsx` (new filter sections)
- `apps/web/src/lib/api.ts` (new endpoints)
- `apps/web/src/lib/urlUtils.ts` (new URL params)

---

### Phase 7: Testing & Documentation (Week 7-8)
**Deliverables**:
- [ ] Manual testing of all features
- [ ] API documentation
- [ ] User guide for admin app
- [ ] Data export/import tools
- [ ] Backup procedures

---

## 7. Questions & Decisions Needed

### 7.1 Scoring System
**Question**: What scale should we use for relevance scores?

**Options**:
- A) 0.0 to 1.0 (decimal, precise)
- B) 0 to 100 (integer, user-friendly)
- C) 1 to 5 (star rating, simple)

**Recommendation**: **0.0 to 1.0** (store in DB), display as **percentage 0-100%** (UI)

**Reasoning**: Decimal precision for algorithms, percentage for humans

---

### 7.2 Ranking vs. Scoring
**Question**: Should we use both score AND rank, or just score?

**Options**:
- A) Score only (simpler, auto-calculate rank from score)
- B) Rank only (simpler, manual ordering)
- C) Both (flexible, allows manual reordering)

**Recommendation**: **Both**

**Reasoning**:
- Score represents AI confidence / relevance
- Rank allows manual override (expert knowledge trumps AI)
- Rank used for display order, score for filtering

---

### 7.3 AI Provider
**Question**: Which AI provider should we use?

**Options**:
- A) OpenAI GPT-4 (~$0.03/criterion = ~$2.61 total)
- B) Anthropic Claude (~$0.015/criterion = ~$1.30 total)
- C) Local Ollama (free but slower/less reliable)

**Recommendation**: **Anthropic Claude 3.5 Sonnet**

**Reasoning**: Best balance of quality, cost, and reliability

---

### 7.4 Tag Categories
**Question**: Should tags be grouped into categories?

**Proposed Categories**:
- Media (animation, audio, video, images, icons)
- Interaction (buttons, forms, keyboard, focus, hover, drag and drop)
- Content (text, headings, labels, language, readability)
- Structure (markup, layout, regions, tables, skip to content)
- Visual (color, contrast, zoom, viewport, screen size)
- Temporal (time limits, autoplay, moving content, live stream)
- Navigation (links, menus, navigation, page title, breadcrumbs)
- Forms (errors, auto complete, captcha, logins)
- Components (carousels, modals, pop up, iframes, notifications)

**Recommendation**: **Yes, add category column**

**Reasoning**: Helps with organization, filtering, and UI grouping

---

### 7.5 Validation Rules
**Question**: Should we enforce minimum/maximum metadata items?

**Proposed Rules**:
- Affected Users: 1-5 (at least one, max five)
- Assignees: 1-3 (at least one primary, max three)
- Technologies: 1-4 (at least one, max four)
- Tags: 3-10 (at least three, max ten)

**Recommendation**: **Soft limits**

**Reasoning**: Suggest limits in UI, but don't enforce strictly (some criteria are complex)

---

### 7.6 Authentication
**Question**: How should the admin app be protected?

**Options**:
- A) Simple password (environment variable)
- B) Username/password with bcrypt
- C) OAuth (GitHub, Google)
- D) IP whitelist (localhost only)

**Recommendation**: **Environment variable password** (Phase 1)

**Reasoning**: Simple, secure for small team, can upgrade later

---

## 8. Data Flow Diagram

```
┌──────────────┐
│   Admin UI   │
│  (React App) │
└──────┬───────┘
       │
       │ HTTP Requests
       │
       ▼
┌──────────────────┐      ┌─────────────┐
│   Admin API      │─────▶│ AI Provider │
│  (Bun + Hono)    │◀─────│ (Claude)    │
└──────┬───────────┘      └─────────────┘
       │
       │ SQL Queries
       │
       ▼
┌──────────────────┐
│  SQLite Database │
│  - criteria      │
│  - affected_users│
│  - assignees     │
│  - technologies  │
│  - tags          │
│  - junctions...  │
└──────┬───────────┘
       │
       │ SQL Queries
       │
       ▼
┌──────────────────┐
│   Public API     │
│  (Bun + Hono)    │
└──────┬───────────┘
       │
       │ HTTP Responses
       │
       ▼
┌──────────────────┐
│   Public Web UI  │
│  (WCAG Explorer) │
└──────────────────┘
```

---

## 9. Example Workflow

### Scenario: Admin wants to add metadata for SC 1.1.1

1. **Navigate**: Open admin app → Criteria List
2. **Select**: Click "Edit" on SC 1.1.1
3. **AI Suggest**: Click "💡 AI Suggest" button
4. **Processing**:
   - System sends criterion to AI
   - AI returns suggestions with scores
   - System parses and validates
5. **Review**:
   - Admin sees suggested affected users, assignees, tech, tags
   - Each has confidence score and reasoning
6. **Edit**:
   - Admin adjusts scores (slider)
   - Drags items to reorder
   - Adds missing item ("People with low vision")
   - Removes incorrect suggestion
7. **Save**: Click "Save"
8. **Result**: Metadata stored in DB with `reviewed=true`

### Scenario: Batch process all Level A criteria

1. **Navigate**: Admin app → AI Batch Processor
2. **Configure**:
   - Select "By level: A"
   - Choose "Claude 3.5 Sonnet"
   - Enable "Flag for manual review"
3. **Start**: Click "Start Processing"
4. **Monitor**: Watch progress bar (30/30 criteria)
5. **Review**: Navigate to "Criteria Needing Review"
6. **Approve**: Review each suggestion, make adjustments
7. **Complete**: All Level A criteria have metadata

---

## 10. Success Metrics

### Completion Metrics
- [ ] 100% of criteria have at least 1 affected user
- [ ] 100% of criteria have at least 1 assignee
- [ ] 100% of criteria have at least 1 technology
- [ ] 100% of criteria have at least 3 tags
- [ ] 90%+ of metadata manually reviewed and approved

### Quality Metrics
- [ ] AI suggestions accuracy > 80% (manual validation)
- [ ] Average 3-4 affected users per criterion
- [ ] Average 2-3 assignees per criterion
- [ ] Average 5-7 tags per criterion
- [ ] Consistent scoring across similar criteria

### User Experience Metrics (Main App)
- [ ] Users can filter by affected user type
- [ ] Users can filter by role/responsibility
- [ ] Users can filter by technology
- [ ] Users can search by tag
- [ ] Combinations of filters work correctly

---

## 11. Risk Mitigation

### Risk 1: AI Generates Inconsistent Names
**Mitigation**:
- Strict output format validation
- Fuzzy matching against reference data
- Manual review required flag
- Provide exact name lists in prompt

### Risk 2: AI Costs Exceed Budget
**Mitigation**:
- Cost estimates before batch processing
- Rate limiting (max 10/minute)
- Cache AI responses
- Option to use local models

### Risk 3: Manual Review Takes Too Long
**Mitigation**:
- AI suggestions are good starting point
- Focus review on high-impact criteria (Level A/AA)
- Batch approval for high-confidence suggestions
- Export/import for team collaboration

### Risk 4: Schema Changes Break Existing App
**Mitigation**:
- Non-destructive migrations
- Existing API endpoints unchanged
- New endpoints are additive
- Comprehensive testing

### Risk 5: Metadata Becomes Stale
**Mitigation**:
- Date tracking (created_at, updated_at)
- "Last reviewed" indicator
- Prompt to review when WCAG updates
- Version control for metadata

---

## 12. Future Enhancements

### Phase 8: Analytics & Insights
- Most common affected user types
- Most frequent tags
- Assignee workload distribution
- Complexity heatmaps

### Phase 9: Public Contributions
- Allow users to suggest metadata
- Voting system for suggestions
- Reputation system
- Moderation queue

### Phase 10: Export & Integration
- Export as CSV/JSON
- API for third-party integrations
- Webhooks for updates
- Sync with other accessibility tools

---

## 13. Next Steps

**Before starting implementation, please confirm:**

1. ✅ Database schema design
2. ✅ Scoring system (0-1 scale, display as %)
3. ✅ AI provider (Claude 3.5 Sonnet)
4. ✅ Tag categories approach
5. ✅ Validation rules (soft limits)
6. ✅ Authentication approach (env var password)
7. ✅ UI design direction
8. ✅ Implementation phases & timeline

**Once approved, I will proceed with**:
- Phase 1: Database schema migration
- Phase 2: AI prompt development
- Then continue through each phase systematically

---

**Ready to begin?** Let me know if you want to adjust any aspect of this plan before we start implementing! 🚀
