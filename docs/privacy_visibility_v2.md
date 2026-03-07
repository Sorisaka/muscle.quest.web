# Privacy Visibility v2（アカウント既定 + 投稿上書き）

## 現状（変更前）
- `workout_runs.visibility` を投稿時に直接指定して保存していた。
- 既定の公開範囲を `profiles` 側に持っていなかった。
- UI は投稿単位の公開範囲選択が中心だった。

## 変更後
- `profiles.default_visibility` を導入。
  - 値: `private | followers | public`
  - 設定画面から更新可能。
- 投稿時は `visibilityOverride` を受け取り、次のルールで実効公開範囲を決定:
  - override 指定あり → override 優先
  - override 未指定(null/undefined) → `profiles.default_visibility` を使用

## 採用方式
- **方式B（投稿時に実効visibilityを決定して保存）** を採用。
- `workout_runs.visibility` は non-null のまま維持し、保存時に `resolveVisibility(profileDefault, override)` で解決して書き込む。
- 理由: 既存RLS/クエリ互換を壊さず、ローカル/ Supabase の挙動一致を保ちやすいため。

## 投稿UIの動作
- メインボタン: **投稿**（override なし = 既定公開範囲）
- サブ操作:
  - 全体公開で投稿（override=`public`）
  - フォロワーのみで投稿（override=`followers`）
  - 非公開で投稿（override=`private`）

## DB整合
- 追加 migration: `supabase/migrations/20260305_0002_default_visibility.sql`
  - `profiles.default_visibility` 追加 + check制約
  - `add_workout_result` RPC を `p_visibility` 対応に更新

## 既存データ互換
- 既存 `profiles` は `default_visibility='private'` をバックフィル。
- 既存 `workout_runs` は従来通り `visibility` を保持し、表示/取得時に破綻しない。
