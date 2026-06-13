"use client"

import * as React from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileDownIcon, LoaderIcon, PlusIcon } from "lucide-react"

import { testSchema, type TestInput } from "@/lib/schemas"
import type { Test } from "@/types/test"
import { QuestionForm } from "@/components/question-form"
import { TestPreview } from "@/components/test-preview"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function createEmptyQuestion(): TestInput["questions"][number] {
    return { description: "", type: "open", options: [] }
}

export function TestForm() {
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [submitError, setSubmitError] = React.useState<string | null>(null)

    const form = useForm<TestInput>({
        resolver: zodResolver(testSchema),
        defaultValues: {
            id: crypto.randomUUID(),
            school: "",
            teacher: "",
            title: "",
            date: "",
            questions: [createEmptyQuestion()],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    })

    const watched = useWatch({ control: form.control }) as Test

    async function onSubmit(values: TestInput) {
        setIsGenerating(true)
        setSubmitError(null)
        try {
            const res = await fetch("/api/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                const message = await res.text()
                throw new Error(message || `Erro ${res.status}`)
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${values.title || "prova"}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Falha ao gerar o PDF."
            )
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Form {...form}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da prova</CardTitle>
                        <CardDescription>
                            Preencha as informações básicas da prova.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Título da prova</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Prova de Matemática"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="teacher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professor(a)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nome do professor"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data da prova</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium">Questões</h2>
                    </div>

                    {fields.map((question, index) => (
                        <QuestionForm
                            key={question.id}
                            index={index}
                            onRemove={() => remove(index)}
                        />
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append(createEmptyQuestion())}
                    >
                        <PlusIcon />
                        Adicionar questão
                    </Button>
                </div>

                {submitError ? (
                    <p className="text-sm text-destructive">{submitError}</p>
                ) : null}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? (
                            <LoaderIcon className="animate-spin" />
                        ) : (
                            <FileDownIcon />
                        )}
                        Gerar PDF
                    </Button>
                </div>
                </form>

                <div className="lg:sticky lg:top-6 lg:self-start">
                    <TestPreview test={watched} />
                </div>
            </div>
        </Form>
    )
}
