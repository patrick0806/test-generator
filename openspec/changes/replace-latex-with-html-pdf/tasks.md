## 1. Setup & dependencies

- [x] 1.1 Add Playwright dependency to `package.json` (`playwright-core` + a Chromium browser package suitable for serverless) and install
- [x] 1.2 Ensure Playwright Chromium is available locally (run the browser install) and document the Vercel build requirement in the README

## 2. PrintableTest component & print CSS

- [x] 2.1 Create `src/components/printable-test.tsx` as a pure presentational component accepting a `test: Test` prop (header with title/teacher/date, numbered questions, open-question answer space, multiple-choice alternatives)
- [x] 2.2 Render math in `PrintableTest` via KaTeX (`katex.renderToString`, `throwOnError: false`) so statements and alternatives render correctly
- [x] 2.3 Create the A4 print-optimized stylesheet (A4 size, sensible margins, `break-inside: avoid` on question blocks, reserved answer lines for open questions) scoped so it does not leak into the form UI
- [x] 2.4 Format the date as dd/mm/yyyy in the header, falling back gracefully on unparseable values

## 3. Server-side HTML rendering utilities

- [x] 3.1 Create a server utility that renders `PrintableTest` to an HTML string (`react-dom/server` `renderToString`) and wraps it in a complete `<!DOCTYPE html>` document with the print CSS and KaTeX CSS inlined
- [x] 3.2 Inline/embed the KaTeX woff2 fonts (or ship font files) so headless rendering shows correct math glyphs without network fetches
- [x] 3.3 Verify the generated HTML is self-contained (no external network dependencies)

## 4. Rework the PDF API route

- [x] 4.1 Replace the LaTeX/`spawn` logic in `src/app/api/pdf/route.ts` with Playwright HTML→PDF generation (`page.setContent` then `page.pdf` with `format: "A4"`, `printBackground: true`, margins)
- [x] 4.2 Keep validation: invalid body responds `400` and SHALL NOT launch the browser; valid body responds `200` with `application/pdf` and `Content-Disposition: attachment`
- [x] 4.3 Handle render/launch failures with a generic `5xx` error message (no internal detail leakage) and ensure the browser instance is always closed
- [x] 4.4 Remove the `501` missing-engine path and all `LATEX_ENGINE`/engine-selection logic

## 5. Live preview

- [x] 5.1 Create `src/components/test-preview.tsx` that renders `PrintableTest` inside a framed container (scoped CSS) for the in-app preview
- [x] 5.2 Wire `TestPreview` into `src/app/page.tsx` (or `TestForm`) so it updates in real time from the current form values and shows KaTeX math parity with the export

## 6. Remove the LaTeX layer

- [x] 6.1 Delete `src/lib/generate-latex.ts`
- [x] 6.2 Remove all LaTeX/Tectonic/pdflatex references from `README.md` (prerequisites, `LATEX_ENGINE` section) and document the new Playwright/Chromium requirement
- [x] 6.3 Confirm no remaining imports of `generate-latex` or references to a LaTeX engine anywhere in the codebase

## 7. Verification

- [x] 7.1 Run `npm run typecheck` and `npm run lint` and ensure both pass
- [x] 7.2 Smoke-test: build a sample `Test` in the form, confirm the live preview renders correctly, and confirm `/api/pdf` returns a valid A4 PDF that matches the preview
- [x] 7.3 Verify export succeeds on a host with no LaTeX engine installed (confirming the toolchain dependency is gone)
