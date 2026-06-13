## Context

Today the statement (`description`) is edited with `src/components/math-input.tsx`, which renders a single `mathlive` `<math-field>` and treats the **entire** statement as one LaTeX expression. In `src/lib/printable-markup.ts` the whole `description` is likewise passed to `katex.renderToString`. This works for equations but breaks down for prose ("Resolva:", "Calcule:"), because katex interprets letters and words as math variables/operators.

Constraints:
- Test data is **session-only** (no persistence layer), so there is no data migration.
- `mathlive` and `katex` are already dependencies; `mathlive` is dynamically imported to avoid SSR issues (see `math-input.tsx:42`).
- The statement value is a plain `string` in `Question.description`; we want to keep the schema a `string` to avoid a data-model change.
- The project uses React 19 + react-hook-form + shadcn/ui; `QuestionForm` registers the field via `Controller` at `questions.${index}.description`.

## Goals / Non-Goals

**Goals:**
- A prose-first statement editor where plain text "just works" and equations are inserted inline on demand.
- A fluid insertion/re-edit flow powered by `mathlive`, with a live preview.
- One shared parser driving both preview and print so they never diverge.
- No new runtime dependencies; reuse the existing `math-field` mounting logic.

**Non-Goals:**
- WYSIWYG `contentEditable` rich-text editing (high caret/focus complexity).
- Block/display math (`$$...$$`); only inline math (`$...$`) in this change.
- Applying the new editor to multiple-choice options (left for a future change).
- Persistence/migration of statements.

## Decisions

### Decision 1: Representation is a plain string with `$...$` inline-math delimiters
Store the statement as a single `string` where equations are wrapped in `$...$` and a literal `$` is escaped as `\$`.

- **Why:** Keeps `Question.description` / `testSchema` as `string` (no schema/type change), is grep-able, trivially serializable, and maps directly to katex's inline-math convention. It also degrades readably (authors see `$x^2$` in the raw textarea).
- **Alternatives considered:**
  - Structured value (array of `{type:'text'|'math', value}` segments) — cleaner semantics, but requires a schema/type change, more complex form wiring, and breaks the current string contract. Rejected for now.
  - Markdown — heavier than needed; we only need inline math.

### Decision 2: Editor UX = textarea + a mathlive-powered insertion surface
The editor is a `<textarea>` (plain prose) with a small toolbar containing an "Insert equation" (`fx`) button. Activating it opens an inline `mathlive` math-field (an inline panel rendered adjacent to the editor, **not** a modal) prefilled empty; confirming splices `$<latex>$` into the textarea at the current selection and restores the caret just after the inserted token.

- **Why a panel over a modal:** modals break flow; an inline panel keeps context visible and feels fluid (the explicit goal). 
- **Why a textarea over contentEditable:** textareas have predictable caret/selection APIs (`selectionStart`/`selectionEnd`) and no cross-browser contentEditable quirks. The live preview compensates for not being fully WYSIWYG.

### Decision 3: Re-edit by token selection
"Edit existing equation" is implemented by detecting when the caret/selection is inside a `$...$` token in the textarea when the author activates the `fx` button: the panel opens prefilled with that token's LaTeX and confirm **replaces** that token's range. This satisfies the fluid "edit in place" requirement without the complexity of clickable rendered tokens inside the textarea.

- **Alternative considered:** clickable rendered chips inside a contentEditable — rejected (see Decision 2).

### Decision 4: Shared parser as the single source of truth
Introduce `src/lib/statement.ts` exporting `parseStatement(value): Segment[]` where `Segment = { kind: 'text' | 'math'; value: string }`. Both the live preview (client) and `renderPrintableMarkup` (server-capable) consume it. `renderStatementHtml(value, { escape })` builds the HTML: escape prose, katex-render math.

- **Parsing rules:**
  - `\$` is an escaped literal `$` (backslash removed in output).
  - A `$` (unescaped) opens a math segment that closes at the next unescaped `$`.
  - An unclosed `$` (no closing delimiter before end-of-string) is treated as literal prose, never throws.
- **Why shared:** guarantees preview == print and gives one place to unit-test edge cases (escaped delimiters, unclosed delimiters, interleaving).

### Decision 5: Reuse the existing math-field mounting logic
The insertion panel's `mathlive` field reuses the dynamic-import + `setValue`/`input`-listener pattern already in `math-input.tsx:39-64` (extracted into a small `<MathField>` primitive if helpful). This keeps SSR-safety and avoids a second copy of that logic.

## Risks / Trade-offs

- **Raw `$...$` visible in the textarea** → not fully WYSIWYG. Mitigated by the always-on live preview directly under the field. Accepted trade-off for caret/selection reliability.
- **Caret restoration after splicing** → inserting/replacing a token must correctly set `selectionStart/selectionEnd`. Mitigation: compute ranges from `parseStatement` offsets and set them synchronously after `onChange`; add tests.
- **Malformed/unclosed delimiters** could confuse authors. Mitigation: the parser degrades to literal text (Decision 4) and the preview immediately reflects the "broken" state so the author sees it.
- **Escaped-delimiter edge cases** (`\\$`, `$` at EOL) → Mitigation: unit tests for the parser covering the scenarios in `specs/math-statement/spec.md`.
- **`mathlive` dynamic import latency** on first open of the insertion panel → acceptable (already the pattern elsewhere); panel can show a minimal skeleton while loading.

## Open Questions

- Keyboard shortcut to insert an equation (e.g. `Ctrl/Cmd+M`)? Propose adding it as a nice-to-have during implementation; not required by spec.
- Should the `fx` toolbar live inside the field border or above it? Implementation detail; match shadcn/ui conventions during build.
