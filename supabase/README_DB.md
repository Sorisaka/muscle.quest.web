# Supabase DB Migration Guide

## 適用手順（Supabase CLI想定）

1. Supabase プロジェクトへログイン
   - `supabase login`
2. プロジェクトをリンク
   - `supabase link --project-ref <your-project-ref>`
3. マイグレーションを適用
   - `supabase db push`
4. 適用確認（例）
   - `supabase db remote commit --dry-run` または Supabase Dashboard の SQL Editor / Table Editor で確認

## マイグレーション一覧

### 既存 SQL（参考）
- `supabase/sql/001_profiles.sql`
- `supabase/sql/002_profiles_policies.sql`
- `supabase/sql/003_profiles_extend.sql`
- `supabase/sql/004_workout_runs.sql`
- `supabase/sql/005_workout_runs_policies.sql`
- `supabase/sql/006_functions_add_workout_result.sql`
- `supabase/sql/007_verification.sql`
- `supabase/sql/008_workout_runs_tags.sql`
  - `workout_runs` に `category` / `muscles` 列を追加、索引作成、既存 result から可能な範囲で埋め戻し
- `supabase/sql/009_functions_add_workout_result_tags.sql`
  - `add_workout_result` をタグ引数対応に更新（default 引数で互換維持）

- `supabase/sql/phase5_body_metrics.sql`
  - Phase5 の `body_metrics` テーブル作成（PK: `(user_id, date)`）と RLS（owner のみ select/insert/update/delete）

- `supabase/sql/009_timeline_scope_alignment.sql`
  - `get_timeline` をスコープ仕様に合わせて更新
    - `global`: 非フォロー相手の `public` のみ（自分除外）
    - `following`: フォロー相手の `public/private` + 自分の投稿（`archived` 除外）
  - タイムライン/いいね取得に必要な索引を `if not exists` で補強
  - SQL Editor で実行できる検証クエリを同梱

### 新規 migrations
- `supabase/migrations/20260305_0001_phase0_3_foundation.sql`
  - `profiles` へ身体設定/モード/`total_calories` 追加
  - `workout_runs` へ `calories` / `visibility` / `published_at` / `note` 追加
  - `follows`, `weekly_plans`, `special_plans` 作成
  - `add_workout_result` を calories 対応に更新（points互換維持）
  - RLS雛形ポリシー追加

## 備考
- 互換性確保のため `points` 列は削除せず維持しています。
- CHECK 制約は一部 `NOT VALID` で追加し、既存データを壊さない形で段階導入しています。


## タイムライン仕様変更の適用・検証

1. SQL Editor で `supabase/sql/009_timeline_scope_alignment.sql` を実行
2. 検証（viewer UUID を差し替え）
   - `select set_config('request.jwt.claim.sub', '<viewer-uuid>', true);`
   - `select visibility, count(*) from public.get_timeline('global', 200, null) group by 1 order by 1;`
   - `select visibility, count(*) from public.get_timeline('following', 200, null) group by 1 order by 1;`
3. 必要に応じて対象 viewer のフォロー関係ごとに、`global` にフォロー中ユーザー投稿が含まれないこと / `following` に非フォロー `public` が含まれないことを確認


## 009_timeline_scope_alignment.sql の適用手順（運用）

### Supabase SQL Editor で適用（推奨）
1. Supabase Dashboard → SQL Editor を開く
2. `supabase/sql/009_timeline_scope_alignment.sql` の内容を貼り付けて実行
3. この SQL は `CREATE OR REPLACE FUNCTION public.get_timeline(...)` により、**既存関数を置換**します（テーブル再作成は不要）

### Supabase CLI を使うローカル開発での適用例
- SQLファイルを直接流す場合（例）
  - `supabase db remote psql < supabase/sql/009_timeline_scope_alignment.sql`
- もしくは migration 化して `supabase db push` で適用

## 009 適用後のコピペ検証SQL

```sql
select set_config('request.jwt.claim.sub', '<viewer>', true);
select * from public.get_timeline('global', 50, null);
select * from public.get_timeline('following', 50, null);
```

## Phase2: フォロー / フォローリクエスト適用手順

### 追加ファイル
- migration: `supabase/migrations/20260306_0006_phase2_follow_requests.sql`
- 手動SQL: `supabase/sql/013_phase2_follow_requests.sql`
- 検証SQL: `supabase/sql/014_phase2_follow_requests_verification.sql`

