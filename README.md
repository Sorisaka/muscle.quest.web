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

## Supabase Auth の初期設定
- Supabase の URL と anon key は `src/lib/supabaseClient.js` の `SUPABASE_URL` / `SUPABASE_ANON_KEY` に手入力してください。`createSupabase` / `supabase` 経由で全サービスが共有します。
- OAuth プロバイダやリダイレクト先は `src/services/authService.js` の `DEFAULT_OAUTH_PROVIDER` / `OAUTH_REDIRECT_TO` を書き換えて利用します。`OAUTH_REDIRECT_TO` が空の場合は、現在の URL から `/auth/callback` を導出するフォールバックが使われます。
- Supabase Dashboard の **Authentication → URL Configuration** で、Redirect URLs に以下を登録してください（必要に応じて GitHub ユーザー名を差し替え）：
  - 開発: `http://localhost:4173/auth/callback`
  - プレビュー: `http://localhost:4174/auth/callback`
  - 本番 (GitHub Pages): `https://<your-github-username>.github.io/muscle.quest.web/auth/callback`
  - （既存のトップページ URL `.../` も残したい場合は併記）
- OAuth/PKCE リダイレクト後は `/auth/callback` がセッション確立を試行し、完了後に `/#/account` へ戻ります。
- `#/account` では Supabase が未設定の場合にエラーメッセージを表示し、`src/lib/supabaseClient.js` の URL/anon key を埋めるよう促します。

## `#/account` でのログインとプロフィール編集
1. `src/lib/supabaseClient.js` の `SUPABASE_URL` / `SUPABASE_ANON_KEY` を入力し、Redirect URL に `/auth/callback` を含めた状態でビルド・デプロイします。
2. `/#/account` を開くと Supabase Auth のセッションを確認し、未ログインなら OAuth ログインボタンを表示します。
3. ログイン後は Supabase の `auth.users` 情報（ID/email）と `profiles.display_name` を表示します。表示名を編集して「表示名を保存」を押すと `profiles` テーブルが更新されます。
4. 「Sign out」で Supabase からログアウトし、画面もゲスト状態に戻ります。
5. `supabase/sql/001_profiles.sql` を実行済みでない場合は、表示名の取得/保存でエラーが表示されるため、SQL 実行状況を確認してください。

## Supabase DB セットアップ（profiles 自動作成 SQL）
1. Supabase Dashboard で **SQL Editor** を開き、`supabase/sql/001_profiles.sql` の内容をコピペして 1 度だけ実行します（service_role key は不要です）。
2. 実行後、`profiles` テーブルが存在し、`id`（auth.users 参照）/`display_name`/`created_at` が揃っていることを確認します。
3. 新規サインアップを行い、`profiles` に該当ユーザーの行が自動で作成されることを Supabase の Table editor などで確認します（RLS が ON の前提）。

## 将来の workout_events について（trainingService 用の想定スキーマ）
- この段階では SQL を実行しませんが、`src/services/trainingService.js` は以下のカラムを持つ `workout_events` テーブルを想定しています。
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid references auth.users(id)`
  - `event_type text`（例: `debug_insert`, `quest_completed` など）
  - `points integer`（獲得ポイント）
  - `occurred_at timestamptz`（発生日時）
  - `metadata jsonb`（任意の付加情報）
- RLS を有効化し、`user_id = auth.uid()` のデータのみ read/write できるようなポリシーを設定することを想定しています。
- `/#/account?devtools=1` にアクセスすると開発者向けのデバッグボタンが表示され、`workout_events` に 1pt のテストレコードを挿入する動作確認ができます（セッションと Supabase 設定が必要）。

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
