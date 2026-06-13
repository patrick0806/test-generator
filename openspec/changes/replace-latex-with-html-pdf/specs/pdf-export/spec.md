## ADDED Requirements

### Requirement: Printable test component
The system SHALL provide a `PrintableTest` React component that renders a `Test` into the exact print-faithful layout used both for the in-app preview and for PDF export, so there is a single source of truth for the printed appearance.

#### Scenario: Header shows test metadata
- **WHEN** `PrintableTest` renders a `Test` with title, teacher, and date
- **THEN** it SHALL display the test title, the teacher name, and the formatted date (dd/mm/yyyy) in a document header

#### Scenario: Open question reserves answer space
- **WHEN** a question of type `open` is rendered
- **THEN** the component SHALL render the statement followed by blank answer lines/space reserved for the student's handwritten answer

#### Scenario: Multiple-choice question renders alternatives
- **WHEN** a question of type `multiple-choice` with alternatives is rendered
- **THEN** the component SHALL render each alternative as a selectable item (e.g., a checkbox/lettered line) under the question

#### Scenario: Questions are numbered sequentially
- **WHEN** the component renders a list of questions
- **THEN** each question SHALL be numbered sequentially starting at 1

#### Scenario: Math expressions render via KaTeX
- **WHEN** a question statement or alternative contains a LaTeX math expression
- **THEN** the component SHALL render it using KaTeX so the printed/PDF output matches the editor preview

### Requirement: A4 print-optimized layout
The system SHALL style `PrintableTest` with CSS optimized for A4 printing, so the exported PDF and the browser print output present a professional, page-aware layout.

#### Scenario: A4 page geometry
- **WHEN** the printable layout is applied
- **THEN** it SHALL target A4 page size with sensible margins appropriate for a school exam

#### Scenario: Content avoids awkward breaks
- **WHEN** content flows across pages
- **THEN** the CSS SHALL apply break rules (e.g., avoid breaking inside a question) to keep questions readable

### Requirement: HTML to PDF API route
The system SHALL expose a POST route at `/api/pdf` that accepts a validated `Test` JSON body, renders `PrintableTest` to a complete HTML document, generates an A4 PDF from that HTML using a headless browser (Playwright), and returns the PDF for download.

#### Scenario: Valid request returns a PDF
- **WHEN** the route receives a request with a body that validates against the test schema
- **THEN** it SHALL respond with `200`, a `application/pdf` content type, and a `Content-Disposition: attachment` header

#### Scenario: Invalid request body is rejected
- **WHEN** the route receives a body that fails validation
- **THEN** it SHALL respond with `400` and SHALL NOT invoke the headless browser

#### Scenario: Render failure returns an error
- **WHEN** the headless browser fails to launch or PDF generation errors
- **THEN** the route SHALL respond with `5xx` and a generic error message without leaking internal details

### Requirement: No LaTeX toolchain dependency
The system SHALL generate PDFs entirely from HTML rendered by a headless browser and SHALL NOT depend on Tectonic, TeX Live, `pdflatex`, or any LaTeX engine, nor read any `LATEX_ENGINE` configuration.

#### Scenario: Export works without a LaTeX engine
- **WHEN** the host has no LaTeX engine installed
- **THEN** PDF generation SHALL still succeed using the headless browser

#### Scenario: LaTeX code is removed
- **WHEN** the codebase is inspected
- **THEN** there SHALL be no LaTeX generation module, no `.tex` compilation, and no `spawn` of a LaTeX engine
