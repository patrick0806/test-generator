import katex from "katex"

import type { Test } from "@/types/test"
import { renderStatementHtml } from "@/lib/statement"

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

export function escapeText(value: string): string {
    return escapeHtml(value)
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

function formatDate(raw: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
    if (!match) return raw
    const [, year, month, day] = match
    return `${day}/${month}/${year}`
}

export function renderPrintableMarkup(test: Test): string {
    const title = escapeHtml(test.title || "Prova")
    const teacher = escapeHtml(test.teacher)
    const school = escapeHtml(test.school)
    const date = escapeHtml(formatDate(test.date))

    const metaParts: string[] = []
    if (teacher) metaParts.push(`<span>Professor(a): ${teacher}</span>`)
    if (school) metaParts.push(`<span>Escola: ${school}</span>`)
    if (date) metaParts.push(`<span>Data: ${date}</span>`)

    const questions = test.questions
        .map((question) => {
            const statement =
                renderStatementHtml(question.description) ||
                `<span class="printable-test__empty">(sem enunciado)</span>`

            let body: string
            if (
                question.type === "multiple-choice" &&
                question.options.length > 0
            ) {
                const options = question.options
                    .map((option, optionIndex) => {
                        const opt =
                            renderMath(option) ||
                            `<span class="printable-test__empty">(vazio)</span>`
                        const marker = String.fromCharCode(65 + optionIndex)
                        return `<li class="printable-test__option"><span class="printable-test__option-marker">(${marker})</span><span>${opt}</span></li>`
                    })
                    .join("")
                body = `<ul class="printable-test__options">${options}</ul>`
            } else {
                body = `<div class="printable-test__answer-space" aria-hidden="true"></div>`
            }

            return `<li class="printable-test__question"><div class="printable-test__statement">${statement}</div>${body}</li>`
        })
        .join("")

    return `<div class="printable-test">
  <header class="printable-test__header">
    <span class="printable-test__title">${title}</span>
    <div class="printable-test__meta">${metaParts.join("")}</div>
  </header>
  <ol class="printable-test__questions">
    ${questions}
  </ol>
</div>`
}
