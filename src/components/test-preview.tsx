"use client"

import * as React from "react"
import "katex/dist/katex.min.css"

import { PrintableTest } from "@/components/printable-test"
import { printStyles } from "@/lib/print-styles"
import type { Test } from "@/types/test"

interface TestPreviewProps {
    test: Test
}

export function TestPreview({ test }: TestPreviewProps) {
    return (
        <div className="space-y-3">
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />

            <h2 className="text-base font-medium">Pré-visualização</h2>
            <p className="text-sm text-muted-foreground">
                Esta é exatamente a versão que será exportada para o PDF.
            </p>

            <div className="printable-preview-sheet overflow-hidden rounded-lg border bg-white p-8 text-black shadow-sm">
                <PrintableTest test={test} />
            </div>
        </div>
    )
}
