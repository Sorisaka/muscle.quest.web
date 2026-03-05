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
