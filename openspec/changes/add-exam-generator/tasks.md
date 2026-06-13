## 1. Setup

- [x] 1.1 Add dependencies: `react-hook-form`, `@hookform/resolvers`, `katex`, `@types/katex`
- [x] 1.2 Install/verify a LaTeX engine on the host (Tectonic preferred, else TeX Live `pdflatex`); document in README
- [x] 1.3 Add `date: string` field to `src/types/test.ts`
- [x] 1.4 Create `src/lib/schemas.ts` with `questionSchema` and `testSchema` (Zod) mirroring the domain types; export inferred types

## 2. Math Input Component

- [x] 2.1 Create `src/components/math-input.tsx` (`"use client"`) mounting a MathLive `<math-field>` after mount (mounted guard / dynamic import to avoid hydration issues)
- [x] 2.2 Bind the field value via React Hook Form `Controller`; store raw LaTeX (strip `\(...\)` delimiters)
- [x] 2.3 Render a live KaTeX preview (`katex.renderToString`, `throwOnError: false`) beside the input
- [x] 2.4 Add KaTeX CSS import (via `katex` package stylesheet) so previews render correctly

## 3. Question Form Component

- [x] 3.1 Create `src/components/question-form.tsx` (`"use client"`) rendering a single question row: statement (math-input), type selector (`open` | `multiple-choice`), and a remove button
- [x] 3.2 Conditionally render an alternatives `useFieldArray` editor only when `type === 'multiple-choice'`; each alternative uses `math-input`
- [x] 3.3 Surface field-level validation errors for statement and (when applicable) alternatives

## 4. Test Form & Page

- [x] 4.1 Create `src/components/test-form.tsx` (`"use client"`) using `useForm` (Zod resolver) and `useFieldArray` for the questions list
- [x] 4.2 Render metadata fields (title, teacher, date) using shadcn/ui Input/Label/Form components; add "Add question" and "Generate PDF" buttons
- [x] 4.3 Map each question row to `<QuestionForm />`; wire validation errors
- [x] 4.4 Implement `onSubmit`: POST validated `Test` JSON to `/api/pdf`, read the response blob, and trigger a browser download; show errors on non-200
- [x] 4.5 Replace `src/app/page.tsx` content with `<TestForm />` (page stays a Server Component)

## 5. LaTeX Generation

- [x] 5.1 Create `src/lib/generate-latex.ts` with `generateLatex(test: Test): string` using the simple `article` template
- [x] 5.2 Add `escapeLatex()` helper escaping `% $ & # _ { } \ ~ ^` and apply to every interpolated value
- [x] 5.3 Render `open` questions with `\vspace{3cm}` for answer space; render `multiple-choice` alternatives as a nested `enumerate`
- [x] 5.4 Place title/teacher/date into `\title`, `\author`, `\date` and call `\maketitle`

## 6. PDF API Route

- [x] 6.1 Create `src/app/api/pdf/route.ts` exporting an async `POST(request)` handler
- [x] 6.2 Parse + validate body with `testSchema`; return `400` JSON on failure
- [x] 6.3 Call `generateLatex(test)`, write `.tex` to an OS temp dir
- [x] 6.4 Compile via `child_process` using `LATEX_ENGINE` (default `tectonic`, fallback `pdflatex`); detect availability and return `501` with guidance if missing
- [x] 6.5 Return the PDF `Buffer` as `application/pdf` with `Content-Disposition: attachment`; clean up temp files in a `finally`

## 7. Verification

- [ ] 7.1 Run `npm run typecheck` and `npm run lint`; fix any issues
- [ ] 7.2 Smoke test in `npm run dev`: build a 2-question exam (one open, one multiple-choice with math), generate PDF, confirm download opens correctly
- [ ] 7.3 Verify invalid submissions are blocked client-side and bad payloads are rejected by the API with `400`
