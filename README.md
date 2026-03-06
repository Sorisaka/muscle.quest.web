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


## タイムライン仕様（タブ定義）
- `global`（全体公開）: **非フォロー相手の public 投稿のみ**（自分の投稿は除外）
- `following`（フォロー中）: **フォロー相手の public/private 投稿 + 自分の投稿**

## タイムライン UI 検証手順
1. `#/timeline` 初回表示時に、現在スコープ（デフォルト following）が自動ロードされること
2. 2回目以降（同一セッション・同一スコープ）は自動再取得されず、`更新` ボタン押下時のみ再取得されること
3. `following` ↔ `global` 切替直後に、前タブの投稿が残らないこと（残像がないこと）
4. `global` が 0 件の場合でも、空状態（投稿なし）として表示されること

## Phase 1 UI再編メモ（下部ナビ・画面遷移基盤）

### ローカル開発手順
1. Node.js 20 系を利用（`.nvmrc`）。
2. 依存をクリーンインストール: `npm ci`。
3. 開発サーバー起動: `npm run dev`。
4. Supabase 連携を試す場合は `dist/config.js` を用意（`src/config.example.js` をコピーして値を設定）。
   - `dist/config.js` はビルド成果物側のランタイム設定ファイルであり、コミットしない。
   - `npm run build` 後は `dist/` が再生成されるため、必要なら再配置する。

### 下部ナビのスマホブラウザ対応仕様
- `safe-area-inset-bottom` を `--safe-area-bottom` として使用し、iOSノッチ/ホームインジケータ領域を吸収。
- `window.visualViewport` を使って `window.innerHeight - (visualViewport.height + visualViewport.offsetTop)` を計算し、ブラウザ下部UI占有分を `--browser-ui-offset` へ反映。
- 下部ナビは `position: fixed` のまま `bottom: calc(var(--safe-area-bottom) + var(--browser-ui-offset))` で動的に持ち上げる。
- 本文側は `padding-bottom: var(--bottom-nav-total)`（ナビ高さ + safe area + 動的オフセット）を確保し、コンテンツ被りを防止。
- 再計算イベント:
  - `resize`
  - `orientationchange`
  - `visualViewport.resize`
  - `visualViewport.scroll`
- キーボード表示推定（下部占有が閾値超え）時は `--browser-ui-offset` を 0 扱いにし、入力中の極端な浮き上がりを避ける。

### Safari/スマホブラウザのデバッグ観点
- DevTools のモバイルエミュレーションは viewport 変化を完全再現しないため、`visualViewport` 差分検証は実機確認を推奨。
- iPhone Safari で以下を確認:
  1. URLバー表示時: ナビがURLバーに重ならず上に寄る
  2. URLバー縮小時: 余白が残留せず最下部に戻る
  3. 入力フォーカス時: キーボード表示で不自然な大ジャンプが起きない

### ローカル確認方法
1. `npm run dev` で起動。
2. `#/`, `#/timeline`, `#/rank/local`, `#/history`, `#/account`, `#/settings` を遷移。
3. ドロワー表示→再度左上アイコンタップで `#/account` に遷移することを確認。
4. ワークアウト導線（ホーム→カテゴリ→一覧→詳細→実行）が成立することを確認。

### デプロイ確認方法
1. 本番ビルド: `npm run build`。
2. 本番相当サーブ: `npm run preview`。
3. GitHub Pages 配信時の確認観点:
   - ハッシュルーティング遷移が壊れていない
   - 下部固定ナビのアクティブ表示と重なり回避が機能する
   - `dist/config.js` 注入（Secrets 経由）が必要な環境で認証設定が反映される

## Phase 2: フォロー / フォローリクエスト検証観点
- public アカウント: Follow 押下で即フォロー成立すること
- private アカウント: Request 送信後、相手が Approve した時のみフォロー成立すること
- Reject 時: リクエストが拒否状態となり、フォロー関係が作られないこと
- Request取消: 送信者が pending request を cancel できること
- フォロー解除: Unfollow で follows から削除されること
- follower / following 一覧が表示できること
- private アカウント表示名の末尾に `🔒` が付与されること

## Phase 4: アイコン編集 + 設定画面接続

