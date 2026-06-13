"use client"

import * as React from "react"
import { CheckIcon, SigmaIcon, XIcon } from "lucide-react"

import { MathField } from "@/components/math-field"
import { Button } from "@/components/ui/button"
import { parseStatement, renderStatementHtml } from "@/lib/statement"

interface StatementInputProps {
    value: string
    onChange: (value: string) => void
}

interface EditTarget {
    start: number
    end: number
    /** `null` = insert mode; a string = re-edit an existing token's LaTeX. */
    latex: string | null
}

export function StatementInput({ value, onChange }: StatementInputProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const pendingCaretRef = React.useRef<number | null>(null)

    const [panelOpen, setPanelOpen] = React.useState(false)
    const [target, setTarget] = React.useState<EditTarget>({
        start: 0,
        end: 0,
        latex: null,
    })
    const [draft, setDraft] = React.useState("")

    const editing = target.latex != null
    const previewHtml = React.useMemo(() => renderStatementHtml(value), [value])

    // Restore the caret after a programmatic splice (insert/replace).
    React.useLayoutEffect(() => {
        if (pendingCaretRef.current == null) return
        const caret = pendingCaretRef.current
        pendingCaretRef.current = null
        const ta = textareaRef.current
        if (!ta) return
        ta.focus()
        ta.selectionStart = caret
        ta.selectionEnd = caret
    }, [value])

    const openEquationPanel = () => {
        const ta = textareaRef.current
        const selStart = ta?.selectionStart ?? value.length
        const selEnd = ta?.selectionEnd ?? value.length

        let nextTarget: EditTarget = {
            start: selStart,
            end: selEnd,
            latex: null,
        }

        // Re-edit: a collapsed caret inside a `$...$` token edits that token.
        if (selStart === selEnd) {
            const within = parseStatement(value).find(
                (segment) =>
                    segment.kind === "math" &&
                    segment.start < selStart &&
                    selStart < segment.end
            )
            if (within) {
                nextTarget = {
                    start: within.start,
                    end: within.end,
                    latex: within.value,
                }
            }
        }

        setTarget(nextTarget)
        setDraft(nextTarget.latex ?? "")
        setPanelOpen(true)
    }

    const closePanel = () => {
        setPanelOpen(false)
        setDraft("")
        textareaRef.current?.focus()
    }

    const confirmEquation = () => {
        const latex = draft.trim()
        setPanelOpen(false)
        setDraft("")
        // Empty equation is never inserted.
        if (!latex) return
        const token = `$${latex}$`
        const next =
            value.slice(0, target.start) + token + value.slice(target.end)
        onChange(next)
        pendingCaretRef.current = target.start + token.length
    }

    const onPanelKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            event.preventDefault()
            closePanel()
        } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            confirmEquation()
        }
    }

    const onTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "m") {
            event.preventDefault()
            openEquationPanel()
        }
    }

    return (
        <div className="space-y-1">
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={panelOpen}
                    onClick={openEquationPanel}
                >
                    <SigmaIcon />
                    Inserir equação
                </Button>
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={onTextareaKeyDown}
                rows={3}
                placeholder="Escreva o enunciado…"
                className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base leading-relaxed transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />

            {panelOpen ? (
                <div
                    className="space-y-2 rounded-lg border bg-card p-2"
                    onKeyDown={onPanelKeyDown}
                >
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-muted-foreground">
                            {editing
                                ? "Editar equação"
                                : "Inserir equação"}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Cancelar"
                            onClick={closePanel}
                        >
                            <XIcon />
                        </Button>
                    </div>
                    <MathField
                        value={draft}
                        onChange={setDraft}
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            onClick={confirmEquation}
                        >
                            <CheckIcon />
                            {editing ? "Salvar" : "Inserir"}
                        </Button>
                    </div>
                </div>
            ) : null}

            {previewHtml ? (
                <div
                    className="rounded-md bg-muted px-2 py-1 text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
            ) : null}
        </div>
    )
}
