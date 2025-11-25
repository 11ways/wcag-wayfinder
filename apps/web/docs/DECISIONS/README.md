# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the WCAG Explorer project. ADRs document significant architectural decisions made during the development of the application, including the context, decision, consequences, and alternatives considered.

## What are ADRs?

Architecture Decision Records are short documents that capture important architectural decisions along with their context and consequences. They help:

- Understand why certain technical choices were made
- Onboard new team members
- Revisit decisions when circumstances change
- Avoid repeating past discussions
- Maintain institutional knowledge

## ADR Format

Each ADR follows a consistent format:

- **Title:** A clear, concise description of the decision
- **Status:** Accepted, Rejected, Superseded, or Proposed
- **Date:** When the decision was made
- **Context:** The circumstances and constraints that led to the decision
- **Decision:** What was decided
- **Consequences:** Positive and negative outcomes
- **Alternatives Considered:** Other options that were evaluated

## Current ADRs

### 001 - Use Bun as Runtime
**Status:** Accepted
**Summary:** Use Bun instead of Node.js/npm for faster performance and native TypeScript support.

**Key Points:**
- 3-10x faster package installation
- Native TypeScript execution
- Compatible with existing ecosystem
- Trade-off: Less mature than Node.js

### 002 - TanStack Query for Server State Management
**Status:** Rejected (Not Implemented)
**Summary:** Decided NOT to use TanStack Query; use native React hooks instead.

**Key Points:**
- Application is simple enough for useState/useEffect
- URL state is primary source of truth
- Avoids additional dependency
- Can reconsider if app grows in complexity

### 003 - Zustand for Client State Management
**Status:** Rejected (Not Implemented)
**Summary:** Decided NOT to use Zustand or any global state library.

**Key Points:**
- Use React useState + URL + localStorage
- Keeps state management intentional and visible
- Minimal dependencies
- Can adopt later if props drilling becomes painful

### 004 - Layered Architecture with Feature Separation
**Status:** Accepted
**Summary:** Use layered architecture separating presentation, business logic, and utilities.

**Key Points:**
- Components in `/components` and `/pages`
- Business logic in `/lib` (no React dependencies)
- Clear separation of concerns
- Testable and maintainable

### 005 - Enforce TypeScript Strict Mode
**Status:** Accepted
**Summary:** Enable TypeScript strict mode for all code.

**Key Points:**
- Catch bugs at compile time
- Better IDE support and refactoring
- Self-documenting code
- Non-negotiable for project

### 006 - Use Tailwind CSS Instead of CSS-in-JS
**Status:** Accepted
**Summary:** Use Tailwind CSS with CSS custom properties; no CSS-in-JS libraries.

**Key Points:**
- Better performance (no runtime overhead)
- Faster development velocity
- Consistent design system
- Theme switching with CSS custom properties

### 007 - URL as Source of Truth for Application State
**Status:** Accepted
**Summary:** Encode all filter state in URL for shareability and bookmarkability.

**Key Points:**
- Shareable and bookmarkable URLs
- Browser back/forward work naturally
- No state synchronization issues
- Deep linking support

### 008 - Accessibility-First Development with WCAG 2.2 AAA
**Status:** Accepted
**Summary:** WCAG 2.2 Level AAA as baseline accessibility standard.

**Key Points:**
- Exemplifies best practices
- Credibility for accessibility tool
- Better UX for everyone
- Educational reference implementation

## Decision Status

- **Accepted:** The decision is approved and implemented
- **Rejected:** The decision was considered but not adopted
- **Superseded:** Replaced by a newer decision (reference the new ADR)
- **Proposed:** Under consideration, not yet decided

## When to Create an ADR

Create an ADR when making decisions that:

- Have long-term impact on the codebase
- Are difficult or expensive to change later
- Affect multiple team members or features
- Involve trade-offs between alternatives
- Need justification for future reference

Examples:
- Choosing a framework or library
- Architectural patterns
- Data flow strategies
- Build and deployment approaches
- Testing strategies

## How to Create an ADR

1. Copy the template from an existing ADR
2. Use sequential numbering (e.g., 009-next-decision.md)
3. Fill in all sections thoughtfully
4. Include code examples where helpful
5. Consider both positive and negative consequences
6. List alternatives that were evaluated
7. Get team review before finalizing
8. Update this README with a summary

## Updating ADRs

ADRs should generally not be modified after acceptance, as they represent historical decisions. Instead:

- If a decision is reversed, create a new ADR that supersedes it
- Mark the old ADR as "Superseded" and reference the new one
- If circumstances change significantly, create a new ADR proposing changes
- Minor corrections (typos, clarifications) are acceptable

## Further Reading

- [Architecture Decision Records by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [Markdown Architectural Decision Records](https://adr.github.io/madr/)

---

**Last Updated:** 2025-10-18
