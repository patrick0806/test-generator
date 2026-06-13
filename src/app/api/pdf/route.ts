import { chromium, type Browser } from "playwright-core"

import { renderTestHtml } from "@/lib/render-test-html"
import { testSchema } from "@/lib/schemas"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
    let browser: Browser | undefined

    try {
        const body = await request.json()
        const parsed = testSchema.safeParse(body)
        if (!parsed.success) {
            return Response.json(
                { error: "Dados inválidos", details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const html = renderTestHtml(parsed.data)

        browser = await chromium.launch({
            executablePath:
                process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
            args: ["--no-sandbox"],
        })

        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: "load" })

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "18mm",
                right: "20mm",
                bottom: "18mm",
                left: "20mm",
            },
        })

        const filename = `${parsed.data.title || "prova"}.pdf`

        return new Response(new Uint8Array(pdf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("PDF generation failed", error)
        return Response.json(
            { error: "Não foi possível gerar o PDF." },
            { status: 500 }
        )
    } finally {
        if (browser) {
            await browser.close().catch(() => {})
        }
    }
}
