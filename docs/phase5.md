# Phase5 仕様メモ

## 概要
Phase5 では「体重/体脂肪ログ」と「日付単位のトレーニング履歴表示」を追加する。
`local` / `supabase` のどちらでも同じ UI 体験になることを前提とする。

## body_metrics 仕様
- テーブル: `public.body_metrics`
- 主要カラム
  - `user_id` (uuid)
  - `date` (date, `YYYY-MM-DD`)
  - `weight_kg` (numeric, null 可)
  - `body_fat_pct` (numeric, null 可)
  - `visibility` (text: `private|followers|public`)
- 主キー
  - `(user_id, date)`
- 運用
  - 同日データは `upsert` で更新
  - 削除は日付単位

## 日付判定ルール（workout の所属日）
トレーニング日付はローカルタイムで `YYYY-MM-DD` に丸める。
判定対象カラムは以下の優先順:
1. `timestamp`
2. `result.timestamp`
3. `endTime` / `result.endTime`
4. `created_at`
5. `published_at`

## local / supabase の整合性
- 両アダプタで同一 I/F を実装
  - `upsertBodyMetric(date, metric)`
  - `deleteBodyMetric(date)`
  - `getBodyMetricsRange(from, to)`
  - `getWorkoutsByDate(date)`
  - `listWorkoutDatesInMonth(year, month)`
- store は現在ユーザーIDを内部解決し、ビューは userId を意識せず呼び出せる。
- 取得結果の差異を最小化するため、最終的な日付判定はクライアント側で同じ `toDateKey` を使う。