### 実行順
1. `supabase db push`（migration適用）
2. 既存環境へ手動反映したい場合は SQL Editor で `013_phase2_follow_requests.sql` を実行
3. `014_phase2_follow_requests_verification.sql` で制約/ポリシー/関数を確認

### 含まれるDB変更
- `profiles` に `account_visibility` / `icon_border` / `icon_background` / `icon_center_object` を追加
- `follows` の自己フォロー禁止制約を補強
- `follow_requests` テーブル追加（`pending` / `accepted` / `rejected` / `cancelled`）
- RLS再設計
  - profiles: 本人 or public or 承認済みフォロワー
  - follows: 本人と、閲覧許可された対象アカウントの一覧取得
  - follow_requests: 送受信者のみ閲覧、送信者のみ作成、送受信者ごとの更新制御
- RPC追加
  - `follow_action`（public は即follow / private はrequest）
  - `get_follow_state`
  - `get_follow_requests`
  - `cancel_follow_request`
  - `respond_follow_request`

### テスト観点
- public アカウントへの follow_action が即フォロー成立する
- private アカウントへの follow_action が pending request を作成する
- target 側の respond_follow_request(approve) で follows へ反映される
- respond_follow_request(reject) でフォロー不成立のまま request 状態が更新される
- requester 側の cancel_follow_request が pending request を取り下げる
- unfollow（`follows` delete）が成立する
- private アカウントは UI で表示名末尾に `🔒` を付与する

## Phase4: アイコン設定列・制約

### 追加ファイル
- migration: `supabase/migrations/20260306_0007_phase4_icon_settings.sql`
- 手動SQL: `supabase/sql/015_phase4_icon_settings.sql`

### 実行順（既存環境）
1. `013_phase2_follow_requests.sql`
2. `015_phase4_icon_settings.sql`
3. `014_phase2_follow_requests_verification.sql`（follow系確認）
4. 必要なら下記追加確認
   - `select icon_border, icon_background, icon_center_object from public.profiles limit 5;`
   - `select conname from pg_constraint where conname like 'profiles_icon_%';`

### 仕様
- `profiles.icon_border`: `ring-slate|ring-emerald|ring-amber|ring-rose`
- `profiles.icon_background`: `bg-night|bg-ocean|bg-sunset|bg-forest`
- `profiles.icon_center_object`: `dot|diamond|barbell|bolt`
- デフォルト値を設定し、既存データは `coalesce` で埋め戻し


## Phase1: ランキング / 検索 / フォロー一覧 取得の修正

### 追加ファイル
- migration: `supabase/migrations/20260306_0008_phase1_ranking_follow_queries.sql`
- 手動SQL: `supabase/sql/016_phase1_ranking_follow_queries.sql`

### 実行順
1. `supabase db push`
2. 既存環境への差分反映は SQL Editor で `016_phase1_ranking_follow_queries.sql` を実行

### 含まれるDB変更
- RPC追加
  - `get_leaderboard(p_period, p_limit)`
  - `search_accounts(p_query, p_limit)`
  - `get_following_accounts(p_user_id)`
  - `get_follower_accounts(p_user_id)`
- インデックス補強
  - `workout_runs(visibility, published_at desc, user_id)`
  - `workout_runs(user_id, created_at desc)`
  - `follows(follower_id, followee_id)`
  - `follows(followee_id, follower_id)`

### テスト観点
- ranking が `public / self / following-private` のみを返す
- search_accounts が表示名・公開範囲・アイコン構成を返す
- following/followers がプロフィール情報付きで取得できる


## Phase3: body_metrics の空レコード禁止

### 追加ファイル
- migration: `supabase/migrations/20260306_0009_phase3_body_metrics_non_empty.sql`
- 手動SQL: `supabase/sql/017_phase3_body_metrics_non_empty.sql`

### 仕様
- `weight_kg` か `body_fat_pct` のどちらかは必須（両方 null は不可）。
- 制約名: `body_metrics_not_both_null`
- `(user_id, date)` 主キーの upsert モデルは維持。


## Phase4: メニュー設定UI接続（DB追加なし）

- `weekly_plans` / `special_plans` は既存 foundation migration で作成済みのため、今回の UI 接続で新規 SQL は不要です。
- 未適用環境ではまず `supabase/migrations/20260305_0001_phase0_3_foundation.sql` を含む migration を適用してください。

## 最終統合: 推奨 migration 適用順（Phase 1-6）

CLI (`supabase db push`) を使う場合はタイムスタンプ順で自動適用されます。手動で順序確認する場合は以下を基準にしてください。

