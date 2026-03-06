# workout-entry-template の読み方

`workout-entry-template.json` は、現在の実装で扱うワークアウト記録 1 件のテンプレートです。

## 必須項目
- `id` (string): 記録 ID。local は保存時に自動採番。
- `user_id` (string): 記録の所有ユーザー ID。
- `visibility` (`public` | `private` | `archived`): 公開範囲。

## 実施情報
- `questId` (string | null): ワークアウト定義 ID。
- `exerciseSlug` (string | null): 種目スラッグ。
- `difficulty` (string | null): 難易度キー（`beginner/intermediate/advanced`）。
- `mode` (string | null): タイマー種別（例: `interval`）。
- `sets` (array | null): セット詳細。

## 時刻系
- `startTime` / `endTime` (number | null): 実施時刻（Unix ms）。
- `timestamp` (number): 履歴表示の基準時刻（local では保存時採番）。
- `published_at` (string | null): 投稿時刻（ISO8601）。`archived` では `null`。

## サマリ・タグ
- `calories` (number): 消費カロリー。
- `points` (number): 互換のため保持。
- `breakdown` (array | null): 種目別内訳。
- `category` (string): 種目カテゴリ。
- `muscles` (string[]): 対象部位タグ。

## 投稿補助
- `note` (string | null): 投稿メモ。
- `result` (object): 実行時の元データ。表示・タグ算出の元になります。

## local と Supabase の差分
- local: `timestamp` が主。
- Supabase: `created_at` 列が主（読み込み時に `timestamp` へマップ）。
- UI 表示時は adapter で正規化されるため、画面側は共通形を扱います。
