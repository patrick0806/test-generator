## 1. Shared statement parser

- [x] 1.1 Create `src/lib/statement.ts` exporting `parseStatement(value: string): Segment[]` where `Segment = { kind: "text" | "math"; value: string }`, implementing the rules in `design.md` Decision 4: `\$` = escaped literal `$` (backslash stripped), unescaped `$` opens a math segment closed by the next unescaped `$`, and an unclosed `$` is treated as literal prose (never throws).
- [x] 1.2 Export `renderStatementHtml(value: string): string` that maps `parseStatement` output to HTML: HTML-escape prose segments and katex-render math segments (`katex.renderToString`, `throwOnError: false`, `displayMode: false`); return `""` for empty/whitespace input.
- [x] 1.3 Add a lightweight test setup (e.g. `vitest` as a dev dependency + `test` script) and unit-test `parseStatement` against every scenario in `specs/math-statement/spec.md` (unclosed delimiter, escaped delimiter, multiple interleaved equations, literal `$`, round-trip).

## 2. Reusable math-field primitive

- [x] 2.1 Extract the dynamic-import + `setValue`/`input`-listener mounting logic from `src/components/math-input.tsx:39-64` into a reusable `<MathField>` primitive (controlled `value` + `onChange`), keeping the SSR-safe dynamic `import("mathlive")` pattern.
- [x] 2.2 Refactor `MathInput` to use `<MathField>` so behavior is unchanged (options fields continue to work).

## 3. Statement editor component

- [x] 3.1 Create `src/components/statement-input.tsx`: a controlled multi-line `<textarea>` (prose-first) with `value`/`onChange`, matching shadcn/ui styling and the existing field border treatment.
- [x] 3.2 Add the "Insert equation" (`fx`) toolbar button above/inside the field that opens an inline panel (not a modal) containing `<MathField>`, rendered adjacent to the editor; autofocus the math-field on open.
- [x] 3.3 On confirm: if the panel math-field is empty (whitespace), insert nothing; otherwise splice `$<latex>$` into the textarea at the current `selectionStart`/`selectionEnd`, call `onChange`, and restore the caret immediately after the inserted token. On dismiss/cancel: leave the value unchanged.
- [x] 3.4 Re-edit support: when the author activates `fx` and the current selection lies within a `$...$` token (located via `parseStatement` offsets), open the panel prefilled with that token's LaTeX; on confirm replace exactly that token's range and restore the caret after it.
- [x] 3.5 Render a live preview under the textarea using `renderStatementHtml` (Decision 4), updating on every value change.

## 4. Wire editor into the form

- [x] 4.1 In `src/components/question-form.tsx`, replace the `MathInput` used for `questions.${index}.description` with `StatementInput` (keep the `Controller` + error message wiring intact).
- [x] 4.2 Confirm multiple-choice option fields still use `MathInput` (unchanged) and that the statement field validates with the existing `z.string().min(1, "O enunciado é obrigatório")` rule.

## 5. Printable rendering

- [x] 5.1 In `src/lib/printable-markup.ts`, replace the whole-string `renderMath(question.description)` call for the statement with `renderStatementHtml`, preserving the existing `(sem enunciado)` empty fallback and the surrounding `<div class="printable-test__statement">` wrapper.
- [x] 5.2 Verify options rendering is unchanged (still `renderMath` per option).

## 6. Verification

- [x] 6.1 Run `npm run typecheck` and `npm run lint`; fix any issues.
- [x] 6.2 Run the new parser tests (`npm test`) and ensure all spec scenarios pass.
- [x] 6.3 Manually verify the flow: type prose, insert an equation mid-sentence, re-edit an existing token, confirm the live preview and the generated printable/PDF markup render prose as escaped text and equations as typeset math, and that an unclosed `$` degrades to literal text.
