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
- 保存先を Supabase に切り替え、ログイン時は Supabase 側を正としつつ、初回は Supabase の履歴が空ならローカル履歴を一括取り込み（二重計上を避けるため取り込み済みフラグを付与）するようにしました。Supabase 障害時や未ログイン時はローカル保存に自動フォールバックします。
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
- デフォルトは `supabase` ドライバーで、ログイン済みかつ `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定している場合は Supabase にポイントと履歴を保存します（RPC `add_workout_result` で run 追加と profile 集計を一括実行し、失敗時のみ挿入→更新の段階的フォールバックを行います）。
- Supabase 側に履歴がまだ無い場合は、初回サインイン時にローカル履歴を Supabase へ一括移行し、`musclequest:migration:<user_id>` フラグを立てて二重取り込みを防ぎます。以後は Supabase の値を正とし、ローカルはキャッシュ扱いです。
- Supabase に保存できない場合（認証切れやネットワーク断など）や未ログイン時は `local` ドライバーに自動フォールバックします。現状、オフラインで溜めたローカル履歴を後で Supabase へ再同期する仕組みはありません。

## HAR / ログ共有時のマスキングガイド
サポート向けに HAR やブラウザログを共有する場合は、以下を守って機密情報を伏せてください。

- Authorization ヘッダー、`access_token` / `refresh_token`、`provider_token`、Supabase の anon key などは **全削除** するか、先頭 4 文字 + 末尾 4 文字のみ残す形でマスクする。
- URL のクエリやフラグメントにコードやトークンが含まれている場合は削除してから共有する（`authDebug.maskToken` / `sanitizeUrlForLog` と同じルールで十分）。
- ブラウザストレージ（`localStorage` / `sessionStorage`）のダンプや `dist/config.js` の中身を貼らない。設定値が必要な場合は、キー名だけを示して実値は省く。
- 収集手順を自動化する場合も、ログ出力では上記マスクを適用すること（`src/lib/authDebug.js` にトークンマスク関数あり）。

### Supabase セットアップ（Google OAuth / profiles / RLS / RPC）
以下の手順で Supabase 側を構成すると、README の内容だけで再現できます（URL の末尾 `/` は付けない、Redirect は必ず `.html` 付き）。

#### 前提条件
- Supabase プロジェクトを作成し、**Project URL** と **anon key** を控える。
- 認証プロバイダーは **Google OAuth** を利用する（既存運用と合わせる）。
- Redirect URLs はホストごとに `https://<host>/auth/callback.html` を登録する。GitHub Pages なら `https://<your-github-username>.github.io/muscle.quest.web/auth/callback.html`、ローカル開発なら `http://localhost:4173/auth/callback.html`（`npm run dev` のデフォルトポートに合わせる）が目安。

#### Google OAuth 設定
1. Supabase Dashboard → Authentication → **Providers** → **Google** を有効化。
2. Google Cloud Console で OAuth 同意画面を「外部」で作成し、アプリケーション種別「ウェブアプリ」でクライアント ID/Secret を発行。
3. 取得したクライアント ID/Secret を Supabase 側に貼り付け、**承認済みのリダイレクト URI** に上記 Redirect URLs をすべて登録して保存。

#### SQL の適用順序（Supabase Dashboard → SQL Editor）
番号順に `supabase/sql/` のファイルを実行する。リンクはリポジトリ内の SQL に対応し、Supabase SQL Editor にそのまま貼り付けられる想定。
1. [`001_profiles.sql`](supabase/sql/001_profiles.sql) – `profiles` テーブル（`created_at` / `updated_at`）と、サインアップ時に自動作成するトリガー、`updated_at` を更新するトリガーを作成。
2. [`002_profiles_policies.sql`](supabase/sql/002_profiles_policies.sql) – `profiles` の RLS を有効化し、**自分の行だけ select/update/insert/delete** できるポリシーを追加。
3. [`003_profiles_extend.sql`](supabase/sql/003_profiles_extend.sql) – `points` / `completed_runs` / `last_result` 列を追加し、サインアップトリガーを拡張して初期値（0,0,null）で作成する。
4. [`004_workout_runs.sql`](supabase/sql/004_workout_runs.sql) – `workout_runs` 履歴テーブルを作成（`user_id` FK, `created_at`, `result` JSON, `points`）。
5. [`005_workout_runs_policies.sql`](supabase/sql/005_workout_runs_policies.sql) – `workout_runs` の RLS を有効化し、**自分の行のみ select/insert** できるポリシーを追加（`user_id = auth.uid()` を強制）。
6. [`006_functions_add_workout_result.sql`](supabase/sql/006_functions_add_workout_result.sql) – RPC `add_workout_result(p_points, p_result)` を作成し、`workout_runs` への insert と `profiles` の集計更新をトランザクションで同時実行（更新後の profile を返却）。
7. [`007_verification.sql`](supabase/sql/007_verification.sql) – スキーマ・RLS・トリガーの確認用クエリ群。

