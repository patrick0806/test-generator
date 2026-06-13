## ADDED Requirements

### Requirement: MathLive math input
The system SHALL provide a MathLive-based math input component that captures mathematical expressions and stores their value as a LaTeX string.

#### Scenario: Entering an expression stores LaTeX
- **WHEN** the teacher types or edits an expression in the math input
- **THEN** the component SHALL update its value with the raw LaTeX of the expression (without surrounding delimiters)

#### Scenario: Reusable across the form
- **WHEN** the math input is used for a question statement or an alternative
- **THEN** the same LaTeX string SHALL be stored in the form field bound to that input

### Requirement: Live KaTeX preview
The system SHALL render a live preview of the current expression using KaTeX next to the math input.

#### Scenario: Valid expression renders a preview
- **WHEN** the current LaTeX is a valid expression
- **THEN** the preview SHALL render the typeset math via KaTeX

#### Scenario: Incomplete expression does not crash
- **WHEN** the current LaTeX is incomplete or invalid
- **THEN** the preview SHALL fail silently (render nothing) and SHALL NOT throw an error

### Requirement: Shared LaTeX value for PDF
The LaTeX string stored from the math input SHALL be the exact value later passed to the PDF generator, so the preview and the exported PDF render identical math.

#### Scenario: Preview matches PDF math
- **WHEN** an expression is authored and then a PDF is generated
- **THEN** the math in the PDF SHALL correspond to the same LaTeX that produced the on-screen preview
