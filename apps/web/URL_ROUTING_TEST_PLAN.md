# URL Routing Test Plan

## Test Objectives
1. Verify URL parsing correctly initializes filters
2. Verify filter changes correctly update URL
3. Verify browser back/forward navigation works correctly
4. Verify bookmarked/shared URLs work correctly
5. Verify edge cases and invalid inputs are handled gracefully

---

## Test Categories

### 1. URL Parsing Tests (URL → Filters)

#### 1.1 Basic Segments

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P1.1 | `/` | `version: ['2.2'], level: ['A', 'AA']` (defaults) |
| P1.2 | `/version:2-1/` | `version: ['2.1'], level: ['A', 'AA']` |
| P1.3 | `/version:2-2/` | `version: ['2.2'], level: ['A', 'AA']` |
| P1.4 | `/level:a/` | `version: ['2.2'], level: ['A']` |
| P1.5 | `/level:aa/` | `version: ['2.2'], level: ['AA']` |
| P1.6 | `/level:aaa/` | `version: ['2.2'], level: ['AAA']` |

#### 1.2 Multiple Values

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P2.1 | `/version:2-1+2-2/` | `version: ['2.1', '2.2'], level: ['A', 'AA']` |
| P2.2 | `/level:a+aa/` | `version: ['2.2'], level: ['A', 'AA']` (default) |
| P2.3 | `/level:a+aa+aaa/` | `version: ['2.2'], level: ['A', 'AA', 'AAA']` |
| P2.4 | `/principle:p+o/` | `version: ['2.2'], level: ['A', 'AA'], principle: ['Perceivable', 'Operable']` |
| P2.5 | `/principle:u+r/` | `version: ['2.2'], level: ['A', 'AA'], principle: ['Understandable', 'Robust']` |

#### 1.3 Principle Aliases

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P3.1 | `/principle:p/` | `principle: ['Perceivable']` |
| P3.2 | `/principle:perceivable/` | `principle: ['Perceivable']` |
| P3.3 | `/principle:o/` | `principle: ['Operable']` |
| P3.4 | `/principle:operable/` | `principle: ['Operable']` |
| P3.5 | `/principle:all/` | `principle: ['Perceivable', 'Operable', 'Understandable', 'Robust']` |
| P3.6 | `/principle:p+perceivable/` | `principle: ['Perceivable']` (deduplicated) |

#### 1.4 Guidelines

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P4.1 | `/guideline:1-1/` | `guideline_id: '1.1'` |
| P4.2 | `/guideline:1-4-10/` | `guideline_id: '1.4.10'` |
| P4.3 | `/guideline:2-5/` | `guideline_id: '2.5'` |

#### 1.5 Combined Segments

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P5.1 | `/version:2-2/level:a+aa+aaa/` | `version: ['2.2'], level: ['A', 'AA', 'AAA']` |
| P5.2 | `/version:2-1/principle:p/` | `version: ['2.1'], level: ['A', 'AA'], principle: ['Perceivable']` |
| P5.3 | `/principle:p/guideline:1-1/` | `principle: ['Perceivable'], guideline_id: '1.1'` |
| P5.4 | `/version:2-2/level:aaa/principle:r/guideline:4-1/` | `version: ['2.2'], level: ['AAA'], principle: ['Robust'], guideline_id: '4.1'` |

#### 1.6 Query Parameters

| Test ID | URL | Expected Filters |
|---------|-----|-----------------|
| P6.1 | `/?q=text` | `version: ['2.2'], level: ['A', 'AA'], q: 'text'` |
| P6.2 | `/version:2-1/?q=alternative` | `version: ['2.1'], level: ['A', 'AA'], q: 'alternative'` |
| P6.3 | `/principle:p/?q=images` | `principle: ['Perceivable'], q: 'images'` |

---

### 2. URL Building Tests (Filters → URL)

#### 2.1 Default Omissions

| Test ID | Filters | Expected URL |
|---------|---------|-------------|
| B1.1 | `version: ['2.2'], level: ['A', 'AA']` | `/` (defaults omitted) |
| B1.2 | `version: ['2.2'], level: ['A']` | `/level:a/` |
| B1.3 | `version: ['2.1'], level: ['A', 'AA']` | `/version:2-1/` |
| B1.4 | All 4 principles | `/` (all principles omitted) |

