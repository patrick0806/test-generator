## Why

The project has domain types (`Test`, `Question`) and the math/validation dependencies installed, but no UI to author exams and no way to produce a printable artifact. Teachers need a tool to compose exams (including mathematical notation) and export a professionally formatted PDF without manual LaTeX editing.

## What Changes

- Add a single-page exam authoring UI built with shadcn/ui, React Hook Form, and Zod validation.
- Add a dynamic question list supporting two question types: open-ended and multiple-choice, with optional alternatives.
- Add a MathLive-based math input that stores LaTeX and renders a live KaTeX preview inline.
- Extend the `Test` domain type with a `date` field.
- Add a Zod schema layer mirroring the domain types to validate the form and the PDF API payload.
- Add `generateLatex(test: Test): string` that converts a `Test` into a complete LaTeX document (simple single template).
- Add an API Route (`app/api/pdf/route.ts`) that receives validated test data, generates LaTeX, compiles it to PDF, and returns the PDF for download.
- Add new dependencies: `react-hook-form`, `@hookform/resolvers`, `katex`, and a server-side LaTeX engine.

## Capabilities

### New Capabilities

- `exam-builder`: Web UI and validation for composing an exam — test metadata (title, teacher, date) and an editable list of questions (open or multiple-choice with optional alternatives).
- `math-notation`: Inline mathematical expression authoring using MathLive that persists LaTeX and renders a live KaTeX preview.
- `pdf-export`: Server-side generation of a LaTeX document from a `Test` and compilation to a downloadable PDF via an API Route.

### Modified Capabilities

<!-- None — no existing specs to modify. -->

## Impact

- **Code**: New `app/page.tsx`, `components/test-form.tsx`, `components/question-form.tsx`, `components/math-input.tsx`, `lib/generate-latex.ts`, `app/api/pdf/route.ts`; new Zod schemas in `lib/` or `types/`.
- **Domain types**: `src/types/test.ts` gains a `date` field.
- **Dependencies**: Add `react-hook-form`, `@hookform/resolvers`, `katex` (+ types), and a LaTeX-to-PDF server solution (e.g. `@latex.js/node` or an external Tectonic/pdflatex integration).
- **No database / no auth / no persistence**: All data lives in component state for the session and is sent to the API on demand.
- **Runtime**: PDF compilation runs server-side; the chosen engine must work in the Node.js runtime used by the API Route.
