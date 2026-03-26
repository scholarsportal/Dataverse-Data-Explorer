# Dataverse Data Explorer — Rewrite Specification

**Version:** 1.0
**Date:** 2026-03-23
**Repository:** `scholarsportal/Dataverse-Data-Curation-Tool`
**Branch:** `nana-dev`

---

## 1. Project Overview

The Dataverse Data Explorer is an external tool for Dataverse repositories that enables researchers and data curators to browse, edit, and cross-tabulate research dataset metadata (DDI-compliant XML). It is launched from Dataverse via query parameters (`fileId`, `siteURL`, `apiToken`).

### 1.1 Rewrite Goals

| Goal | Metric |
|---|---|
| Embeddable packages | Cross-tab calculator and variable editor available as Web Components for use in odesi-rest (Angular 14), plain HTML, or iframes |
| Remove legacy dependencies | Zero jQuery, PrimeNG, ngx-translate in production bundle |
| Performance | LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| Accessibility | WCAG 2.1 AA compliance — 4.5:1 contrast, keyboard nav, screen reader support |
| Security | All inputs validated with Zod at API boundary, CSP headers, CSRF protection |
| Maintainability | Nx module boundaries enforced, 90%+ line coverage, 85%+ branch coverage |
| Bilingual | Full en-CA / fr-CA support |

### 1.2 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21.2 (zoneless, signals-first) |
| Monorepo | Nx 22.6 |
| Package manager | pnpm |
| State management | @ngrx/signals (SignalStore, component-scoped) |
| XML parsing | fast-xml-parser v5 (isArray callback) |
| Styling | Pure CSS + CSS custom properties (no Tailwind/DaisyUI) |
| Testing | Vitest (native @angular/build:unit-test), Playwright (e2e) |
| Linting | ESLint (flat config), angular-eslint |
| i18n | @angular/localize (host app), signal-based DdeTranslatePipe (packages) |
| CI/CD | GitHub Actions |
| Web Components | @angular/elements + createCustomElement |

---

## 2. Architecture

### 2.1 Monorepo Structure

```
apps/
  data-explorer/              # Host app — Dataverse API, state orchestration
  data-explorer-e2e/          # Playwright e2e tests

libs/
  shared/
    models/                   # @dde/models  — Pure TS interfaces, zero dependencies
    util/                     # @dde/util    — Pure helper functions
    ui/                       # @dde/ui      — Shared Angular primitives (i18n, theme, a11y, charts)
  pivot-table/                # @dde/pivot-table          — Pivot engine + Angular renderer
  cross-tab-calculator/       # @dde/cross-tab-calculator — Full cross-tab feature (Web Component)
  variable-editor/            # @dde/variable-editor      — Full variable editing (Web Component)
```

### 2.2 Dependency Graph

```
@dde/models              → (none)
@dde/util                → @dde/models
@dde/ui                  → @dde/models
@dde/pivot-table         → @dde/models
@dde/cross-tab-calculator → @dde/models, @dde/util, @dde/ui, @dde/pivot-table
@dde/variable-editor     → @dde/models, @dde/util, @dde/ui
data-explorer (app)      → all libs
```

### 2.3 Module Boundary Tags

| Project | scope | type |
|---|---|---|
| @dde/models | shared | models |
| @dde/util | shared | util |
| @dde/ui | shared | ui |
| @dde/pivot-table | feature | lib |
| @dde/cross-tab-calculator | feature | lib |
| @dde/variable-editor | feature | lib |
| data-explorer | app | app |

**Rules:**
- `type:models` → depends on nothing
- `type:util` → depends on `type:models` only
- `type:ui` → depends on `type:models` only
- `scope:feature` → depends on `scope:shared` and `scope:feature`
- `scope:app` → depends on anything

### 2.4 Key Design Principles

1. **Packages are data-agnostic** — no HTTP calls, no Dataverse knowledge. Data in via `input()`, events out via `output()`.
2. **Component-scoped SignalStore** — never `providedIn: 'root'`.
3. **DDI XML fidelity** — raw `ddiJSONStructure` (with `@_` prefixed attributes) is source of truth for uploads. Normalized `DdeVariable[]` is a read-only view layer for packages.
4. **No routing** — single-view tool launched with query params.
5. **Signals-first** — `signal()`, `computed()`, `effect()`, `input()`, `output()`, `inject()`.

---