### ローカルセットアップ（詳細）
1. Node.js 20 系を利用（`.nvmrc`）。
2. 依存インストール: `npm ci`。
3. 開発起動: `npm run dev`。
4. 本番ビルド: `npm run build`。
5. 本番相当の確認: `npm run preview`。
6. ランタイム設定:
   - `cp src/config.example.js dist/config.js`
   - `dist/config.js` に `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定
   - 秘匿値はコミットしない（`dist/config.js` は `.gitignore`）
7. 依存追加が必要な場合:
   - `npm i <package>`
   - `package-lock.json` を含めてコミット

### Supabase SQL 適用手順（migration + 手動SQL）
- migration で適用（推奨）
  1. `supabase link --project-ref <project-ref>`
  2. `supabase db push`
- 手動 SQL で既存環境へ差分適用する場合（SQL Editor）
  1. `supabase/sql/013_phase2_follow_requests.sql`
  2. `supabase/sql/015_phase4_icon_settings.sql`
  3. 検証: `supabase/sql/014_phase2_follow_requests_verification.sql`
- 既存環境の差分適用時に失敗した場合の確認クエリ例
  - `select column_name from information_schema.columns where table_schema='public' and table_name='profiles' and column_name in ('account_visibility','icon_border','icon_background','icon_center_object');`
  - `select conname from pg_constraint where conrelid='public.profiles'::regclass and conname like 'profiles_icon_%';`
  - `select policyname,tablename from pg_policies where schemaname='public' and tablename in ('profiles','follows','follow_requests');`

### UIデバッグ手順（モバイル）
- 基本確認:
  1. `npm run dev` 後に `#/account`, `#/account/following`, `#/account/followers`, `#/follow-requests`, `#/settings/account` を確認。
  2. `+` ボタンから ID 検索 → follow/request/unfollow/cancel が反映されることを確認。
  3. 設定画面で表示名/公開範囲/アイコン構成（外枠・背景・中心）を変更し、ドロワー/一覧/検索結果で同一描画されることを確認。
- 下部ナビのブラウザUI追従:
  - `safe-area-inset-bottom` と `visualViewport` 差分を利用。
  - 判定は `window.innerHeight - (visualViewport.height + visualViewport.offsetTop)`。
  - 再計算イベントは `resize` / `orientationchange` / `visualViewport.resize` / `visualViewport.scroll`。
  - キーボード表示推定時は下部オフセットを 0 扱いにし、ナビの過剰な浮き上がりを防ぐ。
- Safari / iPhone 確認ポイント:
  - URLバー表示/非表示で下余白が残留しないか
  - キーボード表示時に下部ナビや入力欄が極端に崩れないか
  - ドロワー開閉 + ルート遷移（アカウント/リクエスト）が破綻しないか

### デプロイ手順（GitHub Pages）
1. `main` への push で Actions が `npm run build` を実行。
2. ワークフロー内で Secrets から `dist/config.js` を生成して Pages へ配信。
3. 必須 Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - （必要なら）`OAUTH_REDIRECT_TO`
4. デプロイ後の確認観点:
   - ハッシュルーティング（`#/account`, `#/follow-requests`, `#/settings/account`）
   - アイコン構成の表示統一（ドロワー/一覧/検索結果）
   - モバイル下部ナビ追従挙動


## Phase 1: Ranking / Follow 一覧 / ID検索（Supabase優先）

### 追加ファイル
- migration: `supabase/migrations/20260306_0008_phase1_ranking_follow_queries.sql`
- 手動SQL: `supabase/sql/016_phase1_ranking_follow_queries.sql`

### 変更概要
- ランキング取得を Supabase RPC `get_leaderboard` ベースへ移行（公開アカウント + 自分 + フォロー中 private を対象）。
- ID検索を Supabase RPC `search_accounts` ベースへ移行（表示名・アイコン・公開範囲を返却）。
- フォロー一覧 / フォロワー一覧を Supabase RPC `get_following_accounts` / `get_follower_accounts` で取得。
- local fallback は維持しつつ、ダミーランキングアカウントは廃止。

### 適用順
1. `supabase db push`（migration適用）
2. 既存環境へ追加適用する場合は SQL Editor で `supabase/sql/016_phase1_ranking_follow_queries.sql` を実行

