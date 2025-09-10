# Repository Guidelines

## Project Structure & Module Organization
- `app/`: HonoX app (SSR renderer, `routes/`, interactive `islands/`, shared `_components/`, `lib/`).
- `web-components/`: Custom elements source (`accordion/`, `dialog/`, `tabs/`), colocated tests (`*.test.ts`), and `utils/`.
- `public/`: Static assets served as-is.
- Config: `vite.config.ts`, `vitest.config.ts` + `vitest.setup.ts`, `tsconfig.json`, `biome.json`, `wrangler.json`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite + HonoX dev server for local development.
- `npm run preview`: Preview on Cloudflare Pages via Wrangler.
- `npm run build`: Build client and server bundles into `dist/`.
- `npm run deploy`: Build and deploy to Cloudflare Pages.
- `npm test`: Run Vitest in JSDOM.
- `npm run test:ui`: Launch Vitest UI runner.

Example:
```
npm run dev
npm test
npm run build && npm run preview
```

## Coding Style & Naming Conventions
- TypeScript (strict) with JSX via Hono (`jsxImportSource: hono/jsx`).
- Biome formatting/linting: 2 spaces, LF, width 80, double quotes, semicolons, no trailing commas.
- Custom elements: kebab-case tags prefixed `ui-` (e.g., `ui-accordion`); classes in PascalCase (e.g., `UiAccordion`).
- Files: web components in `web-components/<feature>/index.ts`; app UI in `app/_components` and interactive examples in `app/islands`.
- Run checks locally: `npx biome check .` and `npx biome format .`.

## Testing Guidelines
- Framework: Vitest + JSDOM; global setup in `vitest.setup.ts` (RAF mocks, DOM cleanup).
- Location: tests colocated next to source, named `*.test.ts`.
- Focus: ARIA attributes, events (`onValueChange`, `onOpenChange`), state/keyboard behavior.
- Run: `npm test` or `npm run test:ui` for an interactive view.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix(scope):`, `refactor:`, `style:`, `chore:` (English or JP, imperative).
- PRs: clear description, linked issues, UI screenshots/GIFs, test updates, and note breaking changes. Ensure `npm test` and `npm run build` pass.

## Security & Configuration Tips
- Deploys target Cloudflare Pages (`wrangler.json`, `pages_build_output_dir: dist`, `nodejs_compat`).
- Do not commit secrets; configure env vars in Wrangler/Pages. Use `wrangler login` before preview/deploy.