## 3. Data Models (`@dde/models`)

### 3.1 Normalized Models (read-only view layer)

```typescript
export interface DdeVariable {
  id: string;
  name: string;
  label: string;
  interval: 'nominal' | 'ordinal' | 'interval' | 'ratio' | 'continuous' | 'discrete';
  isWeight: boolean;
  assignedWeightId: string | null;
  question: DdeQuestion;
  universe: string;
  notes: string;
  categories: DdeCategory[];
  summaryStatistics: DdeSummaryStatistics;
  format: string;
}

export interface DdeQuestion {
  literal: string;
  interviewer: string;
  post: string;
}

export interface DdeCategory {
  value: string;
  label: string;
  frequency: number;
  isMissing: boolean;
}

export interface DdeVariableGroup {
  id: string;
  label: string;
  variableIds: string[];
}

export interface DdeSummaryStatistics {
  mean?: number;
  mode?: number;
  median?: number;
  standardDeviation?: number;
  minimum?: number;
  maximum?: number;
  validCount?: number;
  invalidCount?: number;
}
```

### 3.2 Cross-Tab Types

```typescript
export type CrossTabObservationData = Record<string, string[]>;
export type CrossTabMissingCategories = Record<string, Set<string>>;

export interface CrossTabSelection {
  variableId: string;
  axis: 'row' | 'column';
}

export type AggregatorType = 'count' | 'sum' | 'average' | 'minimum' | 'maximum';
export type PercentageMode = 'none' | 'row' | 'column' | 'total';
```

### 3.3 Common Types

```typescript
export type DdeTranslations = Record<string, string>;
export type DdeLocale = 'en-CA' | 'fr-CA';
export type DdeTheme = 'light' | 'dark';

export interface DdeOperationStatus {
  state: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
}
```

---

## 4. Package APIs

### 4.1 `@dde/cross-tab-calculator`

**Inputs:**

| Input | Type | Required |
|---|---|---|
| `variables` | `DdeVariable[]` | yes |
| `variableGroups` | `DdeVariableGroup[]` | yes |
| `observationData` | `CrossTabObservationData` | yes |
| `locale` | `DdeLocale` | no (default: `'en-CA'`) |
| `theme` | `DdeTheme` | no (default: `'light'`) |
| `translations` | `DdeTranslations` | no (default: `{}`) |

**Outputs:**

| Output | Payload |
|---|---|
| `weightVariableChanged` | `{ variableId: string \| null }` |
| `selectionChanged` | `CrossTabSelection[]` |
| `missingCategoriesChanged` | `CrossTabMissingCategories` |

### 4.2 `@dde/variable-editor`

**Inputs:**

| Input | Type | Required |
|---|---|---|
| `variables` | `DdeVariable[]` | yes |
| `variableGroups` | `DdeVariableGroup[]` | yes |
| `observationData` | `CrossTabObservationData` | no |
| `weights` | `Record<string, string>` | no |
| `hasEditPermission` | `boolean` | no (default: `false`) |
| `operationStatus` | `DdeOperationStatus` | no |
| `locale` | `DdeLocale` | no (default: `'en-CA'`) |
| `theme` | `DdeTheme` | no (default: `'light'`) |
| `translations` | `DdeTranslations` | no (default: `{}`) |

**Outputs:**

| Output | Payload |
|---|---|
| `variableSaved` | `{ variableId: string, changes: Partial<DdeVariable>, groupIds: string[] }` |
| `bulkVariablesSaved` | `{ variableIds: string[], changes: Partial<DdeVariable> }` |
| `groupCreated` | `{ groupId: string, label: string }` |
| `groupRenamed` | `{ groupId: string, newLabel: string }` |
| `groupDeleted` | `{ groupId: string }` |
| `variablesRemovedFromGroup` | `{ groupId: string, variableIds: string[] }` |
| `xmlImportRequested` | `{ xmlString: string, template: ImportVariableTemplate }` |
| `weightProcessRequested` | `{ variableIds: string[], weightId: string }` |

---

## 5. State Management

### 5.1 DDI XML Fidelity

```
READ:  ddiJSONStructure → DdiNormalizer.toVariables() → DdeVariable[] → package input
WRITE: package output → DdiNormalizer.applyChanges(rawDdi, changes) → ddiJSONStructure → XMLBuilder → Dataverse
```