1. `supabase/migrations/20260305_0001_phase0_3_foundation.sql`
2. `supabase/migrations/20260306_0006_phase2_follow_requests.sql`
3. `supabase/migrations/20260306_0007_phase4_icon_settings.sql`
4. `supabase/migrations/20260306_0008_phase1_ranking_follow_queries.sql`
5. `supabase/migrations/20260306_0009_phase3_body_metrics_non_empty.sql`

### 手動 SQL（既存環境へ差分反映）の順序
1. `supabase/sql/013_phase2_follow_requests.sql`
2. `supabase/sql/015_phase4_icon_settings.sql`
3. `supabase/sql/016_phase1_ranking_follow_queries.sql`
4. `supabase/sql/017_phase3_body_metrics_non_empty.sql`
5. 必要に応じて `supabase/sql/014_phase2_follow_requests_verification.sql`

### 注意
- SQL は README 記載だけでなく、必ず `supabase/sql/*.sql` 実ファイルを正とすること。
- 既存データ保護のため、制約追加時は既存値を確認してから適用すること。


## 018_phase6_timeline_notifications.sql
- migration: `supabase/migrations/20260307_0010_phase6_timeline_notifications.sql`
- 手動SQL: `supabase/sql/018_phase6_timeline_notifications.sql`

### 目的
- `get_timeline` の主要取得と、いいね件数/既読状態取得を分離してRLS失敗時の影響を局所化
- 通知フィード取得用に `get_notifications(p_limit, p_before)` を追加

### 追加関数
- `get_timeline_like_summaries(p_run_ids bigint[])`
- `get_notifications(p_limit int, p_before timestamptz)`

### 適用後確認クエリ（例）
```sql
select * from public.get_timeline_like_summaries(array[1,2,3]);
select * from public.get_notifications(30, null);
```


## 019_notifications_table.sql
- migration: `supabase/migrations/20260307_0011_notifications_table.sql`
- 手動SQL: `supabase/sql/019_notifications_table.sql`

### 追加内容
- `notifications` テーブル（受信者本人のみ参照できるRLS）
- 通知生成トリガー
  - `workout_run_likes` insert -> like 通知
  - `follows` insert -> follow 通知
  - `follow_requests` pending insert/update -> follow_request 通知
- RPC
  - `get_unread_notification_count()`
  - `get_notifications(p_limit, p_before)`
  - `mark_all_notifications_read()`

## 020_fix_follow_search_and_like_toggle.sql
- migration: `supabase/migrations/20260307_0012_fix_follow_search_and_like_toggle.sql`
- 手動SQL: `supabase/sql/020_fix_follow_search_and_like_toggle.sql`

### 前提
- `018_phase6_timeline_notifications.sql` と `019_notifications_table.sql` 適用済みであること。
- 本SQLはそれらの上に積む idempotent 修正。

### 含まれる変更
- `search_accounts(text, int)` を再定義
  - exact UUID 一致を最優先
  - display_name 完全一致 / 前方一致 / 部分一致
  - `auth.uid() is not null` 条件
  - 自分自身除外
  - `security definer`, `set search_path = public`, `grant execute`
- `toggle_like(bigint)` を再定義
  - 引数名 `p_run_id`
  - archived / unreadable run 拒否
  - return: `run_id`, `liked`, `like_count`
  - `security invoker`, `set search_path = public`, `grant execute`
- `workout_run_likes` の select/insert/delete policy を再定義
- `notify_like_insert` 関数と `trg_notify_like_insert` を idempotent 再作成

### 適用順
1. migration方式: `supabase db push`
2. 手動方式:
   1. `supabase/sql/018_phase6_timeline_notifications.sql`
   2. `supabase/sql/019_notifications_table.sql`
   3. `supabase/sql/020_fix_follow_search_and_like_toggle.sql`

### 確認クエリ
```sql
-- search_accounts
select proname, oidvectortypes(proargtypes) from pg_proc where proname = 'search_accounts';
select * from public.search_accounts('<UUID>', 20);
select * from public.search_accounts('display_name_keyword', 20);

-- toggle_like
select proname, oidvectortypes(proargtypes) from pg_proc where proname = 'toggle_like';
select * from public.toggle_like(<run_id_bigint>);

-- workout_run_likes policies
select policyname, permissive, roles, cmd
from pg_policies
where schemaname='public' and tablename='workout_run_likes'
order by policyname;

-- like通知トリガー
select tgname
from pg_trigger
where tgrelid='public.workout_run_likes'::regclass and not tgisinternal;
```
