import { renderPrintableMarkup } from "@/lib/printable-markup"
import type { Test } from "@/types/test"

interface PrintableTestProps {
    test: Test
}

export function PrintableTest({ test }: PrintableTestProps) {
    return (
        <div
            dangerouslySetInnerHTML={{ __html: renderPrintableMarkup(test) }}
        />
    )
}
