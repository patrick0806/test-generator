"use client"

import * as React from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathfieldLike {
    value: string
    setValue: (
        value: string,
        options?: { silenceNotifications?: boolean }
    ) => void
}

interface MathInputProps {
    value: string
    onChange: (latex: string) => void
}

function stripDelimiters(latex: string): string {
    return latex.replace(/^\\\(/, "").replace(/\\\)$/, "")
}

export function MathInput({ value, onChange }: MathInputProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const mathFieldRef = React.useRef<(MathfieldLike & HTMLElement) | null>(
        null
    )

    const valueRef = React.useRef(value)
    const onChangeRef = React.useRef(onChange)
    React.useEffect(() => {
        valueRef.current = value
    }, [value])
    React.useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    React.useEffect(() => {
        let cancelled = false

        void import("mathlive").then(() => {
            if (cancelled || !containerRef.current) return

            const mf = document.createElement(
                "math-field"
            ) as unknown as MathfieldLike & HTMLElement
            mf.addEventListener("input", () => {
                onChangeRef.current(stripDelimiters(mf.value))
            })
            mf.setValue(valueRef.current, { silenceNotifications: true })
            containerRef.current.appendChild(mf)
            mathFieldRef.current = mf
        })

        return () => {
            cancelled = true
            const mf = mathFieldRef.current
            if (mf && mf.parentNode) {
                mf.parentNode.removeChild(mf)
            }
            mathFieldRef.current = null
        }
    }, [])

    React.useEffect(() => {
        const mf = mathFieldRef.current
        if (!mf) return
        if (stripDelimiters(mf.value) !== value) {
            mf.setValue(value, { silenceNotifications: true })
        }
    }, [value])

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
            <div
                ref={containerRef}
                className="[&>math-field]:block [&>math-field]:min-h-8 [&>math-field]:w-full [&>math-field]:rounded-lg [&>math-field]:border [&>math-field]:border-input [&>math-field]:px-2 [&>math-field]:py-1 [&>math-field]:outline-none"
            />
            {previewHtml ? (
                <div
                    className="rounded-md bg-muted px-2 py-1 text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
            ) : null}
        </div>
    )
}
