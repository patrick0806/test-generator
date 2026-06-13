"use client"

import * as React from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

import { MathField } from "@/components/math-field"

interface MathInputProps {
    value: string
    onChange: (latex: string) => void
}

export function MathInput({ value, onChange }: MathInputProps) {
    const previewHtml = React.useMemo(() => {
        if (!value.trim()) return ""
        try {
            return katex.renderToString(value, {
                throwOnError: false,
                displayMode: false,
            })
        } catch {
            return ""
        }
    }, [value])

    return (
        <div className="space-y-1">
            <MathField value={value} onChange={onChange} />
            {previewHtml ? (
                <div
                    className="rounded-md bg-muted px-2 py-1 text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
            ) : null}
        </div>
    )
}
