import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { promises as fs } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { generateLatex } from "@/lib/generate-latex"
import { testSchema } from "@/lib/schemas"

export const dynamic = "force-dynamic"

function run(cmd: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
        })
        let stderr = ""
        proc.stderr?.on("data", (chunk) => {
            stderr += chunk.toString()
        })
        proc.on("error", reject)
        proc.on("close", (code) => {
            if (code === 0) resolve("")
            else reject(new Error(`${cmd} exited with code ${code}\n${stderr}`))
        })
    })
}

async function isAvailable(engine: string): Promise<boolean> {
    try {
        await run(engine, ["--version"], tmpdir())
        return true
    } catch {
        return false
    }
}

async function compile(engine: string, texFile: string, cwd: string) {
    if (engine === "pdflatex") {
        await run(
            "pdflatex",
            ["-interaction=nonstopmode", "-halt-on-error", texFile],
            cwd
        )
    } else {
        await run("tectonic", [texFile], cwd)
    }
}

export async function POST(request: Request) {
    let workDir: string | null = null

    try {
        const body = await request.json()
        const parsed = testSchema.safeParse(body)
        if (!parsed.success) {
            return Response.json(
                { error: "Dados inválidos", details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const engine = (process.env.LATEX_ENGINE || "tectonic").trim()
        const resolvedEngine = engine === "pdflatex" ? "pdflatex" : "tectonic"

        if (!(await isAvailable(resolvedEngine))) {
            return Response.json(
                {
                    error: `Motor LaTeX "${resolvedEngine}" não encontrado. Instale o Tectonic ou o pdflatex.`,
                },
                { status: 501 }
            )
        }

        const baseName = `prova-${randomUUID().slice(0, 8)}`
        workDir = await fs.mkdtemp(join(tmpdir(), "latex-"))
        const texPath = join(workDir, `${baseName}.tex`)
        const pdfPath = join(workDir, `${baseName}.pdf`)

        const latex = generateLatex(parsed.data)
        await fs.writeFile(texPath, latex, "utf8")

        await compile(resolvedEngine, `${baseName}.tex`, workDir)

        const pdf = await fs.readFile(pdfPath)

        return new Response(new Uint8Array(pdf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
            },
        })
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Falha ao gerar o PDF."
        return Response.json({ error: message }, { status: 500 })
    } finally {
        if (workDir) {
            await fs.rm(workDir, { recursive: true, force: true })
        }
    }
}
