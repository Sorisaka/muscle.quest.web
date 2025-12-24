# muscle.quest.web

Vanilla JS/HTML/CSS bundle aimed at GitHub Pages.

## 公開URL
- GitHub Pages (Actions 配信): https://<your-github-username>.github.io/muscle.quest.web/

## Scripts
- `npm run dev` – rebuilds `dist/` on changes and serves it at `http://localhost:4173`.
- `npm run build` – copies source assets from `src/` into `dist/` (bundled `app.js` plus `index.html`, `style.css`).
- `npm run preview` – builds then serves the production bundle at `http://localhost:4174`.

## 最近の変更メモ
- 認証プロバイダーを Google OAuth に統一し、UI のログイン文言も「Google でログイン」に揃えました。
- OAuth Callback を `/auth/callback.html` に変更し、URL を末尾スラッシュ無しに統一しました。
- Supabase 用 SQL（profiles 作成・トリガー・RLS/ポリシー）を `supabase/sql/*.sql` として整備し、README から実行手順をたどれるようにしました。
- GitHub Actions で Pages 配信時に Secrets から `dist/config.js` を生成するようにし、リポジトリへ秘匿値を残さない運用にしました。

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
- ローカル開発では `cp src/config.example.js dist/config.js` でテンプレートを複製し、`SUPABASE_URL` / `SUPABASE_ANON_KEY` を自分の値に差し替えてください。`OAUTH_REDIRECT_TO` は空のままでも `authService` が `origin + basePath + /auth/callback.html` を推測します（必要に応じて明示設定）。`npm run build` / `npm run dev` は `dist/config.js` が無い場合に `dist/config.example.js` を自動コピーしますが、中身は秘匿値を含まないプレースホルダーのままです。
- GitHub Actions では `SUPABASE_URL` / `SUPABASE_ANON_KEY`（必要に応じて `OAUTH_REDIRECT_TO`）の Secrets を登録し、`npm run build` 後にワークフローが Secrets を用いて `dist/config.js` を生成してから Pages へアップロードします（Secrets が欠けている場合はジョブが失敗します）。CI では `dist/config.example.js` は使用されません。
- `dist/config.js` は `.gitignore` 済みです。コミットしないでください。
- `npm run build` は毎回 `dist/` をクリーンするため、開発時はビルドのあとに改めて `dist/config.js` を配置してください。自動コピーされたダミー設定では Supabase 連携が無効なままなので、必要に応じて値を差し替えてください。
- `src/config.example.js` / `dist/config.example.js` は常にダミー値（`SUPABASE_ANON_KEY` と `OAUTH_REDIRECT_TO` は空）で保持し、実キーを絶対に貼り付けないでください。実環境用の `dist/config.js` はローカルで生成するか、CI で Secrets から注入します。

### ストレージドライバーの扱い
- アプリの保存処理はデフォルトでローカルストレージを用いる `local` ドライバーのみ提供しています。`supabase` ドライバーはまだ未実装で、指定された場合は警告を出してローカル保存にフォールバックします。
- Supabase との連携は現状、`profileService` 経由のプロフィール読書きと OAuth 認証に限定しています（RLS 付き `profiles` テーブルを REST で操作）。将来の Supabase 永続化を追加する場合は storage adapter 側に新実装を加えてください。

## HAR / ログ共有時のマスキングガイド
サポート向けに HAR やブラウザログを共有する場合は、以下を守って機密情報を伏せてください。

- Authorization ヘッダー、`access_token` / `refresh_token`、`provider_token`、Supabase の anon key などは **全削除** するか、先頭 4 文字 + 末尾 4 文字のみ残す形でマスクする。
- URL のクエリやフラグメントにコードやトークンが含まれている場合は削除してから共有する（`authDebug.maskToken` / `sanitizeUrlForLog` と同じルールで十分）。
- ブラウザストレージ（`localStorage` / `sessionStorage`）のダンプや `dist/config.js` の中身を貼らない。設定値が必要な場合は、キー名だけを示して実値は省く。
- 収集手順を自動化する場合も、ログ出力では上記マスクを適用すること（`src/lib/authDebug.js` にトークンマスク関数あり）。