### 最低限の確認観点
- 未ログイン時：local fallback で画面が破綻しない
- ログイン時：ランキングに sample/bot が出ない
- ログイン時：ランキングに「自分 / public / フォロー中 private」が表示される
- `#/account/following` / `#/account/followers` で表示名・アイコン・鍵マーク判定が崩れない
- ID検索で対象アカウントが取得できる


## Phase 3: 履歴ページの計測UI/グラフ編集

### 追加SQL
- migration: `supabase/migrations/20260306_0009_phase3_body_metrics_non_empty.sql`
- idempotent SQL: `supabase/sql/017_phase3_body_metrics_non_empty.sql`

### body_metrics の前提
- `body_metrics` は `(user_id, date)` を主キーに 1日1件を upsert します。
- `weight_kg` / `body_fat_pct` は片方 `null` でも保存できます。
- ただし **両方 `null` は禁止**（UI バリデーション + DB CHECK 制約）です。
- 削除は `deleteBodyMetric(date)` 経由で、対象日1件を削除します。


## Phase 4: メニュー設定UI（曜日別計画）

### 機能概要
- `#/settings/menu` で曜日ごとのメニュー項目を編集できます。
- 各項目は以下を保持します。
  - 表示名（`title` / `displayName`）
  - 対応種目（`exerciseSlug`）
  - 対応ワークアウト（`questId`）
  - 任意メモ（`note`）
- 順序変更（↑↓）と削除・追加に対応しています。
- 保存時は `store.saveWeeklyPlan(userId, weekday, items)` を通して persistence に反映されます。

### データ保存先
- local fallback: `localStorage`（`musclequest:weeklyPlans`）
- Supabase: `weekly_plans` テーブル（既存実装）
- 当日TODOは `getTodayPlan` が参照し、同日 `special_plans` がある場合は special が優先されます。

### ローカル確認方法
1. `npm run dev`
2. `#/settings/menu` を開く
3. 任意曜日で項目を追加・編集・並び替え・削除
4. 「曜日メニューを保存」を押下
5. 再読込後に内容が保持されることを確認
6. `#/` の「今日のTODOメニュー」に反映されることを確認

### Supabase適用
- この Phase4 の UI 実装自体では新規 migration は不要です（`weekly_plans` / `special_plans` は既存）。
- 既存環境で未作成の場合は foundation migration を先に適用してください。


## Phase 5: ワークアウト一覧の効く部位フィルタ

- `#/workouts/:tier`（`#/quests/:tier`）で、効く部位による絞り込みを実装しました。
- 複数部位選択時の条件は **AND**（選択したすべての部位に一致）です。
- フィルタ状態は `localStorage`（`musclequest:questListMuscleFilter`）に保存され、一覧再描画や再訪問で維持されます。
- メタデータは `trainingDefinitions` → `exerciseTaxonomy.getExerciseTags` を正として判定します。

## Phase 6: 下部ナビとモバイルブラウザUI干渉対策（2026-03）

### 1) このフェーズで実施したこと（章立て）
- **共通レイアウトの安全余白化**
  - `section.panel` を全 view 共通のスクロールコンテナとして扱い、末尾に `::after` で安全余白を付与。
  - 余白は `--panel-safe-bottom`（= 下部ナビ実測高さ + ブラウザUIオフセット + マージン）で算出。
- **visualViewport 追従の改善**
  - `window.visualViewport` の `resize` / `scroll` に追従して CSS 変数を更新。
  - `window.innerHeight - (visualViewport.height + visualViewport.offsetTop)` で下部UI占有量を算出。
  - キーボード表示推定時は下部UIオフセットを 0 として、過剰なレイアウトジャンプを抑止。
- **下部ナビ重なり対策の適用範囲拡大**
  - タイムライン、ランキング、履歴だけでなく全 view で共通に効く実装へ統一。
  - 内部スクロールを持つ領域（例: ランキングリスト）にも安全余白を適用。
- **Phase 5 修正**
  - ワークアウト一覧の複数部位フィルタを **OR → AND** 条件に変更。

### 2) ローカル開発手順（Node / npm / npm ci）
1. Node.js 20 系を利用（`.nvmrc` 推奨）。
2. 依存インストール: `npm ci`
3. 開発サーバー: `npm run dev`（`http://localhost:4173`）
4. 本番ビルド: `npm run build`
5. 本番相当確認: `npm run preview`（`http://localhost:4174`）

