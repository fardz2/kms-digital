# Comprehensive Frontend Audit — Design Spec

**Date:** 2026-05-17
**Scope:** Source code di `src/` (131 files)
**Stack:** Vite 8 + React 19 + antd v6 + TypeScript 5
**Branch:** `migrate-vite-react19-ts`

---

## Goal

Audit menyeluruh frontend codebase untuk identifikasi:
- Bug nyata dan runtime risk
- Quality issue per best practices
- Production readiness gap

Output: 1 dokumen audit di `docs/superpowers/audits/2026-05-17-comprehensive.md` dengan ranking severity, **tanpa auto-fix**.

## Scope (8 dimensions)

| # | Dimension | Reference |
|---|---|---|
| 1 | Bug & Runtime Risk | Manual code reading + grep patterns |
| 2 | TypeScript Coverage | `tsconfig`, `@ts-nocheck` count, implicit any |
| 3 | Performance | Bundle size, `vercel-react-best-practices` |
| 4 | Accessibility | WCAG 2.2 via `accessibility` skill |
| 5 | TanStack Query | `tanstack-query-best-practices` skill (38 rules) |
| 6 | React Patterns | `vercel-composition-patterns`, derived state, inline components |
| 7 | Code Quality | Duplication, file size, dead code, eslint |
| 8 | Production Readiness | Env vars, error logging, build config |

## Out of scope

- Backend integration (API contract validation)
- Auto-fix
- Deployment & CI/CD
- `npm audit` security vulnerabilities di deps
- Visual QA / browser testing

## Output format

### Per dimension
```
### Dimension N: <Name>

#### Finding 1: <short description>
- **File:** `src/path/to/file.tsx:line`
- **Severity:** Critical | High | Medium | Low
- **Effort:** <estimasi jam>
- **Recommendation:** 1-2 kalimat actionable

(repeat for each finding)
```

### Summary di atas dokumen
- Total findings per severity
- Top 10 priority fix list

## Severity criteria

| Level | Definition |
|---|---|
| **Critical** | Block feature, data loss risk, security hole, build broken |
| **High** | UX broken, accessibility violation, runtime error path |
| **Medium** | Quality concern, future risk, inconsistent pattern |
| **Low** | Nice-to-have, cosmetic, minor refactor |

## Effort

~1-2 jam untuk scan + tulis. Tidak termasuk diskusi follow-up atau implementation.

## Acceptance

- ✅ 1 dokumen audit di `docs/superpowers/audits/2026-05-17-comprehensive.md`
- ✅ Coverage 8 dimensi
- ✅ Min 20 findings dengan file:line reference
- ✅ Severity matrix & priority list
- ✅ Tidak ada code change
