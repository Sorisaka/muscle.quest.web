# Vendored Supabase クライアント互換レイヤー

## なぜ vendored supabase-js を使っているか
このリポジトリは軽量な Vanilla JS 構成を維持するため、`@supabase/supabase-js` の npm 配布版ではなく、`vendor/supabase-js` に同梱した最小実装を `file:` 依存で利用しています。

- `package.json` は `"@supabase/supabase-js": "file:vendor/supabase-js"` を参照
- 認証（PKCE / セッション永続化）と PostgREST の最小機能をアプリ用途に合わせて実装

## 今回追加した互換 API
`vendor/supabase-js/dist/index.js` の PostgREST クエリビルダーに、Supabase v2 風 API 互換として以下を追加しました。

- `upsert(values, { onConflict })`
  - `Prefer: resolution=merge-duplicates` を付与
  - `onConflict` を `on_conflict` クエリパラメータへ変換
  - 単体オブジェクト/配列のどちらも payload として許容
  - `.select(...).maybeSingle()` の後続チェーンに対応
- フィルタ拡張
  - `gte`, `lte`, `gt`, `lt`, `neq`, `in`
- 結果整合性
  - `single`, `maybeSingle` の挙動差分を明確化
  - `throwOnError` を追加
  - `insert` / `update` / `upsert` と `select` の Prefer ヘッダー合成を安全に実施

## 本家 supabase-js と完全互換ではない点
この vendored 実装はアプリで使う API に絞った「部分互換」です。

- PostgREST の全メソッドや高度なオプション（複雑なヘッダー制御・型支援など）は未実装
- エラーオブジェクト形式は本家と完全一致ではなく、`Error` ベースの簡易形
- クエリビルダーは必要機能優先のため、今後も実アプリで使う API を段階追加する方針

## 今後 API を増やすときの実装ルール
互換性崩れを防ぐため、以下のルールで vendor 側を拡張します。

1. **呼び出し側（adapter/store/UI）より先に vendor API を足す**
   - 既存呼び出しの書き換えで吸収せず、まずクライアント互換性を改善する。
2. **チェーン可能性を最優先**
   - `from().method().select().maybeSingle()` のような既存チェーンを壊さない。
3. **HTTP 仕様を明文化して実装**
   - `Prefer`、`on_conflict`、フィルタクエリなどを明示し、曖昧実装を避ける。
4. **最小検証コードを同時追加**
   - `scripts/verify-supabase-vendor-compat.mjs` のように URL/ヘッダー生成を検証する。
