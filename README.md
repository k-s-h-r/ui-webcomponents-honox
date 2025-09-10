# ui-webcomponents-honox

HonoX + Vite ベースのデモリポジトリです。
`web-components/` に実装した UI Web Components（Accordion / Dialog / Tabs）をサンプル表示します。

## 主要ルート

- `/` トップ（概要と簡易デモ）
- `/accordion` アコーディオンのバリエーション一覧
- `/dialog` ダイアログのバリエーション一覧
- `/tabs` タブのバリエーション一覧

## 開発・ビルド

```bash
npm i
npm run dev       # ローカル開発 (Vite + HonoX)
npm test          # 単体テスト (Vitest + JSDOM)
npm run build     # ビルド (client/server)
npm run preview   # Cloudflare Pages でプレビュー
npm run deploy    # ビルドして Cloudflare Pages にデプロイ
```

## 構成

- `app/` HonoX アプリ（`routes/`, `islands/`, 共有 `_components/`, `lib/`）
- `web-components/` カスタムエレメント（`accordion/`, `dialog/`, `tabs/`, `utils/` とテスト）
- `public/` 静的アセット

その他設定: `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `wrangler.json`, `tsconfig.json`, `biome.json`

## 備考

- コード整形/静的解析は Biome を使用: `npx biome check .`