### 3) `dist/config.js` の用意方法
- 開発時は `cp src/config.example.js dist/config.js` でひな型作成後、`SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定。
- `dist/config.js` は機密情報を含むためコミットしない（`.gitignore` 済み）。
- `npm run build` で `dist/` は毎回再生成されるため、必要に応じて再配置する。

### 4) Supabase を使うローカルデバッグ
1. Supabase プロジェクトを用意し、`dist/config.js` に接続情報を設定。
2. Redirect URL に `http://localhost:4173/auth/callback.html` を登録。
3. `npm run dev` 起動後、ログイン→履歴取得/保存→ランキング/フォロー系画面を確認。

### 5) migration / sql の適用順
- **基本方針**: まず `supabase/migrations` を時系列で適用（CLI の `supabase db push` 推奨）。
- **SQL Editor で手動適用する場合**（必要時）:
  1. `supabase/sql/013_phase2_follow_requests.sql`
  2. `supabase/sql/015_phase4_icon_settings.sql`
  3. `supabase/sql/016_phase1_ranking_follow_queries.sql`
  4. `supabase/sql/017_phase3_body_metrics_non_empty.sql`
  5. 検証 SQL（必要に応じて）

### 6) 依存追加の有無
- この Phase 6 では **新規依存を追加していません**。
- 理由: 既存の `visualViewport` + CSS 変数更新ロジックで、要求されたブラウザUI追従と安全余白を実現可能なため。

### 7) GitHub Pages / 現行 deploy 更新手順
1. `src/` を修正（**唯一のソース**）。
2. `npm run build` で `dist/` を再生成。
3. GitHub Actions で Secrets から `dist/config.js` を生成して Pages へ配信。
4. 配信後にモバイル表示とハッシュルーティングを実機確認。

> 重要: **`src` が唯一のソースであり、`dist` の手編集は禁止**。

### 8) モバイルでの確認観点
- iOS Safari の下端UI（表示/非表示で下部ナビと最終操作UIが重ならない）
- Android Chrome の下端/上端UI（URLバー変化時の余白追従）
- キーボード表示時（入力フォーカス時に過剰ジャンプしない）
- 画面回転時（縦横切り替えで余白計算が破綻しない）

### 9) 動作確認チェックリスト
- [ ] 主要画面（ホーム/タイムライン/ランキング/履歴/設定/アカウント）で末尾操作UIが隠れない
- [ ] 「ワークアウト開始」導線先のページ末尾ボタンが常に見える
- [ ] active 下部ナビ表示が壊れていない
- [ ] スクロール不能や二重スクロールが悪化していない
- [ ] キーボード表示時に操作領域の末尾UIへ到達できる
- [ ] 画面回転後も余白とナビ位置が破綻しない

## 最終統合メモ（Phase 1-6）

### 変更ファイル整理（src のみをソースとして編集）
- アプリ実装の最終変更は `src/` を主対象に実施し、必要時のみ `npm run build` で `dist/` を再生成します。
- 主な更新対象:
  - `src/core/bottomInset.js`
  - `src/style.css`
  - `src/views/questListView.js`
  - そのほか各 Phase で更新された `src/core/*`, `src/views/*`, `src/ui/*`, `src/data/*`, `src/services/*`

### local fallback / Supabase 点検方針
- **Supabase 有効時**: ランキング・検索・フォロー一覧は RPC を優先。
- **Supabase 無効/障害時**: `localPersistence` フォールバックで同等の基本導線を維持。
- 確認観点:
  1. 未ログインでもホーム→ワークアウト→履歴保存が成立する
  2. ログイン時は Supabase データが優先される
  3. フォロー/リクエスト操作後にプロフィール・一覧の再取得が走り、リロード不要で反映される

### 最終チェックリスト（統合）
- [ ] 末尾 UI が全画面で下部ナビに隠れない
- [ ] `#/workout/:id` 末尾の開始ボタンに到達できる
- [ ] 下部ナビの active 表示が壊れていない
- [ ] local fallback / Supabase の両モードで主要導線が成立する
- [ ] body_metrics は両 null を拒否する
- [ ] OR ではなく AND で部位フィルタされる

## Phase 1 追加: ナビ active / 履歴グラフ編集 / アカウント導線修正

