# Supabase client `from`/`rpc` 呼び出し失敗の原因整理

## 症状
- `recordCompletion` から Supabase 永続化を呼ぶと、`client.from is not a function` で落ちる。

## 原因
- `supabaseAdapter` は `client.from('workout_runs')` / `client.from('profiles')` / `client.rpc('add_workout_result')` を前提にしているが、実際の Supabase クライアントにはそれらが存在しない。
  - 履歴取得やプロフィール取得・更新、RPC 呼び出しで `from`/`rpc` が必須。例えば履歴では `client.from('workout_runs').select(...).order(...).limit(...)` を実行している。【F:src/services/supabase/supabaseAdapter.js†L74-L175】
- `getSupabaseClient` は `vendor/supabase-js/dist/index.js` の `createClient` をそのまま返す構造になっている。【F:src/lib/supabaseClient.js†L1-L89】
- `vendor/supabase-js/dist/index.js` の `createClient` は認証用の `auth` オブジェクトしか持たない `{ supabaseUrl, supabaseKey, auth }` を返しており、DB 用の `from` や RPC 用の `rpc` 実装がない。これが `client.from` 未定義の直接原因。【F:vendor/supabase-js/dist/index.js†L420-L423】

## 修正方針案
1. **A: 既存 vendor スタブ拡張**
   - `createClient` に `from`/`rpc` を実装し、`workout_runs` / `profiles` テーブルおよび `add_workout_result` RPC を最低限扱えるようにする。
   - 既存の auth 実装やビルド構成を変えずに済み、読み込みリクエスト数も増やさない。
2. **B: vendor を正式版 supabase-js 相当で置換**
   - npm 版 supabase-js を取り込み、ビルドに同梱するか CDN から読み込む。
   - 実装量は少ないが、バンドルサイズやローディング経路が変わり、現行の vendor 依存・ビルドスクリプトを見直す必要がある。

## 推奨
- プロジェクトが Vanilla/読み込み回数最小/現行 build スクリプトを前提としていることを踏まえると、**A: 既存 vendor スタブ拡張**が安全。auth 実装や依存構成を維持したまま DB 呼び出しを補完でき、他の部分への影響を最小限に抑えられる。
