# LaTex

Gerador de provas (MVP): compose um exame com suporte a notação matemática e exporte para PDF.

## Pré-requisitos

Este projeto compila LaTeX para PDF no servidor e exige um motor LaTeX instalado na máquina:

- **Tectonic** (padrão): instale com `curl -sSL https://drop-sh.fullyjustified.net | sh` e coloque o binário no `PATH`.
- **pdflatex** (alternativa): instale via TeX Live (`sudo apt install texlive-full`).

O motor é selecionado pela variável de ambiente `LATEX_ENGINE` (padrão: `tectonic`). Se nenhum motor for encontrado, a rota `/api/pdf` responde `501` com instruções.

## Desenvolvimento

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
