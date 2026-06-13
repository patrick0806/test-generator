## Context

The repository is an early-stage Next.js 16 (App Router) + React 19 + TypeScript project with TailwindCSS v4 and shadcn/ui. Domain types already exist (`Test`, `Question`) and the `mathlive` and `zod` packages are installed but unused. There is no UI, no form logic, and no PDF pipeline. This change adds a single-page MVP that lets a teacher compose an exam and download a PDF — no database, no auth, no persistence. All exam state lives in client memory for the session and is POSTed to an API Route on demand.

Existing types (`src/types/`):

```ts
type Question = { description: string; options: string[]; type: 'open' | 'multiple-choice' }
type Test = { id: string; school: string; teacher: string; title: string; questions: Question[] }
```

The user's required form fields are title, teacher, date, and questions — so `Test` needs a new `date` field. The unused `id`/`school` fields remain on the type but are not required by the MVP form.

## Goals / Non-Goals

**Goals:**
- Compose an exam via a shadcn/ui form: title, teacher, date, and a dynamic list of questions.
- Support two question types — `open` and `multiple-choice` — with optional alternatives for the latter.
- Author math inline with MathLive, persist the value as LaTeX, and render a live KaTeX preview.
- Generate a complete LaTeX document from a `Test` via `generateLatex(test: Test): string`.
- Compile LaTeX → PDF server-side and return it for download.
- Strong typing (Zod schemas mirrored to domain types) and clear separation of concerns.

**Non-Goals:**
- No database, authentication, or persistence of any kind.
- No template customization, themes, or multiple exam layouts.
- No answer keys, grading, or scoring.
- No drag-and-drop question reordering (MVP).
- No collaborative/multi-user editing.

## Decisions

### D1: Form architecture — React Hook Form + Zod, all Client Components
The authoring UI needs local state and event handlers, so `test-form.tsx` and its children are `"use client"` components. `app/page.tsx` stays a thin Server Component that renders `<TestForm />`.

- Validation is driven by Zod schemas (`lib/schemas.ts`) that mirror the domain types. React Hook Form binds to them via `@hookform/resolvers/zod`.
- The dynamic question list uses `useFieldArray`. Each question row embeds `question-form.tsx`, which conditionally renders the alternatives sub-array (also a `useFieldArray`) only when `type === 'multiple-choice'`.
- The form's `onSubmit` POSTs the validated `Test` payload (JSON) to `/api/pdf` and triggers a browser download from the returned blob.

*Alternatives considered:* plain `useState` (rejected — verbose for nested arrays, no schema validation), or Formik (rejected — RHF is smaller and pairs natively with Zod resolvers).

### D2: Math input — MathLive `<math-field>` + KaTeX preview
`math-input.tsx` is a Client Component that mounts a MathLive `<math-field>` web component. MathLive emits its value in LaTeX (with `\(...\)` delimiters by default); we strip delimiters and store the raw LaTeX string in RHF via a Controller so the stored value is plain LaTeX reusable by both the preview and the PDF generator.

- The live preview is rendered with KaTeX (`katex.renderToString`, `throwOnError: false`) so an invalid/incomplete expression shows nothing instead of throwing.
- `math-input` is reused inside `question-form.tsx` (for the statement and each alternative) and could back the title field too.

*Alternatives considered:* KaTeX-only input (no WYSIWYG, poor UX), or CodeCogs/MathJax (heavier, no inline editor).

### D3: PDF pipeline — generate LaTeX, then compile with a TeX engine via child process
`lib/generate-latex.ts` exposes `generateLatex(test: Test): string` and produces a single, simple `article`-class document (per the template in the proposal). All interpolated values are run through a `escapeLatex()` helper to neutralize characters that break compilation (`%`, `$`, `&`, `#`, `_`, `{`, `}`, `\`, `~`, `^`).

The API Route (`app/api/pdf/route.ts`) is a `POST` handler that:
1. Parses + validates the JSON body against the Zod `testSchema`.
2. Calls `generateLatex(test)` → `.tex` string.
3. Writes the `.tex` to an OS temp directory.
4. Invokes a LaTeX engine via `child_process` to compile to PDF.
5. Reads the resulting PDF `Buffer` and returns it as `application/pdf` with a `Content-Disposition: attachment` header.
6. Cleans up the temp files.

**Engine choice — Tectonic (primary) / pdflatex (fallback):** Tectonic is a single self-contained binary that auto-fetches LaTeX packages on demand, making it the lowest-friction option for a host with no full TeX Live install. If Tectonic is unavailable, the route falls back to `pdflatex` (assumes a TeX Live install). The engine is selected via an env var (`LATEX_ENGINE`, default `tectonic`).

*Alternatives considered:* `@latex.js/node` (pure JS — renders to HTML, not PDF, so unsuitable), `node-latex`/`texega` npm wrappers (thin shells over the same binaries with stale deps), client-side PDF (jsPDF — cannot compile LaTeX).

### D4: Zod schema layer
Add `lib/schemas.ts` with `questionSchema` and `testSchema`. `testSchema` infers a type that is structurally compatible with the domain `Test` (plus the new `date`). Using a schema layer (rather than annotating `types/*.ts` directly) keeps the domain types free of runtime concerns and gives a single source of truth for both client validation and API payload validation.

### D5: Type change — add `date` to `Test`
Extend `src/types/test.ts` with `date: string` (ISO `yyyy-mm-dd` string; formatted into the LaTeX `\date{}` during generation). This is additive and non-breaking for the empty app.

## Risks / Trade-offs

- **[TeX engine must be installed on the host]** → Mitigation: detect engine availability in the route and return a clear `501` with guidance if none is found; document the prerequisite in README/tasks. Engine is configurable via `LATEX_ENGINE`.
- **[Untrusted input breaks LaTeX compilation]** → Mitigation: `escapeLatex()` on every interpolated value; compile in a throwaway temp dir; never trust math content beyond escaping (MVP trusts the single teacher user).
- **[MathLive is a web component, SSR/hydration friction]** → Mitigation: render the `<math-field>` only after mount (guarded by a mounted flag / dynamic import with `ssr:false`) to avoid hydration mismatches.
- **[No persistence means data loss on refresh]** → Accepted for MVP; explicitly out of scope.
- **[Tectonic first run downloads packages (slow/cold)]** → Mitigation: acceptable for MVP; warming the cache can be a follow-up.
