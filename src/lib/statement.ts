import katex from "katex"

export type StatementSegment = {
    kind: "text" | "math"
    value: string
    start: number
    end: number
}

/**
 * Parse a statement string into ordered text and inline-math segments.
 *
 * Rules:
 * - `\$` is an escaped literal `$` (the backslash is stripped); it never acts
 *   as a delimiter.
 * - An unescaped `$` opens an inline-math segment closed by the next unescaped
 *   `$`.
 * - An unclosed `$` (no closing delimiter before end-of-string) is treated as
 *   literal prose, never thrown.
 *
 * Each segment includes absolute `start`/`end` offsets in the original string.
 * For math segments `start` is the opening `$` and `end` is one past the
 * closing `$`; `value` is the inner LaTeX without delimiters.
 */
export function parseStatement(value: string): StatementSegment[] {
    const segments: StatementSegment[] = []
    const n = value.length
    let i = 0
    let textStart = 0
    let text = ""

    const flushText = (upto: number) => {
        if (text.length > 0) {
            segments.push({ kind: "text", value: text, start: textStart, end: upto })
            text = ""
        }
    }

    while (i < n) {
        const ch = value[i]
        const next = value[i + 1]

        if (ch === "\\" && next === "$") {
            text += "$"
            i += 2
            continue
        }

        if (ch === "$") {
            const openAt = i
            let j = i + 1
            let mathContent = ""
            let closed = false
            while (j < n) {
                const cj = value[j]
                const nj = value[j + 1]
                if (cj === "\\" && nj === "$") {
                    mathContent += "$"
                    j += 2
                    continue
                }
                if (cj === "$") {
                    closed = true
                    break
                }
                mathContent += cj
                j += 1
            }

            if (closed) {
                flushText(openAt)
                segments.push({
                    kind: "math",
                    value: mathContent,
                    start: openAt,
                    end: j + 1,
                })
                i = j + 1
                textStart = i
                continue
            }

            // Unclosed delimiter: the opening `$` and the remaining content are
            // literal prose. `mathContent` already has escapes resolved.
            text += "$" + mathContent
            i = n
            continue
        }

        text += ch
        i += 1
    }

    flushText(n)
    return segments
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function renderMath(latex: string): string {
    const trimmed = latex.trim()
    if (!trimmed) return ""
    try {
        return katex.renderToString(trimmed, {
            throwOnError: false,
            displayMode: false,
        })
    } catch {
        return ""
    }
}

/**
 * Render a statement string to HTML: prose segments are HTML-escaped, inline
 * math segments are rendered through katex. Returns an empty string for empty
 * or whitespace-only input. This is the single source of truth shared by the
 * editor preview and printable markup.
 */
export function renderStatementHtml(value: string): string {
    if (!value.trim()) return ""
    return parseStatement(value)
        .map((segment) =>
            segment.kind === "math"
                ? renderMath(segment.value)
                : escapeHtml(segment.value)
        )
        .join("")
}