#### 2.2 Canonical Form (Sorting & Lowercase)

| Test ID | Filters | Expected URL |
|---------|---------|-------------|
| B2.1 | `level: ['AAA', 'A', 'AA']` | `/level:a+aa+aaa/` (sorted) |
| B2.2 | `principle: ['Robust', 'Perceivable']` | `/principle:p+r/` (sorted by code) |
| B2.3 | `version: ['2.2', '2.1']` | `/version:2-1+2-2/` (sorted) |

#### 2.3 Short Codes

| Test ID | Filters | Expected URL |
|---------|---------|-------------|
| B3.1 | `principle: ['Perceivable']` | `/principle:p/` |
| B3.2 | `principle: ['Operable', 'Understandable']` | `/principle:o+u/` |
| B3.3 | `principle: ['Robust']` | `/principle:r/` |

#### 2.4 Guidelines

| Test ID | Filters | Expected URL |
|---------|---------|-------------|
| B4.1 | `guideline_id: '1.1'` | `/guideline:1-1/` |
| B4.2 | `guideline_id: '1.4.10'` | `/guideline:1-4-10/` |

#### 2.5 Query Parameters

| Test ID | Filters | Expected URL |
|---------|---------|-------------|
| B5.1 | `q: 'text alternatives'` | `/?q=text+alternatives` |
| B5.2 | `version: ['2.1'], q: 'keyboard'` | `/version:2-1/?q=keyboard` |

---

### 3. Bidirectional Sync Tests

#### 3.1 URL → Filters → URL (Round-trip)

| Test ID | Initial URL | User Action | Expected Final URL |
|---------|------------|-------------|-------------------|
| S1.1 | `/` | Select version 2.1 | `/version:2-1/` |
| S1.2 | `/version:2-1/` | Select level AAA | `/version:2-1/level:a+aa+aaa/` |
| S1.3 | `/level:aaa/` | Deselect AAA | `/` (back to default A+AA) |
| S1.4 | `/principle:p/` | Select principle Operable | `/principle:o+p/` |
| S1.5 | `/principle:p/` | Deselect Perceivable | `/` (no principles selected → show all) |
| S1.6 | `/` | Select guideline 1.1 | `/guideline:1-1/` |
| S1.7 | `/guideline:1-1/` | Clear guideline | `/` |
| S1.8 | `/` | Search for "text" | `/?q=text` |
| S1.9 | `/?q=text` | Clear search | `/` |
| S1.10 | `/version:2-1/level:aaa/` | Reset filters | `/` (defaults) |

#### 3.2 Filter State Reflects URL

| Test ID | URL | Expected UI State |
|---------|-----|------------------|
| S2.1 | `/version:2-1/` | Version 2.1 checkbox checked |
| S2.2 | `/level:aaa/` | Level AAA checkbox checked, A and AA unchecked |
| S2.3 | `/principle:p+r/` | Perceivable and Robust checked, Operable and Understandable unchecked |
| S2.4 | `/guideline:1-1/` | Guideline 1.1 selected in nested radio buttons |
| S2.5 | `/?q=keyboard` | Search input contains "keyboard" |

---

### 4. Browser Navigation Tests

#### 4.1 Back/Forward Navigation

| Test ID | Scenario | Expected Behavior |
|---------|----------|------------------|
| N1.1 | Load `/` → Select version 2.1 → Click back | URL changes to `/`, filters reset to defaults |
| N1.2 | Load `/` → Select principle P → Click back | URL changes to `/`, no principles selected |
| N1.3 | Load `/version:2-1/` → Select level AAA → Click back → Click forward | Forward returns to `/version:2-1/level:a+aa+aaa/` |
| N1.4 | Load `/?q=text` → Clear search → Click back | URL changes to `/?q=text`, search input restored |

#### 4.2 Direct URL Navigation

| Test ID | Scenario | Expected Behavior |
|---------|----------|------------------|
| N2.1 | Navigate to `/version:2-1/` | Version 2.1 selected, results filtered |
| N2.2 | Navigate to `/principle:p+o/` | Perceivable and Operable selected |
| N2.3 | Navigate to `/?q=keyboard` | Search input contains "keyboard", results filtered |
| N2.4 | Refresh page on `/version:2-1/level:aaa/` | Filters preserved, results same |