#### 適用後の確認クエリ例（SQL Editor で実行）
- `select table_name, is_rls_enabled from information_schema.tables where table_schema = 'public' and table_name in ('profiles','workout_runs');`
- `select policyname, tablename, permissive, roles, cmd from pg_policies where schemaname = 'public' and tablename in ('profiles','workout_runs');`
- `select tgname, tgrelid::regclass, tgtype::bit(8) from pg_trigger where tgname like 'handle_%user%';`
- `select * from public.profiles limit 5;`
- `select * from public.workout_runs order by created_at desc limit 5;`

#### RLS / ポリシーの意図
- `profiles`: 本人以外が閲覧/更新できないよう **select/update** を本人に限定（将来のランキング拡張までは閉じる）。
- `workout_runs`: 本人のみが履歴を **select/insert** できるようにし、`insert` 時に `user_id = auth.uid()` を強制（更新・削除は不要なため許可しない）。
- これにより、他ユーザーのポイント・履歴が誤って参照・改変されることを防ぎ、現行 UI の想定（自分専用のポイント管理）に合わせる。

#### クライアント設定（dist/config.js）
- ローカル: `cp src/config.example.js dist/config.js` でテンプレートを複製し、`SUPABASE_URL` / `SUPABASE_ANON_KEY` を入力。`OAUTH_REDIRECT_TO` は空でも自動推論が働くが、ベースパスを変える場合は `.html` 付きで指定。
- GitHub Pages: Secrets に `SUPABASE_URL` / `SUPABASE_ANON_KEY`（必要なら `OAUTH_REDIRECT_TO`）を登録し、Actions が `npm run build` 後に `dist/config.js` を生成してから Pages へアップロードする。将来 Secrets を別 CI で注入する場合も、ビルド完了後に生成された `dist/config.js` をデプロイ物に含めること。

#### 動作確認フロー（UI は無変更のまま）
1. 未ログイン: `npm run dev` → `#/run/...` を実行し、ポイントがローカル保存で増えることを確認。
2. ログイン: 「Google でログイン」後に同じ操作を行い、Supabase の `profiles.points` と `workout_runs` に反映されること、別ブラウザで再ログインするとポイント/履歴が復元されることを確認。
3. トラブルシュート:
   - 401/403 が出る: RLS/ポリシー適用漏れ（`005_workout_runs_policies.sql` など）の再確認。
   - `profiles` 行が無い: サインアップトリガー（`001_profiles.sql` / `003_profiles_extend.sql` 内の `handle_new_user_profile`）の適用漏れを確認。
   - RPC が無い: `006_functions_add_workout_result.sql` の適用を確認。

#### 既知の制約と初回移行方針
- **Supabase 優先**: ログイン後は Supabase 側の points/history を正とし、ローカルはキャッシュ扱い。
- **片方向マージ（任意）**: Supabase の履歴が空のときに限りローカル履歴を一括で Supabase へ移行し、`musclequest:migration:<user_id>` フラグで二重取り込みを防止する。以後は Supabase の値を優先。
- オフラインや Supabase エラー時はローカルにフォールバックするが、ローカルで溜めた履歴を後から自動で Supabase に同期する仕組みは現状無し（必要なら手動で再実行する）。


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
