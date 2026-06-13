"use client"

import * as React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { PlusIcon, Trash2Icon } from "lucide-react"

import type { TestInput } from "@/lib/schemas"
import { MathInput } from "@/components/math-input"
import { StatementInput } from "@/components/statement-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface QuestionFormProps {
    index: number
    onRemove: () => void
}

export function QuestionForm({ index, onRemove }: QuestionFormProps) {
    const { control, watch, setValue } = useFormContext<TestInput>()

    const type = watch(`questions.${index}.type`)
    const options = watch(`questions.${index}.options`) ?? []

    const addOption = () =>
        setValue(`questions.${index}.options`, [...options, ""])
    const removeOption = (optionIndex: number) =>
        setValue(
            `questions.${index}.options`,
            options.filter((_, i) => i !== optionIndex)
        )

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                    Questão {index + 1}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onRemove}
                    aria-label="Remover questão"
                >
                    <Trash2Icon />
                </Button>
            </div>

            <div className="space-y-1">
                <Label>Enunciado</Label>
                <Controller
                    control={control}
                    name={`questions.${index}.description`}
                    render={({ field, fieldState }) => (
                        <div className="space-y-1">
                            <StatementInput
                                value={field.value}
                                onChange={field.onChange}
                            />
                            {fieldState.error ? (
                                <p className="text-sm text-destructive">
                                    {fieldState.error.message}
                                </p>
                            ) : null}
                        </div>
                    )}
                />
            </div>

            <div className="space-y-1">
                <Label>Tipo</Label>
                <Controller
                    control={control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Aberta</SelectItem>
                                <SelectItem value="multiple-choice">
                                    Múltipla escolha
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {type === "multiple-choice" ? (
                <div className="space-y-2">
                    <Label>Alternativas</Label>
                    {options.map((_, optionIndex) => (
                        <div
                            key={optionIndex}
                            className="flex items-start gap-2"
                        >
                            <Controller
                                control={control}
                                name={`questions.${index}.options.${optionIndex}`}
                                render={({ field, fieldState }) => (
                                    <div className="flex-1 space-y-1">
                                        <MathInput
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                        />
                                        {fieldState.error ? (
                                            <p className="text-sm text-destructive">
                                                {fieldState.error.message}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeOption(optionIndex)}
                                aria-label="Remover alternativa"
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                    >
                        <PlusIcon />
                        Adicionar alternativa
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
