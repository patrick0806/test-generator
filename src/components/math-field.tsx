"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface MathfieldLike {
    value: string
    setValue: (
        value: string,
        options?: { silenceNotifications?: boolean }
    ) => void
}

export interface MathFieldProps {
    value: string
    onChange: (latex: string) => void
    autoFocus?: boolean
    className?: string
}

function stripDelimiters(latex: string): string {
    return latex.replace(/^\\\(/, "").replace(/\\\)$/, "")
}

/**
 * Mounts a `mathlive` `<math-field>` element via SSR-safe dynamic import and
 * keeps it in sync with a controlled `value`. The styling of the inner
 * `<math-field>` is exposed through `className` using the `[&>math-field]:`
 * variant pattern so callers can tailor the look.
 */
export function MathField({
    value,
    onChange,
    autoFocus = false,
    className,
}: MathFieldProps) {
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
            if (autoFocus) mf.focus()
        })

        return () => {
            cancelled = true
            const mf = mathFieldRef.current
            if (mf && mf.parentNode) {
                mf.parentNode.removeChild(mf)
            }
            mathFieldRef.current = null
        }
    }, [autoFocus])

    React.useEffect(() => {
        const mf = mathFieldRef.current
        if (!mf) return
        if (stripDelimiters(mf.value) !== value) {
            mf.setValue(value, { silenceNotifications: true })
        }
    }, [value])

    return (
        <div
            ref={containerRef}
            className={cn(
                "[&>math-field]:block [&>math-field]:min-h-8 [&>math-field]:w-full [&>math-field]:rounded-lg [&>math-field]:border [&>math-field]:border-input [&>math-field]:px-2 [&>math-field]:py-1 [&>math-field]:outline-none",
                className
            )}
        />
    )
}