### ローカルデバッグ手順（Phase 1 観点）
1. 依存インストール: `npm i`
2. 開発サーバー起動: `npm run dev`
3. 下部ナビ active 確認:
   - `#/`, `#/timeline`, `#/rank/local`, `#/rank`, `#/history`, `#/history/2026-01-01`, `#/account`, `#/settings` へ直接遷移
   - ブラウザ戻る/進む、ハッシュ手入力、UIボタン遷移の全てで active が一致すること
4. 履歴グラフ編集確認 (`#/history`):
   - 体重プロット/体脂肪プロットをクリックして編集UIが開くこと
   - 日付・体重・体脂肪を更新後、グラフ表示が即更新されること
   - 片方のみ値がある日の更新/削除が成功すること
   - 削除時に確認ダイアログが出ること
5. アカウント導線確認 (`#/account`):
   - 画面末尾に「フォローリクエスト一覧へ」ボタンが表示されないこと

### SQL適用手順（必要時のみ）
- この Phase 1 では DB スキーマ変更を伴わないため、新規 migration / 手動 SQL の追加は不要です。
- 今後 Supabase スキーマを変更する場合は以下を必ず実施:
  1. `supabase/migrations/*.sql` に migration 追加
  2. 必要に応じて `supabase/sql/*.sql` に手動適用版 SQL を追加
  3. `supabase db push` で適用

### デプロイ手順（再掲）
1. `npm run build` で `dist/` を再生成（`dist/` 手編集は禁止）
2. `npm run preview` で本番相当確認
3. GitHub Pages 向けに push（Actions で build + `dist/config.js` 注入 + deploy）
4. デプロイ後に `#/history` と下部ナビ active を実機/モバイルで再確認

## Phase 4: 身体プロフィール設定（Simple / Advance）の責務分離
- **Simple モード**
  - 入力を最小限（性別・身長・体重）に絞り、歩幅/腕長/脚長/胴体長は自動推定で扱うモード。
  - 迷わず短時間で保存したい利用者向け。
- **Advance モード**
  - Simple と同じ自動推定を初期値として利用しつつ、各寸法を項目単位で `auto/manual` 切替し手動上書きできるモード。
  - 推定値をベースに、個別の身体寸法を詳細調整したい利用者向け。

## Phase 5: 一般設定集約 + 新規フォロー検索修正

### 追加SQL（適用順）
1. migration（推奨）
   - `supabase/migrations/20260306_0009_phase5_general_settings_follow_search_fix.sql`
2. 既存環境に SQL Editor で差分適用する場合
   - `supabase/sql/017_phase5_follow_search_fix.sql`

### 変更内容
- 設定画面の「一般設定」に、専用カテゴリ外の共通設定を集約:
  - 言語
  - 難易度
  - 効果音 ON/OFF
  - 効果音ボリューム
- 新規フォロー検索の `search_accounts` RPC を見直し、以下を改善:
  - private/public を問わず検索対象化（認証済みユーザー前提）
  - 自分自身は検索結果から除外
  - `ID` / `表示名` の exact・prefix・partial を順位付けして返却
  - `account_visibility` / アイコン情報を返却

### ローカルで Supabase 接続時に検索検証する方法
1. `npm i`
2. `npm run build`（必要なら `dist/config.js` に Supabase 設定を配置）
3. `npm run dev`
4. Google ログイン後、`#/account` を開いて `+` ボタンから検索モーダルを表示
5. 以下を確認:
   - 正しい `ID` で結果が返る
   - private アカウントが結果表示され、Request フローに進める
   - public アカウントは Follow フローに進める

### 依存追加
- Phase 5 では新規依存追加なし

### デプロイ手順（Phase 5 反映）
1. SQL 反映: `supabase db push`（または `supabase/sql/017_phase5_follow_search_fix.sql` を手動適用）
2. アプリ反映: `npm run build`
3. GitHub Pages へ push（Actions で build + `dist/config.js` 注入 + deploy）
4. デプロイ後、`#/settings/general` と `#/account` 検索を実機確認

## 最終レビューコメント（Phase 1-5 統合）