The raw DDI JSON (with `@_` prefixed attributes from fast-xml-parser) is never discarded. Packages only see normalized models. All mutations flow through `DdiNormalizer.applyChanges()` which modifies the raw structure directly, preserving XML fidelity for Dataverse uploads.

### 5.2 fast-xml-parser v5 Configuration

```typescript
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name: string) =>
    ['var', 'varGrp', 'catgry', 'sumStat', 'catValu', 'notes'].includes(name),
};
```

### 5.3 Host App Store (DataverseStore)

Component-scoped `signalStore()` in the host app holding:
- `rawDdi: ddiJSONStructure` — canonical truth
- `variables: DdeVariable[]` — computed from rawDdi
- `variableGroups: DdeVariableGroup[]` — computed from rawDdi
- `observationData: CrossTabObservationData` — fetched separately

### 5.4 Package Stores

Each package has its own component-scoped `signalStore()` for UI-only state (selections, pagination, filters, modal open/close). No data duplication — packages derive everything from their inputs.

---

## 6. i18n Strategy

### 6.1 Host App — Build-time (`@angular/localize`)

- `$localize` tagged templates for host-only strings
- One build per locale: `/en-CA/`, `/fr-CA/`
- Language switch = page redirect to other locale build
- Translation files: `messages.en-CA.xlf`, `messages.fr-CA.xlf`

### 6.2 Packages — Runtime (signal-based)

- Packages accept `translations: DdeTranslations` input (flat `Record<string, string>`)
- `@dde/ui` provides `DDE_TRANSLATIONS` injection token (writable signal) + `DdeTranslatePipe`
- Package root component syncs input into token via `effect()`

### 6.3 Key Prefixes

| Scope | Prefix | Managed via |
|---|---|---|
| Host app | (none) | `$localize` + XLF |
| Cross-tab | `CROSS_TAB.` | JSON |
| Variable editor | `VAR_EDITOR.` | JSON |
| Shared UI | `SHARED.` | JSON |

---

## 7. Web Component Strategy

Each package provides `registerCustomElement()`:

```typescript
// Angular host
<dde-cross-tab-calculator [variables]="vars" (selectionChanged)="onSelect($event)">

// Plain HTML
const el = document.querySelector('dde-cross-tab-calculator');
el.variables = [...];
el.addEventListener('selectionChanged', (e) => { ... });
```

**Dual build targets per package:**
1. Angular library (tree-shaking, AOT) — for host app
2. Web Component bundle (single JS file) — for external embedding

---

## 8. CSS Architecture

- **No frameworks** — pure CSS with CSS custom properties
- **Design tokens** in `@dde/ui`: colors, spacing (4px base), typography, elevation, motion
- **Material Design** reference for spacing scale, elevation levels, typography scale
- **Theming** via `[data-theme="light"]` / `[data-theme="dark"]` on host element
- **Accessibility**: 4.5:1 contrast, `prefers-reduced-motion`, `prefers-color-scheme`, focus indicators
- **Logical properties** (`margin-inline`, `padding-block`) for RTL readiness

---

## 9. Implementation Milestones

### Milestone 0: Project Foundation
> Configure the workspace for production-grade development.

- [ ] **0.1** Enable `strict: true` in tsconfig.base.json
- [ ] **0.2** Add `composite: true` to all library tsconfig.lib.json and tsconfig.spec.json
- [ ] **0.3** Configure Nx project tags and ESLint module boundary rules
- [ ] **0.4** Remove demo/scaffold code (nx-welcome, example.spec)
- [ ] **0.5** Remove unused dependencies (express, @angular/ssr, @angular/platform-server)
- [ ] **0.6** Remove routing files (app.routes.ts, app.routes.server.ts, server.ts, main.server.ts, app.config.server.ts)
- [ ] **0.7** Set up GitHub Actions CI pipeline (lint, build, test on PR)
- [ ] **0.8** Add root package.json scripts (dev, build, test, lint)

### Milestone 1: Shared Libraries (`@dde/models`, `@dde/util`, `@dde/ui`)
> Build the foundation layer that all packages depend on.

