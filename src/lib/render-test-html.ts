import { readFileSync } from "node:fs"
import { join } from "node:path"

import { renderPrintableMarkup, escapeText } from "@/lib/printable-markup"
import { printStyles } from "@/lib/print-styles"
import type { Test } from "@/types/test"

const katexDistDir = join(process.cwd(), "node_modules", "katex", "dist")

const FONT_MIME: Record<string, string> = {
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
}

let inlinedKatexCss: string | null = null

function buildKatexCss(): string {
    if (inlinedKatexCss) return inlinedKatexCss

    const cssPath = join(katexDistDir, "katex.min.css")
    let css = readFileSync(cssPath, "utf8")

    css = css.replace(/url\(fonts\/([^)]+)\)/g, (_match, fileName) => {
        const ext = (fileName.split(".").pop() || "").toLowerCase()
        const mime = FONT_MIME[ext] ?? "application/octet-stream"
        const fontPath = join(katexDistDir, "fonts", fileName)
        const data = readFileSync(fontPath).toString("base64")
        return `url(data:${mime};base64,${data})`
    })

    inlinedKatexCss = css
    return css
}

export function renderTestHtml(test: Test): string {
    const body = renderPrintableMarkup(test)
    const title = escapeText(test.title || "Prova")

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
${printStyles}
${buildKatexCss()}
</style>
</head>
<body>
${body}
</body>
</html>`
}
