## ADDED Requirements

### Requirement: LaTeX document generation
The system SHALL expose `generateLatex(test: Test): string` that converts a `Test` into a complete, compilable LaTeX document using a single simple `article` template.

#### Scenario: Open question reserves answer space
- **WHEN** a question of type `open` is generated
- **THEN** the document SHALL include vertical space (e.g. `\vspace{3cm}`) after the statement for the student's answer

#### Scenario: Multiple-choice question renders alternatives
- **WHEN** a question of type `multiple-choice` with alternatives is generated
- **THEN** the document SHALL render each alternative as a nested enumerated item under the question

#### Scenario: Metadata appears in the title block
- **WHEN** a test with title, teacher, and date is generated
- **THEN** the document's title, author, and date SHALL reflect those values

### Requirement: LaTeX escaping
The system SHALL escape all user-supplied text interpolated into the LaTeX document so that special characters cannot break compilation.

#### Scenario: Special characters are escaped
- **WHEN** a statement or alternative contains characters like `%`, `$`, `&`, `#`, `_`, `{`, `}`, `\`, `~`, or `^`
- **THEN** those characters SHALL be escaped before insertion into the document

### Requirement: PDF API route
The system SHALL expose a POST route at `/api/pdf` that accepts a validated `Test` JSON body, generates LaTeX, compiles it to PDF, and returns the PDF for download.

#### Scenario: Valid request returns a PDF
- **WHEN** the route receives a request with a body that validates against the test schema
- **THEN** it SHALL respond with `200`, a `application/pdf` content type, and a `Content-Disposition: attachment` header

#### Scenario: Invalid request body is rejected
- **WHEN** the route receives a body that fails validation
- **THEN** it SHALL respond with `400` and SHALL NOT attempt compilation

#### Scenario: Missing TeX engine
- **WHEN** no supported LaTeX engine is available on the host
- **THEN** the route SHALL respond with `501` and a message indicating the missing prerequisite

### Requirement: Server-side compilation
The system SHALL compile the generated `.tex` to PDF on the server using a LaTeX engine (Tectonic by default, pdflatex as fallback) selected via the `LATEX_ENGINE` environment variable.

#### Scenario: Engine selection
- **WHEN** `LATEX_ENGINE` is set
- **THEN** the route SHALL use the specified engine; otherwise it SHALL default to `tectonic`

#### Scenario: Temp file cleanup
- **WHEN** a compilation completes (success or failure)
- **THEN** the intermediate temp files SHALL be removed from the filesystem
