# ワークアウト CRUD ガイド（Phase B）

このドキュメントは、`muscle.quest.web` におけるワークアウト記録（`workout_runs` / local history）の追加・編集・削除の実運用手順を、ユーザー操作と開発者向け仕様の両面で整理したものです。

## 1. 対象データと前提
- 対象は「ワークアウト定義（クエスト）」ではなく、**実行して保存されたワークアウト記録**です。
- 記録は `store.recordResult()` を入口に保存され、保存先はドライバーに応じて local または Supabase です。
- 表示言語は日本語固定です。

## 2. 追加（Create）
### UI からの操作方法
1. `#/`（ホーム）からカテゴリを選択
2. `#/workouts/:tier` → `#/workout/:id` を開く
3. `#/run/:id` でトレーニングを完了し「投稿」操作を実行
4. 公開範囲（公開/非公開/アーカイブ）を選ぶと記録が作成される

### 対応ルート
- `#/workout/:id`
- `#/run/:id`
- 作成結果の確認: `#/history` / `#/history/:date` / `#/timeline`

### 保存先（local / Supabase）
- local: `src/data/adapters/localPersistence.js` の `recordResult()` で履歴に追加。
- Supabase: `src/services/supabase/supabaseAdapter.js` の `recordResult()` で RPC `add_workout_result` または直接 insert。

### 失敗時の挙動
- Supabase 保存に失敗した場合、local へフォールバックして保存します。
- local 保存はブラウザストレージに依存するため、保存容量やブラウザ設定で失敗する場合があります。

### 注意点
- 追加時点では `id` / `timestamp` / `published_at` などが自動採番・自動設定されます。
- `visibility=archived` の場合、`published_at` は `null` になります。

## 3. 編集（Update）
### UI からの操作方法
1. `#/history` もしくは `#/history/:date` を開く
2. 日別トレーニング一覧の対象記録で「投稿設定を編集」を押す
3. ダイアログで公開範囲（`public/private/archived`）とメモを更新

### 対応ルート
- `#/history`
- `#/history/:date`

### 編集可能な項目（現行仕様）
- `visibility`
- `note`

> `sets` や `calories` などの運動結果そのものは、現行 UI では編集対象外です。

### 保存先（local / Supabase）
- local: `updateWorkoutPost(runId, updates)`
- Supabase: `workout_runs` の対象行を update（`id` + `user_id` 条件）

### 失敗時の挙動
- Supabase 更新失敗時は local 側更新へフォールバックします。

### 注意点
- `visibility` を `archived` に変更した場合、タイムラインから非表示扱いになります。
- UI では入力ガードとして `public/private/archived` 以外を拒否します。

## 4. 削除（Delete）
### UI からの操作方法
1. `#/history` もしくは `#/history/:date` を開く
2. 日別トレーニング一覧の対象記録で「この記録を削除」を押す
3. 確認ダイアログで確定

### 対応ルート
- `#/history`
- `#/history/:date`

### 保存先（local / Supabase）
- local: `deleteWorkoutPost(runId)`
- Supabase: `workout_runs` の対象行を delete（`id` + `user_id` 条件）

### 失敗時の挙動
- Supabase 削除失敗時は local 側削除へフォールバックします。

### 注意点
- 削除は元に戻せません。
- local では削除対象 run の like キャッシュも合わせて削除します。

## 5. データ構造（主要項目）
主に次の項目で管理します（詳細テンプレートは `docs/templates/` を参照）:
- 識別: `id`, `user_id`
- 実施情報: `questId`, `exerciseSlug`, `difficulty`, `mode`, `sets`
- 時刻: `startTime`, `endTime`, `timestamp`, `published_at`
- サマリ: `calories`, `points`, `breakdown`, `category`, `muscles`
- 投稿: `visibility`, `note`
- 生データ: `result`

## 6. local と Supabase の差分
- local は `timestamp` を主に使用し、履歴 JSON を直接更新します。
- Supabase は `created_at` / `published_at` と `workout_runs` 行更新で扱います。
- アプリ内では `mapHistoryRow()` で共通形に正規化して UI に渡します。

## 7. SQL の適用要否
- **Phase B では SQL 追加不要**です。
- 理由: `workout_runs` に対する update/delete の RLS policy は既存 SQL に定義済みで、今回不足していたのはクライアント側 CRUD 導線（UI + adapter 実装）のみだったためです。

## 8. 参照ファイル（実装）
- `src/views/runView.js`（追加導線）
- `src/views/historyView.js`（編集/削除導線）
- `src/core/store.js`（CRUD 呼び出し集約）
- `src/data/adapters/localPersistence.js`（local CRUD）
- `src/services/supabase/supabaseAdapter.js`（Supabase CRUD + fallback）
- `src/services/storage/StorageAdapter.js`（adapter 必須メソッド定義）
