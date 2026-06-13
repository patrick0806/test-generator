import { TestForm } from "@/components/test-form"

export default function Page() {
    return (
        <main className="mx-auto w-full max-w-3xl px-6 py-10">
            <header className="mb-8 space-y-1">
                <h1 className="font-heading text-2xl font-semibold">
                    Gerador de Provas
                </h1>
                <p className="text-sm text-muted-foreground">
                    Monte sua prova com notação matemática e exporte para PDF.
                </p>
            </header>
            <TestForm />
        </main>
    )
}
