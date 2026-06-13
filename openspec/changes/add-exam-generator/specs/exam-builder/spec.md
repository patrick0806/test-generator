## ADDED Requirements

### Requirement: Exam metadata form
The system SHALL present a form for composing exam metadata with fields for exam title, teacher name, and exam date.

#### Scenario: Required metadata fields
- **WHEN** the form is rendered
- **THEN** it SHALL contain inputs for title, teacher, and date, each marked as required

#### Scenario: Empty required field blocks submission
- **WHEN** the teacher submits with an empty title, teacher, or date
- **THEN** the form SHALL display a validation error and SHALL NOT submit

### Requirement: Dynamic question list
The system SHALL allow adding and removing questions dynamically, where each question has a statement, a type of either `open` or `multiple-choice`, and an optional list of alternatives.

#### Scenario: Add a question
- **WHEN** the teacher clicks "Add question"
- **THEN** a new question row SHALL appear with a type selector defaulting to `open`

#### Scenario: Remove a question
- **WHEN** the teacher removes an existing question
- **THEN** that question SHALL be removed from the list and the form SHALL re-validate

#### Scenario: At least one question required
- **WHEN** the teacher submits with zero questions
- **THEN** the form SHALL display a validation error and SHALL NOT submit

### Requirement: Question types and alternatives
The system SHALL render question alternatives only for `multiple-choice` questions, and SHALL reserve answer space for `open` questions only in the generated output.

#### Scenario: Switching to multiple-choice reveals alternatives
- **WHEN** a question's type is changed to `multiple-choice`
- **THEN** an editable list of alternatives SHALL be shown for that question

#### Scenario: Switching to open hides alternatives
- **WHEN** a question's type is changed to `open`
- **THEN** the alternatives editor for that question SHALL be hidden

### Requirement: Form validation via Zod
The system SHALL validate the entire exam (metadata and questions) against a Zod schema before submission, and validation errors SHALL be surfaced next to the relevant fields.

#### Scenario: Invalid payload is rejected client-side
- **WHEN** the teacher submits data that violates the schema
- **THEN** submission SHALL be blocked and field-level errors SHALL be displayed

### Requirement: Generate PDF trigger
The system SHALL provide a "Generate PDF" action that submits the validated exam payload to the PDF API and downloads the returned PDF.

#### Scenario: Successful generation
- **WHEN** the teacher clicks "Generate PDF" with a valid form
- **THEN** the system SHALL POST the exam JSON to `/api/pdf` and trigger a browser download of the returned PDF

#### Scenario: Server error during generation
- **WHEN** the API returns an error status
- **THEN** the form SHALL surface an error message and SHALL NOT download a file