---

### 5. Edge Cases & Error Handling

#### 5.1 Invalid Segments

| Test ID | URL | Expected Behavior |
|---------|-----|------------------|
| E1.1 | `/invalid:value/` | Ignore unknown segment, apply defaults |
| E1.2 | `/version:invalid/` | Ignore invalid version, use default 2.2 |
| E1.3 | `/level:invalid/` | Ignore invalid level, use default A+AA |
| E1.4 | `/principle:invalid/` | Ignore invalid principle |
| E1.5 | `/guideline:invalid/` | Ignore invalid guideline |

#### 5.2 Malformed URLs

| Test ID | URL | Expected Behavior |
|---------|-----|------------------|
| E2.1 | `/version:/` | Empty value ignored, use defaults |
| E2.2 | `/:value/` | Empty key ignored, use defaults |
| E2.3 | `/version:2-1//level:a/` | Double slash handled gracefully |
| E2.4 | `/version:2-1` (no trailing slash) | Parse correctly |

#### 5.3 Special Characters

| Test ID | URL | Expected Behavior |
|---------|-----|------------------|
| E3.1 | `/?q=text%20with%20spaces` | Search "text with spaces" |
| E3.2 | `/?q=special%26chars` | Search "special&chars" |

#### 5.4 Case Sensitivity

| Test ID | URL | Expected Behavior |
|---------|-----|------------------|
| E4.1 | `/LEVEL:A/` | Parse as level A (case-insensitive) |
| E4.2 | `/Principle:P/` | Parse as principle Perceivable |
| E4.3 | `/GUIDELINE:1-1/` | Parse as guideline 1.1 |

---

## Testing Procedure

### Phase 1: Manual URL Testing
1. Open Chrome DevTools MCP browser
2. For each test in "URL Parsing Tests":
   - Navigate to the URL
   - Verify filter UI state matches expected
   - Verify results are filtered correctly

### Phase 2: Filter Interaction Testing
1. For each test in "URL Building Tests":
   - Start from default state
   - Apply filters to match test case
   - Verify URL matches expected

### Phase 3: Round-trip Testing
1. For each test in "Bidirectional Sync Tests":
   - Start from initial URL
   - Perform user action
   - Verify URL updates correctly
   - Verify UI state matches

### Phase 4: Navigation Testing
1. For each test in "Browser Navigation Tests":
   - Execute scenario steps
   - Verify browser history works
   - Verify state is preserved

### Phase 5: Edge Case Testing
1. For each test in "Edge Cases":
   - Input malformed/invalid URL
   - Verify graceful handling
   - Verify no errors in console

---

## Success Criteria

✅ All URL parsing tests produce correct filter state
✅ All filter changes produce correct canonical URLs
✅ Browser back/forward navigation works correctly
✅ Bookmarked URLs load with correct state
✅ Invalid URLs degrade gracefully to defaults
✅ No console errors during any test
✅ Search functionality works with URL parameters
✅ Filter reset returns to canonical default URL

---

## Test Execution Checklist

- [ ] Phase 1: URL Parsing Tests (P1.1 - P6.3)
- [ ] Phase 2: URL Building Tests (B1.1 - B5.2)
- [ ] Phase 3: Bidirectional Sync Tests (S1.1 - S2.5)
- [ ] Phase 4: Browser Navigation Tests (N1.1 - N2.4)
- [ ] Phase 5: Edge Cases (E1.1 - E4.3)
- [ ] All console errors reviewed and resolved
- [ ] Cross-browser testing (if applicable)

---

## Notes for Testing with Chrome DevTools MCP

1. Use `mcp__chrome-devtools__navigate_page` to load URLs
2. Use `mcp__chrome-devtools__take_snapshot` to verify UI state
3. Use `mcp__chrome-devtools__click` to interact with filters
4. Use `mcp__chrome-devtools__fill` for search input
5. Use `mcp__chrome-devtools__navigate_page_history` for back/forward
6. Use `mcp__chrome-devtools__list_console_messages` to check for errors
