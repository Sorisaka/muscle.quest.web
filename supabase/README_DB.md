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
