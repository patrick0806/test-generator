export const printStyles = `
@page {
    size: A4;
    margin: 18mm 20mm;
}

.printable-test {
    color: #111;
    font-family: "Latin Modern Roman", Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.5;
}

.printable-test__header {
    display: flex;
    flex-direction: column;
    gap: 2pt;
    padding-bottom: 8pt;
    border-bottom: 1.5pt solid #111;
    margin-bottom: 14pt;
}

.printable-test__title {
    font-size: 18pt;
    font-weight: 700;
}

.printable-test__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4pt 18pt;
    font-size: 11pt;
}

.printable-test__questions {
    list-style: decimal;
    margin: 0;
    padding-left: 18pt;
}

.printable-test__question {
    margin-bottom: 16pt;
    break-inside: avoid;
    page-break-inside: avoid;
}

.printable-test__statement {
    margin: 0 0 8pt;
}

.printable-test__statement .katex {
    font-size: 1.05em;
}

.printable-test__answer-space {
    margin-top: 6pt;
    background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 13mm,
        #9aa0a6 13mm,
        #9aa0a6 13.2mm
    );
    height: 42mm;
}

.printable-test__options {
    list-style: none;
    margin: 6pt 0 0;
    padding: 0;
}

.printable-test__option {
    display: flex;
    align-items: baseline;
    gap: 8pt;
    margin-bottom: 5pt;
    break-inside: avoid;
    page-break-inside: avoid;
}

.printable-test__option-marker {
    flex: 0 0 auto;
    min-width: 10pt;
    font-weight: 700;
}

.printable-test__empty {
    color: #6b7280;
    font-style: italic;
}
`
