# muscle.quest.web

Vanilla JS/HTML/CSS bundle aimed at GitHub Pages.

## 公開URL
- GitHub Pages (Actions 配信): https://<your-github-username>.github.io/muscle.quest.web/

## Scripts
- `npm run dev` – rebuilds `dist/` on changes and serves it at `http://localhost:4173`.
- `npm run build` – copies source assets from `src/` into `dist/` (bundled `app.js` plus `index.html`, `style.css`).
- `npm run preview` – builds then serves the production bundle at `http://localhost:4174`.

## GitHub Pages へのデプロイ手順
1. GitHub のリポジトリ設定から **Pages** を開き、**Source** を「GitHub Actions」に設定します。
2. main ブランチに push すると、`.github/workflows/deploy-pages.yml` が `npm run build` を実行し、`dist/` を Pages にデプロイします。
3. ワークフロー完了後、上記の公開 URL にアクセスしてサイトを確認できます。

## Manual route verification
All primary hash routes can be checked without extra tooling:
1. Run `npm run dev` and open the displayed local URL.
2. Use the buttons on the page (or edit the URL hash) to visit:
   - `#/`
   - `#/settings`
   - `#/rank/...` (example button points to `#/rank/example`)
   - `#/quest/...` (example button points to `#/quest/example`)
   - `#/run/...` (example button points to `#/run/example`)
   - `#/account`
3. The header updates to confirm the active route and description.
