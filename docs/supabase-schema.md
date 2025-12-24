# Supabase スキーマ案（スタブ段階）

現状はローカルストレージのみで動作しており、Supabase 通信は行いません。GitHub Pages では秘匿情報を隠せないため、`src/config/runtime.example.js` で公開してよい値だけを扱い、`src/config/runtime.js` は `.gitignore` で除外します。

## テーブル設計案

### users / profile
- `id` (uuid, PK)
- `display_name` (text)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)
- 備考: 現段階の UI では「未ログイン（ローカルユーザ）」をプレースホルダ表示のみ。

### workout_history
- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id)
- `quest_id` (text)
- `exercise_slug` (text)
- `difficulty` (text)
- `mode` (text) — timer / interval / stopwatch など
- `points` (int)
- `sets` (jsonb) — `{ weight, reps, timeSeconds }` の配列
- `start_time` (timestamp)
- `end_time` (timestamp)
- `recorded_at` (timestamp, default now())
- 備考: ローカルで保存しているフィールドと 1:1 でマッピングできる形。

## ランキング集計
- 日次/週次/月次は `recorded_at` を基準に期間フィルタして SUM(points) を計算。
- ストリークは `recorded_at` の日付単位で連続日数を算出。
- 将来 Supabase RPC や materialized view で計算するが、現状はローカル計算のみ。

## 共有・公開プロフィール案
- 公開プロフィール URL を `users` の `id` をキーに `/u/{id}` のように発行。
- トレーニング履歴の共有リンクは、サーバ側で署名した一時トークンか公開フラグを持つ `workout_history` レコードを参照する想定。
- GitHub Pages でのデモではダミー値のみ露出し、実アカウントや秘密鍵は含めない。

## 秘匿情報の扱い
- `supabaseUrl` と `supabaseAnonKey` は実運用環境でのみ埋め込み、リポジトリには含めない。
- デバッグ用の値は `src/config/runtime.js` を各自で作成して供給する。例として `src/config/runtime.example.js` を同梱。