- [ ] **1.1** `@dde/models` — Define all normalized interfaces (DdeVariable, DdeVariableGroup, DdeCategory, DdeSummaryStatistics, CrossTab types, common types)
- [ ] **1.2** `@dde/models` — Define raw DDI interface types (ddiJSONStructure with `@_` prefix attrs)
- [ ] **1.3** `@dde/util` — Port CSV export utility
- [ ] **1.4** `@dde/util` — Port text helpers (truncatedText, number formatting)
- [ ] **1.5** `@dde/ui` — CSS design tokens (custom properties for colors, spacing, typography, elevation, motion)
- [ ] **1.6** `@dde/ui` — DDE_TRANSLATIONS injection token + DdeTranslatePipe + DdeTranslateDirective
- [ ] **1.7** `@dde/ui` — Primitive components: button, input, select, modal, badge, tooltip
- [ ] **1.8** `@dde/ui` — BarChartComponent (Chart.js wrapper)
- [ ] **1.9** `@dde/ui` — Accessibility: LiveAnnouncer token, FocusTrap directive, keyboard nav utilities
- [ ] **1.10** Unit tests for all exports (90%+ coverage)

### Milestone 2: Pivot Table Engine (`@dde/pivot-table`)
> Replace jQuery PivotTable with a pure TypeScript engine.

- [ ] **2.1** PivotEngine class — core aggregation logic (count, sum, average, min, max)
- [ ] **2.2** Percentage transforms (row%, col%, total%)
- [ ] **2.3** Number formatter utility
- [ ] **2.4** PivotTableComponent — Angular renderer with `@for`, signal inputs, pure CSS
- [ ] **2.5** Unit tests with data matching current jQuery PivotTable output
- [ ] **2.6** Performance test: 1000+ variable dataset within 200ms render

### Milestone 3: Cross-Tab Calculator (`@dde/cross-tab-calculator`)
> Full cross-tabulation feature as an embeddable package.

- [ ] **3.1** CrossTabStore (component-scoped SignalStore)
- [ ] **3.2** Variable selection component (native select, grouped by DdeVariableGroup)
- [ ] **3.3** Cross-table component (wraps PivotTableComponent)
- [ ] **3.4** Cross-chart component (Chart.js bar/stacked charts)
- [ ] **3.5** Missing category filter
- [ ] **3.6** CSV export action
- [ ] **3.7** View options (aggregator type, percentage mode, number format)
- [ ] **3.8** Web Component registration (`registerCrossTabCalculator()`)
- [ ] **3.9** Web Component standalone bundle build configuration
- [ ] **3.10** Integration tests: Angular component + plain HTML Web Component
- [ ] **3.11** Unit tests (90%+ coverage)

### Milestone 4: Variable Editor (`@dde/variable-editor`)
> Full variable editing feature as an embeddable package.

- [ ] **4.1** VariableEditorStore (component-scoped SignalStore)
- [ ] **4.2** Sidebar component (group list, create/rename/delete groups)
- [ ] **4.3** Variable table component (pagination, search, multi-select, column sort)
- [ ] **4.4** Variable view modal (read-only detail view with category chart)
- [ ] **4.5** Variable edit modal (label, question, universe, notes, categories, weight, groups)
- [ ] **4.6** Bulk edit modal (apply changes to multiple selected variables)
- [ ] **4.7** XML import component (file upload, field mapping template)
- [ ] **4.8** Web Component registration (`registerVariableEditor()`)
- [ ] **4.9** Web Component standalone bundle build configuration
- [ ] **4.10** Integration tests: Angular component + plain HTML Web Component
- [ ] **4.11** Unit tests (90%+ coverage)

### Milestone 5: Data Explorer Host App
> Compose all packages into the full Data Explorer application.

- [ ] **5.1** DataverseStore (SignalStore) — canonical data holder (rawDdi, loading, error states)
- [ ] **5.2** DataverseApiService — HTTP calls (fetchDdi, uploadDdi, fetchObservationData, fetchSignedUrl)
- [ ] **5.3** DdiNormalizer — bidirectional conversion (toVariables, toVariableGroups, applyChanges)
- [ ] **5.4** Install and configure fast-xml-parser v5 with isArray callback
- [ ] **5.5** App shell component — reads query params, orchestrates loading
- [ ] **5.6** Header component (dataset title, citation, download/upload, language switch, theme toggle)
- [ ] **5.7** Tab container — switch between cross-tab calculator and variable editor views
- [ ] **5.8** Bridge wiring — connect DataverseStore signals to package inputs, handle package outputs
- [ ] **5.9** Configure @angular/localize — extract, XLF files for en-CA / fr-CA
- [ ] **5.10** Package translation JSON files (package-translations.en-CA.json, fr-CA.json)
- [ ] **5.11** Error handling — HTTP interceptor, user-facing error states, retry logic
- [ ] **5.12** Matomo analytics integration
- [ ] **5.13** Dataverse external tool manifests (configure-manifest.json, explore-manifest.json)

