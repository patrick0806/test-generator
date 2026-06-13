## Why

The statement (`description`, "enunciado") is currently a single `mathlive` math-field, so the **entire** statement is parsed as LaTeX. Real exam statements are mostly prose ("Resolva a equação a seguir:", "Calcule a área:") with only occasional equations. Treating prose as math garbles the rendered output and makes authoring painful. We need a normal text input where authors can insert equations inline via `mathlive` on demand, with a fluid, low-friction experience.

## What Changes

- Replace the pure math-field `MathInput` used for the statement with a **prose editor**: a multi-line text input where the author writes plain text by default.
- Add an **inline-equation insertion** affordance (e.g. a toolbar "fx" button and/or inline trigger) that opens a `mathlive` math-field to author a single equation, then inserts it into the text as a delimited inline-math token (`$...$`) at the cursor position.
- Add a **live preview** that renders the mixed prose + inline equations (via katex) as the user types, so authors see the final look without leaving the field.
- Update **printable markup** rendering to parse `$...$` inline-math delimiters: escape prose text and render only the delimited segments through katex.
- **BREAKING** (behavior): the statement value's semantics change from "pure LaTeX" to "prose with optional `$...$` inline math". Since test data is session-only (no persistence), there is no stored-data migration; it only affects in-session rendering.
- Non-goal: multiple-choice options stay as math-only `MathInput` fields for now. Reusing the new editor for options is left for a future change.

## Capabilities

### New Capabilities
- `math-statement`: Authoring and rendering exam statements that mix prose with inline equations — the editing experience, the serialized `$...$` representation, and the preview/print rendering of mixed content.

### Modified Capabilities
<!-- None — there are no existing specs in openspec/specs/ yet. -->

## Impact

- **Components**:
  - `src/components/question-form.tsx` — swap the statement field from `MathInput` to the new statement editor.
  - New `src/components/statement-input.tsx` (or similar) — prose textarea + inline-equation insertion + live preview.
  - `src/components/math-input.tsx` — reused as the equation-authoring surface inside the insertion flow.
- **Lib**:
  - `src/lib/printable-markup.ts` — replace whole-string `renderMath` for the statement with a parser that splits on `$...$`, escapes prose, and renders math segments.
- **Data model**: `Question.description` stays a `string` (schema unchanged), but its meaning becomes mixed prose + delimited math. `src/types/question.ts` and `src/lib/schemas.ts` require no structural change.
- **Dependencies**: No new runtime deps (`mathlive`, `katex` already present).
- **Risk**: Inline-equation parsing must correctly handle escaped delimiters (`\$`) and mismatched/unclosed `$` without crashing the preview or print.
