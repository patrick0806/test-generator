import { describe, expect, it } from "vitest"

import { parseStatement, renderStatementHtml } from "./statement"

function segmentsOf(value: string) {
    return parseStatement(value).map(({ kind, value }) => ({ kind, value }))
}

describe("parseStatement", () => {
    it("keeps plain prose as a single text segment", () => {
        expect(segmentsOf("Resolva a equação a seguir:")).toEqual([
            { kind: "text", value: "Resolva a equação a seguir:" },
        ])
    })

    it("parses a single inline equation", () => {
        expect(segmentsOf("$x^2 + y^2$")).toEqual([
            { kind: "math", value: "x^2 + y^2" },
        ])
    })

    it("parses multiple interleaved equations", () => {
        expect(segmentsOf("Dados $a$ e $b$, calcule $a+b$")).toEqual([
            { kind: "text", value: "Dados " },
            { kind: "math", value: "a" },
            { kind: "text", value: " e " },
            { kind: "math", value: "b" },
            { kind: "text", value: ", calcule " },
            { kind: "math", value: "a+b" },
        ])
    })

    it("treats an unclosed delimiter as literal prose", () => {
        expect(segmentsOf("Preço $5 e algo")).toEqual([
            { kind: "text", value: "Preço $5 e algo" },
        ])
    })

    it("resolves an escaped delimiter inside prose", () => {
        expect(segmentsOf("Taxa de \\$100 por mês")).toEqual([
            { kind: "text", value: "Taxa de $100 por mês" },
        ])
    })

    it("round-trips an inserted equation token", () => {
        const value = "Calcule $" + "a + b" + "$"
        expect(value).toBe("Calcule $a + b$")
        expect(segmentsOf(value)).toEqual([
            { kind: "text", value: "Calcule " },
            { kind: "math", value: "a + b" },
        ])
    })

    it("preserves latex backslash commands inside math", () => {
        expect(segmentsOf("$\\frac{a}{b}$")).toEqual([
            { kind: "math", value: "\\frac{a}{b}" },
        ])
    })

    it("reports absolute offsets that cover the whole string", () => {
        const value = "a$b$"
        const segments = parseStatement(value)
        expect(segments[0]).toMatchObject({ start: 0, end: 1 })
        expect(segments[1]).toMatchObject({ start: 1, end: 4 })
    })
})

describe("renderStatementHtml", () => {
    it("returns empty for empty or whitespace input", () => {
        expect(renderStatementHtml("")).toBe("")
        expect(renderStatementHtml("   ")).toBe("")
    })

    it("escapes prose and never wraps it in katex", () => {
        const html = renderStatementHtml("Use <b> e & simbolos")
        expect(html).toContain("&lt;b&gt;")
        expect(html).toContain("&amp;")
        expect(html).not.toContain("katex")
    })

    it("renders inline math segments through katex", () => {
        const html = renderStatementHtml("Seja $n$ inteiro")
        expect(html).toContain("katex")
        expect(html).toContain("Seja")
    })

    it("does not crash on an unclosed delimiter", () => {
        const html = renderStatementHtml("Preço $5")
        expect(html).toContain("$5")
        expect(html).not.toContain("katex")
    })
})