### 1. 変更概要
- Phase 1: 下部ナビ active 判定をルーター由来の共通ロジックへ集約、履歴グラフの点クリック編集/削除を実装、アカウント画面の重複導線を整理。
- Phase 2: プロフィール保存時のドロワー/トリガー即時反映、アカウントヘッダのフォロー数エリア配置改善。
- Phase 3: メニュー設定を曜日/特別日トグル化し、1画面で両方編集可能に統合。
- Phase 4: 身体プロフィール設定を再実装し、Simple/Advance 推定フローを復活。
- Phase 5: 一般設定へ共通設定を集約し、新規フォロー検索 RPC を修正。

### 2. 主な修正ファイル
- `src/app.js`
- `src/core/router.js`
- `src/core/accountState.js`
- `src/views/historyView.js`
- `src/views/accountView.js`
- `src/views/settingsView.js`
- `src/style.css`
- `src/ui/chart/sparkline.js`
- `src/ui/accountDrawer.js`
- `src/services/supabase/supabaseAdapter.js`
- `src/data/adapters/localPersistence.js`
- `src/core/store.js`

### 3. 追加 migration / sql 一覧
- migrations
  - `supabase/migrations/20260306_0008_phase1_ranking_follow_queries.sql`
  - `supabase/migrations/20260306_0009_phase5_general_settings_follow_search_fix.sql`
- manual SQL
  - `supabase/sql/016_phase1_ranking_follow_queries.sql`
  - `supabase/sql/017_phase5_follow_search_fix.sql`

### 4. SQL適用順
1. `supabase db push`（migrations を時系列適用）
2. SQL Editor で手動適用が必要な場合のみ以下を順に適用
   1. `supabase/sql/013_phase2_follow_requests.sql`
   2. `supabase/sql/015_phase4_icon_settings.sql`
   3. `supabase/sql/016_phase1_ranking_follow_queries.sql`
   4. `supabase/sql/017_phase5_follow_search_fix.sql`

### 5. ローカル開発手順（詳細）
1. Node.js 20 系を利用（`.nvmrc`）。
2. 依存インストール: `npm ci`（ローカル検証時に必要なら `npm i`）。
3. `dist/config.js` を準備:
   - `cp src/config.example.js dist/config.js`
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY` / 必要なら `OAUTH_REDIRECT_TO` を設定。
4. 開発サーバー: `npm run dev`
5. 本番ビルド: `npm run build`
6. 本番相当確認: `npm run preview`

### 6. Supabase 接続時のローカル確認方法
1. Google ログイン後、`#/account` の `+` から ID 検索を実施。
2. 正しい ID で候補表示されることを確認（public/private 両方）。
3. public は Follow、private は Request フローに遷移できることを確認。
4. `#/timeline` / `#/rank` / `#/account/following` / `#/account/followers` の整合性を確認。

### 7. デプロイ手順
1. SQL を先に適用（`supabase db push` もしくは対象 SQL 手動適用）。
2. `npm run build` で `dist/` を再生成。
3. GitHub Pages 用に push（Actions で `dist/config.js` 注入 + deploy）。
4. デプロイ後に主要画面とモバイル表示を実機確認。

### 8. 変更ファイル一覧の整理方針
- 実装は必ず `src/` を正として修正。
- `dist/` は `npm run build` でのみ再生成。
- SQL は migration と manual SQL を用途別に分離。

### 9. 画面別の確認手順
- `#/` : 下部ナビ active、主要導線。
- `#/timeline` : 表示範囲切替、投稿表示。
- `#/rank/local` : ランキング描画。
- `#/history` : グラフ点クリック編集/削除、即時更新。
- `#/account` : ドロワー表示反映、フォロー検索モーダル。
- `#/settings/account` : 表示名/公開範囲/アイコン保存反映。
- `#/settings/body-profile` : Simple/Advance 推定と保存保持。
- `#/settings/menu` : 曜日/特別日トグル、保存後再表示。
- `#/settings/general` : 言語/難易度/SFX 保存。

### 10. モバイルブラウザ確認観点
- 下部ナビが URLバー・safe-area と重ならない。
- 入力中（キーボード表示）に CTA が隠れない。
- 画面回転後にレイアウト崩れがない。
- ドロワーとモーダルの重なり順（z-index）とタップ挙動が正常。

### 11. 未解決事項
- 現時点で既知の未解決重大事項なし。
- ただし Supabase 側の既存ポリシーが環境差分で異なる場合は、README 記載の SQL 順で再適用して整合させること。