### Milestone 6: Quality Assurance
> Comprehensive testing, accessibility, and performance validation.

- [ ] **6.1** E2e tests — full user flows (load dataset, view variables, edit variable, cross-tab, export CSV, import XML)
- [ ] **6.2** Accessibility audit — axe-core integration, keyboard navigation tests, screen reader verification
- [ ] **6.3** i18n verification — both locales render correctly, no untranslated strings
- [ ] **6.4** Theme verification — light/dark modes render correctly
- [ ] **6.5** Web Component standalone tests — plain HTML, Angular 14 host, iframe
- [ ] **6.6** Performance testing — 1000+ variables, lighthouse audit, bundle analysis
- [ ] **6.7** Security review — CSP headers, CSRF, input validation, no XSS vectors
- [ ] **6.8** Cross-browser testing — Chrome, Firefox, Safari, Edge

### Milestone 7: Deployment & Migration
> Ship it.

- [ ] **7.1** GitHub Actions — production build pipeline (lint, test, build, deploy)
- [ ] **7.2** Deploy Data Explorer app
- [ ] **7.3** Publish Web Component bundles (npm or CDN)
- [ ] **7.4** Update Dataverse external tool manifests
- [ ] **7.5** Migration guide for consumers upgrading from old tool
- [ ] **7.6** Package documentation (README per package, embedding guide, API reference)

---

## 10. GitHub Project Labels

| Label | Color | Description |
|---|---|---|
| `epic:foundation` | `#0E8A16` | Milestone 0 — project setup |
| `epic:shared-libs` | `#1D76DB` | Milestone 1 — @dde/models, util, ui |
| `epic:pivot-table` | `#5319E7` | Milestone 2 — pivot engine |
| `epic:cross-tab` | `#B60205` | Milestone 3 — cross-tab calculator |
| `epic:variable-editor` | `#D93F0B` | Milestone 4 — variable editor |
| `epic:host-app` | `#FBCA04` | Milestone 5 — data explorer app |
| `epic:qa` | `#0075CA` | Milestone 6 — quality assurance |
| `epic:deploy` | `#006B75` | Milestone 7 — deployment |
| `priority:critical` | `#B60205` | Must fix before milestone close |
| `priority:high` | `#D93F0B` | Important, schedule soon |
| `priority:medium` | `#FBCA04` | Normal priority |
| `priority:low` | `#0E8A16` | Nice to have |
| `type:feature` | `#1D76DB` | New functionality |
| `type:bug` | `#B60205` | Defect |
| `type:chore` | `#D4C5F9` | Maintenance / config |
| `type:test` | `#0075CA` | Test coverage |
| `type:docs` | `#C5DEF5` | Documentation |
| `type:security` | `#B60205` | Security concern |
| `type:a11y` | `#5319E7` | Accessibility |
| `type:perf` | `#006B75` | Performance |

---

## 11. Acceptance Criteria (Definition of Done)

Every issue must meet these before closing:

1. Code compiles with zero errors (`npx tsc --noEmit`)
2. All unit tests pass (`pnpm nx run-many -t test`)
3. All lint rules pass (`pnpm nx run-many -t lint`)
4. 90%+ line coverage, 85%+ branch coverage on changed code
5. No `any` types except at validated boundaries with Zod
6. Accessibility: keyboard navigable, ARIA labels, 4.5:1 contrast
7. i18n: all user-facing strings use translate pipe or $localize
8. PR reviewed and approved
9. No regressions in existing tests

---

## 12. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| jQuery PivotTable parity | High — users expect identical output | Milestone 2 includes comparison tests against current output |
| Web Component bundle size | Medium — large Angular bundles | Tree-shaking, lazy loading, bundle analysis in Milestone 6 |
| DDI XML round-trip fidelity | Critical — broken uploads corrupt data | DdiNormalizer never touches raw structure; dedicated fuzz tests |
| fast-xml-parser v5 breaking changes | Medium — v4→v5 API changes | Pin version, wrap in thin service layer |
| Browser compatibility | Low — Angular 21 drops old browsers | Test matrix in Milestone 6 |
