import type { Test } from "@/types/test"

/**
 * Escapes special LaTeX characters in plain-text values so they cannot
 * break compilation. Used for metadata that is NOT LaTeX (title, teacher...).
 */
function escapeLatex(value: string): string {
    return value
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}")
}

/**
 * Formats an ISO date string (yyyy-mm-dd) as dd/mm/yyyy. Falls back to the
 * raw value (escaped) when it cannot be parsed.
 */
function formatDate(raw: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
    if (!match) return escapeLatex(raw)
    const [, , month, day] = match
    return `${day}/${month}/${match[1]}`
}

/**
 * Wraps a LaTeX math expression in inline math mode. Empty values render a
 * placeholder so the document still compiles.
 */
function mathInline(latex: string): string {
    const trimmed = latex.trim()
    if (!trimmed) return "(sem conteúdo)"
    return `$${trimmed}$`
}

function renderQuestion(index: number, test: Test): string {
    const question = test.questions[index]
    const lines: string[] = []

    lines.push(`\\item ${mathInline(question.description)}`)

    if (question.type === "multiple-choice" && question.options.length > 0) {
        lines.push("\\begin{enumerate}")
        for (const option of question.options) {
            lines.push(`  \\item ${mathInline(option)}`)
        }
        lines.push("\\end{enumerate}")
    } else {
        lines.push("\\vspace{3cm}")
    }

    return lines.join("\n")
}

/**
 * Converts a {@link Test} into a complete, compilable LaTeX document using a
 * single simple article template.
 */
export function generateLatex(test: Test): string {
    const title = escapeLatex(test.title || "Prova")
    const teacher = escapeLatex(test.teacher || "")
    const date = formatDate(test.date)

    const questions = test.questions
        .map((_, index) => renderQuestion(index, test))
        .join("\n\n")

    return `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{geometry}

\\geometry{a4paper, margin=1in}

\\begin{document}

\\title{Prova de ${title}}
\\author{Professor ${teacher}}
\\date{${date}}

\\maketitle

\\section*{Questões}

\\begin{enumerate}

${questions}

\\end{enumerate}

\\end{document}
`
}
