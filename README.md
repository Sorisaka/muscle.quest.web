# muscle.quest.web

Vanilla JS/HTML/CSS bundle aimed at GitHub Pages.

## 公開URL
- GitHub Pages (Actions 配信): https://<your-github-username>.github.io/muscle.quest.web/

## Scripts
- `npm run dev` – rebuilds `dist/` on changes and serves it at `http://localhost:4173`.
- `npm run build` – copies source assets from `src/` into `dist/` (bundled `app.js` plus `index.html`, `style.css`).
- `npm run preview` – builds then serves the production bundle at `http://localhost:4174`.

## 開発とビルドのポリシー
- 依存管理は **npm のみ** を使用し、ロックファイル（`package-lock.json`）を常にコミットします。開発・CI ともに基本コマンドは `npm ci` です。
- Node.js の基準は **20 系**（`.nvmrc` 参照）。ローカルでも `nvm use` などで CI（GitHub Actions）の Node 20 と揃えてください。
- `src/` が唯一のソース。`dist/` は `npm run build` で再生成し、手動編集は禁止です。`dist/` をコミットする場合も、必ず `src/` を更新 → `npm run build` で反映してからにしてください。

### `npm ci` 失敗時のリカバリ手順
- **パターンA: `package-lock.json` が存在しない**
  1. `npm install` を実行して `package-lock.json` を生成。
  2. 生成物をコミットしてから `npm ci` を再実行し、通ることを確認。
- **パターンB: `npm ci can only install packages when package.json and package-lock.json are in sync`**
  1. `npm install` を実行してロックファイルを更新。
  2. 依存追加/削除が意図通りか確認し、`package.json` と `package-lock.json` をセットでコミット。
  3. `npm ci` を再実行して通ることを確認。
- **パターンC: Node バージョン差異による失敗**
  1. `.nvmrc` 記載の Node 20 に合わせる（CI も同じバージョンを使用）。
  2. CI では `node -v` / `npm -v` をログ出力してバージョン差異を確認する。
  3. 必要に応じて `actions/setup-node` の `node-version` を合わせる。

### UI レンダリングの安全柵
- ルーティング後の描画は `[data-view]` 配下のみを差し替え、ナビゲーションや共通ヘッダーを上書きしない構成です。新規ビューを追加する際もこのコンテナにマウントしてください。


## ランタイム設定 (Supabase などの秘匿値)
- 機微情報はソースに含めず、Pages に配信する成果物 `dist/config.js` にだけ埋め込みます。
- ローカル開発では `cp src/config.example.js dist/config.js` でテンプレートを複製し、`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `OAUTH_REDIRECT_TO` を手元の値に差し替えてください。
- GitHub Actions では `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `OAUTH_REDIRECT_TO` の Secrets を登録し、`npm run build` 後にワークフローが `dist/config.js` を生成してから Pages へアップロードします。
- `dist/config.js` は `.gitignore` 済みです。コミットしないでください。
- `npm run build` は毎回 `dist/` をクリーンするため、開発時はビルドのあとに改めて `dist/config.js` を配置してください。

### Supabase の profiles セットアップ
- Supabase の SQL Editor で `supabase/sql/001_profiles.sql` を実行し、`profiles` テーブルとサインアップ時に自動作成されるトリガーを作成してください。
- RLS を有効化した上で、コメント例にあるように「自分の行だけ select/update を許可するポリシー」を追加してください（既存設定を壊さない範囲で調整可）。
- 新規サインアップ後、`profiles` に `auth.users` と同じ `id` の行が作成されることを確認し、`display_name` が `#/account` で更新・再読込後も保持されることを確認してください。

### Supabase Redirect URLs
- Supabase の OAuth 設定では、以下の Redirect URLs を登録してください。
  - 開発: `http://localhost:4173/auth/callback/`
  - プレビュー: `http://localhost:4174/auth/callback/`
  - GitHub Pages 配信時: `https://<your-github-username>.github.io/muscle.quest.web/auth/callback/`
- `OAUTH_REDIRECT_TO` を設定していない場合でも、アプリ側で現在の base path から `/auth/callback/` を推定し、`/#/account` に戻します。


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
