# LaTex

Gerador de provas (MVP): compose um exame com suporte a notação matemática e exporte para PDF.

## Pré-requisitos

O PDF é gerado a partir de HTML por um navegador headless (Playwright + Chromium). Não há dependência de LaTeX/Tectonic/pdflatex.

- **Chromium (Playwright)**: instale o navegador com `npx playwright-core install chromium`.

Em ambientes serverless (ex.: Vercel), defina a variável de ambiente `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` apontando para o binário do Chromium fornecido pela plataforma. Localmente, o Playwright localiza o Chromium instalado acima automaticamente.

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
