# Phase6 作業メモ

## Step0 現状調査
- trainingDefinitions の既存 slug は `squats`, `push-ups`, `lunges`, `plank`, `mountain-climbers` の5件。
- 履歴表示UIは `src/views/historyView.js`（カレンダー + 日別詳細）、加えて投稿履歴表示に `src/views/timelineView.js` が存在。
- Supabase 保存経路は `src/services/supabase/supabaseAdapter.js` の `recordResult -> addResultWithFallback -> rpc('add_workout_result')`、フォールバックで `workout_runs` へ直接 insert。
- SQL 側は `supabase/sql/004_workout_runs.sql` が基礎テーブル（初期 points/result）、`supabase/sql/006_functions_add_workout_result.sql` は旧シグネチャ。現行 JS は `p_calories/p_visibility` も渡しており、migrations 側で更新済み想定のため SQL 009 でタグ含め再整合。
- points/calories は現行で併存（互換維持）。Phase6 では命名統一の破壊変更は行わず、タグ追加に集中。

## 実装概要
- taxonomy モジュール追加（category/muscles 正規化、slug からタグ解決、result 装飾）。
- trainingDefinitions に category/muscles を追加。
- 保存前に result をタグ装飾して local/supabase 両方に category/muscles を保持。
- 履歴カレンダー/日別詳細とタイムラインにカテゴリ + 部位フィルタを追加。
- Supabase SQL と adapter をタグカラム/引数対応。

## 簡易手動テスト手順
1. ローカル（未ログイン）で任意種目を投稿し、履歴カレンダーで「種類/部位」で絞り込めることを確認。
2. 履歴日別詳細で各行に `種類/部位` が表示されることを確認。
3. タイムラインで同様にフィルタが効くことを確認。
4. Supabase 利用時に `workout_runs.category/muscles` に保存されることを確認。
5. 旧データ（タグ無し）でも表示が落ちず `未分類` 扱いになることを確認。
