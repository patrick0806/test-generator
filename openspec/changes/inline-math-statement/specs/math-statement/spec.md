## ADDED Requirements

### Requirement: Statement is prose-first

The statement ("enunciado") editor SHALL be a normal multi-line text input where the author writes plain prose by default. It SHALL NOT treat the entire statement as a single math expression.

#### Scenario: Author writes plain text
- **WHEN** the author types "Resolva a equação a seguir:" into the statement field
- **THEN** the text is stored and displayed verbatim as prose, with no LaTeX parsing applied to the prose itself

#### Scenario: Multi-line statements
- **WHEN** the author inserts line breaks in the statement
- **THEN** the line breaks are preserved in the value and reflected in the preview and print output

### Requirement: Inline equation insertion via mathlive

The editor SHALL provide an affordance to insert an equation at the current cursor position. Activating it SHALL open a `mathlive` math-field to author a single equation, and confirming SHALL insert the authored LaTeX into the statement, wrapped in inline-math delimiters (`$...$`), at the cursor position. The authoring surface SHALL autofocus and allow cancellation without modifying the statement.

#### Scenario: Insert an equation mid-sentence
- **WHEN** the author places the cursor after "Calcule " and inserts the equation `x^2 + y^2` via the affordance
- **THEN** the statement value becomes "Calcule $x^2 + y^2$" with the cursor placed after the inserted `$...$` token

#### Scenario: Cancel equation insertion
- **WHEN** the author opens the equation authoring surface and dismisses it without confirming
- **THEN** the statement value is unchanged

#### Scenario: Empty equation is not inserted
- **WHEN** the author confirms the equation authoring surface while the math-field is empty (whitespace only)
- **THEN** no `$...$` token is inserted into the statement

### Requirement: Inline-math representation

Equations within the statement string SHALL be represented as inline-math delimited segments using `$<latex>$`. A literal dollar sign in prose SHALL be representable by escaping it as `\$`. This representation SHALL be the single source of truth shared by editing, preview, and print.

#### Scenario: Literal dollar sign in prose
- **WHEN** the statement value contains "Custo: \$50" 
- **THEN** the `$` is rendered as a literal dollar sign in both preview and print, not interpreted as a math delimiter

#### Scenario: Delimiters are stable round-trip
- **WHEN** an equation `a + b` is inserted and the value is later read back
- **THEN** the value contains exactly the segment `$a + b$`

### Requirement: Re-editing an existing equation

For a fluid experience, the editor SHALL allow the author to edit an existing inline equation in place: selecting/activating an existing `$...$` token SHALL reopen the `mathlive` math-field prefilled with that equation's LaTeX, and confirming SHALL replace that single token in the statement. Other content SHALL remain unchanged.

#### Scenario: Edit an existing equation
- **WHEN** the author activates the equation token `$x^2$` and changes it to `x^3`
- **THEN** only that token is updated to `$x^3$` and all surrounding prose is preserved

### Requirement: Live preview

The editor SHALL render a live preview of the full statement as the author types, showing prose (HTML-escaped) interleaved with rendered inline equations (via katex). The preview SHALL update on every change to the statement value.

#### Scenario: Preview shows mixed content
- **WHEN** the statement value is "Seja $n$ um inteiro. Calcule $n!$"
- **THEN** the preview renders the prose with the words "Seja" and "Calcule" as escaped text, and renders `n` and `n!` as typeset math

### Requirement: Robust mixed-content parsing

A single parser SHALL split the statement string into ordered segments of prose text and inline math. It SHALL handle escaped delimiters (`\$`) and SHALL degrade gracefully on malformed input: an unclosed `$` SHALL be treated as literal prose text rather than raising an error. The same parser SHALL be used for both preview and printable rendering to guarantee they stay consistent.

#### Scenario: Unclosed delimiter is treated as text
- **WHEN** the statement value is "Preço $5 e algo"
- **THEN** the parser treats `$5 e algo` as literal prose (no math rendering), because the delimiter is never closed

#### Scenario: Escaped delimiter inside prose
- **WHEN** the statement value is "Taxa de \$100 por mês"
- **THEN** the parser produces a single prose segment "Taxa de $100 por mês" with the backslash removed

#### Scenario: Multiple interleaved equations
- **WHEN** the statement value is "Dados $a$ e $b$, calcule $a+b$"
- **THEN** the parser produces the ordered segments: text "Dados ", math "a", text " e ", math "b", text ", calcule ", math "a+b"

### Requirement: Printable rendering of mixed statements

The printable markup generator SHALL render the statement using the shared mixed-content parser: prose segments SHALL be HTML-escaped, and inline-math segments SHALL be rendered through katex. It SHALL NOT pass the entire statement to katex as a single math expression.

#### Scenario: Printable output for a mixed statement
- **WHEN** generating printable markup for a statement "Resolva $x = 1$"
- **THEN** the output contains the escaped text "Resolva " followed by katex-rendered `x = 1`, with the prose never passed through katex

#### Scenario: Empty statement fallback
- **WHEN** the statement value is empty or whitespace only
- **THEN** the printable markup renders the existing `(sem enunciado)` placeholder
