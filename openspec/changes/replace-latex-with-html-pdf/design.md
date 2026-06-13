## Context

The MVP currently renders exams to PDF by compiling LaTeX server-side (`src/lib/generate-latex.ts` + `spawn` of Tectonic/pdflatex in `src/app/api/pdf/route.ts`). This requires a LaTeX toolchain on the host, which is incompatible with serverless platforms such as Vercel and adds heavy operational coupling. The product's actual goal is to hand the teacher a professional-looking PDF; the `.tex` intermediate is incidental.

The existing forms (`TestForm`, `QuestionForm`), types (`Test`, `Question`), MathLive editing, and KaTeX rendering work and stay in place. This change replaces only the rendering/export backend: LaTeX → a React/HTML print layout rendered to PDF by a headless browser.

Current data flow: `Form → JSON → LaTeX → Tectonic/pdflatex → PDF`.
Target data flow: `Form → JSON → PrintableTest (React/HTML) → Playwright → PDF`.

## Goals / Non-Goals

**Goals:**
- Remove all LaTeX/Tectonic/pdflatex dependencies and configuration.
- Single source of truth for the printed look: one `PrintableTest` component reused by both the live preview and the PDF API.
- Generate A4 PDFs from HTML via a headless browser, deployable on Vercel.
- Visual parity between preview and exported PDF (same component, same CSS).
- Preserve existing forms, types, MathLive, and KaTeX behavior.

**Non-Goals:**
- No new product features beyond the live preview described in the proposal.
- No database, authentication, multiple templates, or visual editor.
- No persistence of generated PDFs.
- No client-side PDF generation (export stays server-side for fidelity).

## Decisions

### Decision 1: Playwright over Puppeteer
Use **Playwright** (`playwright-core` + a Chromium binary) to render HTML→PDF.
- **Why**: Modern API, reliable Chromium bundling, good Vercel/serverless story, and robust A4 PDF options (`format: "A4"`, `printBackground`, margins). Puppeteer is also viable but Playwright's install/model and `page.pdf()` options fit cleanly.
- **Alternative considered**: Puppeteer + `@sparticuz/chromium` — equally valid; Playwright chosen for API ergonomics and maintained browser packaging.

### Decision 2: Server-side render `PrintableTest` to a complete HTML document
In the `/api/pdf` route, render `PrintableTest` to an HTML string using `react-dom/server` (`renderToString`), wrap it in a full `<!DOCTYPE html>` document, inline the print CSS and KaTeX CSS, and set the document content via `page.setContent(html)`.
- **Why**: Produces a self-contained, deterministic HTML payload; avoids network fetches during render (faster, no flaky external CSS). KaTeX math is rendered to static HTML server-side, so the browser only needs the KaTeX stylesheet (inlined), no JS execution required.
- **Alternative considered**: Run a real page route and `page.goto()` it — adds a network hop and couples PDF gen to app routing; rejected for determinism.

### Decision 3: Single shared `PrintableTest` component + scoped print CSS
`PrintableTest` is a pure presentational component (props: `test: Test`). It is used:
- Inside `TestPreview` for the in-app live preview.
- Server-side in the API route to build the export HTML.
A dedicated print stylesheet (A4 size, margins, page-break rules, answer lines) is applied. In-app, the preview is framed so the print CSS does not leak into the form UI (e.g., scoped via a container class or CSS namespace).
- **Why**: Guarantees preview/PDF parity by construction and keeps concerns separated.

### Decision 4: KaTeX rendered as static HTML
Math expressions are pre-rendered to KaTeX HTML (server-side `katex.renderToString`, and client-side in the editor preview as today). The PDF document includes the inlined KaTeX CSS so glyphs/fonts render correctly without runtime JS.
- **Why**: Headless render is static and fast; no dependency on webfont network loads.
- **Risk**: KaTeX fonts — mitigate by inlining/base64-embedding the required KaTeX woff2 fonts, or by including the font files so `setContent` can resolve them. (See Risks.)

### Decision 5: Vercel deployment compatibility
On Vercel, the API route runs as a serverless function. Use a Chromium build compatible with serverless (e.g., `@playwright/browser-chromium` resolved at build, or a managed chromium). Configure the function with adequate max-duration and a system dependency allowlist if needed.
- **Why**: Playwright's Chromium needs system libs; Vercel supports this via build configuration.

## Risks / Trade-offs

- **[KaTeX font resolution in headless render]** → Inline/base64 the KaTeX woff2 fonts (or ship the font files and reference them) so `setContent`-rendered PDF shows correct math glyphs rather than fallback boxes.
- **[Cold-start latency on serverless]** → Headless browser cold starts are slower than the old `spawn`. Acceptable for a low-frequency export action; mitigate with sensible function timeout and keeping payloads small.
- **[Memory/size limits on serverless]** → Chromium is heavy. Monitor function size/memory; if it exceeds Vercel limits, fall back to `@sparticuz/chromium`-style minimal build. Flag as an open question if limits are hit.
- **[Page-break control]** → CSS break rules are best-effort across browsers; mitigate with `break-inside: avoid` on question blocks and reserved answer space sized to avoid overflow.
- **[Removing the `501` missing-engine behavior]** → Behavior change: the route no longer returns `501` for a missing LaTeX engine. Documented as breaking in the proposal; acceptable since the new path needs no LaTeX engine.

## Migration Plan

1. Add `PrintableTest` + `TestPreview` and the print CSS (additive, no behavior change yet).
2. Rewire `/api/pdf` to the Playwright HTML→PDF path; validate end-to-end on a sample `Test`.
3. Wire `TestPreview` into the page so the teacher sees the live preview.
4. Delete `src/lib/generate-latex.ts`, the `spawn`/engine logic, and remove the `LATEX_ENGINE`/Tectonic/pdflatex references from the README.
5. Remove now-unused dependencies (none LaTeX-specific in `package.json` today besides the system binaries; confirm `generate-latex.ts`'s imports are gone).
6. Verify `npm run typecheck` and `npm run lint`, and smoke-test PDF export + preview locally.

**Rollback**: Until step 4, both paths can coexist. After deletion, rollback is `git revert` of the change commit; no data migrations exist.

## Open Questions

- Exact Vercel function size/memory limits for the Chromium-based route, and whether the managed Playwright Chromium fits or a minimal `@sparticuz/chromium` build is required. (Resolve during implementation/testing on Vercel.)
- Whether to base64-inline all KaTeX fonts or only the math glyphs actually used (full inline is simplest; optimize later if payload size matters).
