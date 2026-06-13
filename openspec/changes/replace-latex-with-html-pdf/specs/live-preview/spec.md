## ADDED Requirements

### Requirement: Real-time test preview
The system SHALL provide a `TestPreview` component that renders the same `PrintableTest` component used for export, giving the teacher a live preview that updates as the form changes.

#### Scenario: Preview reflects form input
- **WHEN** the teacher edits any field in the form (title, teacher, date, question statement, or alternative)
- **THEN** the preview SHALL update in real time to reflect the current values

#### Scenario: Preview matches exported PDF
- **WHEN** the teacher generates the PDF after reviewing the preview
- **THEN** the exported PDF SHALL be visually consistent with the preview because both render through the same `PrintableTest` component

### Requirement: Math parity in preview
The system SHALL render math expressions in the preview using KaTeX, identical to the rendering used in the PDF output.

#### Scenario: Math expressions display correctly
- **WHEN** a question statement or alternative contains a LaTeX math expression entered via MathLive
- **THEN** the preview SHALL render it with KaTeX so the teacher sees exactly what will be printed
