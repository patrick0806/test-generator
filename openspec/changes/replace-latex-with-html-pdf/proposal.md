## Why

The current PDF pipeline compiles LaTeX on the server via Tectonic/pdflatex. This requires a LaTeX toolchain installed on the host, which is incompatible with serverless deployments like Vercel and adds heavy operational dependencies. The product's goal is simply to deliver a visually professional PDF to the teacher, not to produce `.tex` files — so the LaTeX layer is unnecessary complexity blocking deployability.

## What Changes

- **BREAKING**: Remove all LaTeX generation logic (`src/lib/generate-latex.ts`) and server-side `.tex` compilation.
- **BREAKING**: Remove the dependency on Tectonic, TeX Live, and `pdflatex`, including the `LATEX_ENGINE` configuration.
- Add a `PrintableTest` React component that renders the print-faithful version of a `Test` (header, teacher, date, numbered questions, open-question answer space, multiple-choice alternatives) with A4-optimized print CSS.
- Add a `TestPreview` component that renders `PrintableTest` in-app for a live, real-time preview so what the teacher sees matches the exported PDF.
- Rework the `POST /api/pdf` route to render `PrintableTest` to HTML and generate an A4 PDF via Playwright, then return the PDF for download.
- Keep the existing forms (`TestForm`, `QuestionForm`), types (`Test`, `Question`), MathLive editing, and KaTeX rendering unchanged in behavior.

## Capabilities

### New Capabilities
- `pdf-export`: Server-side PDF generation from a React/HTML rendering of the test using a headless browser (Playwright), with an A4 print layout produced by the `PrintableTest` component.
- `live-preview`: In-app real-time preview that reuses the same `PrintableTest` component used for export, guaranteeing visual parity between preview and generated PDF.

### Modified Capabilities
<!-- No baseline specs exist in openspec/specs/ yet, so all target capabilities are introduced as new specs. -->

## Impact

- **Code removed**: `src/lib/generate-latex.ts` and all LaTeX/`spawn` logic in `src/app/api/pdf/route.ts`.
- **Code added**: `src/components/printable-test.tsx`, `src/components/test-preview.tsx`, reworked `src/app/api/pdf/route.ts`, print CSS.
- **Dependencies**: Add Playwright (server-side PDF rendering). Remove reliance on Tectonic/pdflatex system binaries. `@types/katex` is retained for KaTeX math rendering.
- **APIs**: `POST /api/pdf` keeps the same contract (accepts `Test` JSON, returns `application/pdf`) but no longer requires a LaTeX engine; failure modes change (e.g., no more `501` missing-engine response).
- **Deployment**: Becomes compatible with Vercel/serverless (Playwright via compatible build) instead of requiring a LaTeX toolchain.
- **No data, auth, or templates added.**