### Supabase セットアップ（Google OAuth / profiles / RLS）
以下の手順で Supabase 側を構成すると、README の内容だけで再現できます（すべて URL の末尾 `/` は付けないでください）。

1. **Supabase プロジェクト作成**
   - Supabase Dashboard から新規プロジェクトを作成し、プロジェクト URL / anon key を控えます。
2. **Google OAuth の有効化**
   - Supabase Dashboard → Authentication → **Providers** で **Google** を有効化。
   - Google Cloud Console で OAuth 同意画面を「外部」で作成し、**OAuth 2.0 クライアント ID** を発行（アプリケーション種別: ウェブアプリ）。
   - 同画面の **承認済みのリダイレクト URI** に、下記「Redirect URLs」を追加して保存。
   - 取得した **Client ID / Client Secret** を Supabase の Google プロバイダー設定に貼り付けて保存。
3. **Redirect URLs を登録（末尾 `/` なし、`.html` を付与）**
   - デプロイ先のホスト / ベースパスに合わせて `https://<host>/auth/callback.html` を登録します。GitHub Pages であれば `https://<your-github-username>.github.io/<repo>/auth/callback.html` のようにパスを合わせてください。
   - ローカル開発でもブラウザのオリジンに合わせて `http://localhost:<port>/auth/callback.html` を追加しておくと便利です。
4. **SQL の適用順序**
   - Supabase Dashboard → SQL Editor で、番号順に以下を実行します。
     1. `supabase/sql/001_profiles.sql` – `profiles` テーブル（`created_at` / `updated_at`）と、サインアップ時に自動作成するトリガー、更新時に `updated_at` を更新するトリガーを作成。
     2. `supabase/sql/002_profiles_policies.sql` – `profiles` の RLS を有効化し、select / insert / update / delete の各ポリシーを追加。
   - 実行後の確認: 新規サインアップで `auth.users` と同じ `id` の行が `profiles` に作成され、`display_name` が `raw_user_meta_data.full_name / name / user_name / email` の順で反映されること。`#/account` で表示名を更新すると `updated_at` が更新され、RLS ポリシーにより自分の行のみ参照・更新できること。
5. **クライアント設定（dist/config.js）**
   - ローカル: `cp src/config.example.js dist/config.js` を実行し、`SUPABASE_URL` / `SUPABASE_ANON_KEY` を入力します。`OAUTH_REDIRECT_TO` は空のままでも自動推論が働きますが、ベースパスをずらす場合は `.html` 付きで明示してください。
   - GitHub Pages 配信時: GitHub Actions の Secrets に `SUPABASE_URL` / `SUPABASE_ANON_KEY`（必要なら `OAUTH_REDIRECT_TO`）を登録し、ワークフローが `dist/config.js` を生成してから Pages アーティファクトに含めます。
6. **動作確認**
   - アプリのアカウント画面で「Google でログイン」を押し、OAuth フロー完了後に `#/account` へ戻ることを確認します。設定不足の場合はエラーメッセージが表示されます。
7. **GitHub Pages での config 注入**
   - GitHub Actions の Secrets に `SUPABASE_URL` / `SUPABASE_ANON_KEY`（必要に応じて `OAUTH_REDIRECT_TO`。例: `https://<your-github-username>.github.io/muscle.quest.web/auth/callback.html`）を登録します。
   - Pages 用ワークフローが `npm run build` 後に Secrets から `dist/config.js` を生成し、Pages アーティファクトへ含めます（Secrets 未設定時はデプロイを中断）。


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
4. Keep the devtools console open and ensure there are no MIME type errors for `config.js` or module-resolution errors (e.g., `@supabase/supabase-js`). The build now ships `dist/config.js` automatically (dummy values) and serves `vendor/supabase-js` from `dist/vendor/` so the bundle loads without missing-script failures.
