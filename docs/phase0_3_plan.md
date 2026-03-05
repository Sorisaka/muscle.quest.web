# Phase0〜3 実装計画（Prompt 0: 事前調査）

## 現状の真実（as-is）

### 1) 永続化抽象の現状
- `src/data/persistence.js` は `createPersistence(driver)` で `createStorageAdapter(driver, options)` を返す薄いファクトリ。
- 実際のI/F保証は `src/services/storage/StorageAdapter.js` の `REQUIRED_METHODS`（`loadProfile/saveProfile/recordResult/updateDisplayName/loadLeaderboard/loadHistory/saveLastPlan/getLastPlan`）で行われる。
- `local` は `createLocalPersistence()`、`supabase` は `createSupabaseAdapter(options)` が割り当てられている。
- `supabaseAdapter` は同I/Fを満たしつつ、未ログイン/失敗時はローカルへフォールバックする設計（`persistResultLocally`）。

### 2) `store.recordResult()` の保存payload現状
- `runView` からは `questId/difficulty/mode/trainingSeconds/restSeconds/sets/completedSets/elapsedSeconds/finished/exerciseSlug/startTime/endTime/plan` を渡している。
- `store.recordResult()` で `calculatePoints(result)` により `points` と `breakdown` を付与した `enriched` を永続化へ渡す。
- local保存（`localPersistence.recordResult`）では `timestamp = Date.now()` を別途採番し、historyに `startTime/endTime/timestamp/points` を保存、`profile.lastResult.recordedAt` も付与。
- supabase保存（`supabaseAdapter.recordResult`）では payload に `timestamp: result.endTime || Date.now()` を付与してRPC/insertへ渡し、DBの `created_at` を history表示時の `timestamp` として再マップしている。

### 3) Supabase側スキーマ/RPCの現状
- `profiles` は `display_name` に加えて `points/completed_runs/last_result/updated_at` を持つ。
- `workout_runs` は `id/user_id/created_at/result/points` を持つ（`points`は列として存在）。
- RPC `public.add_workout_result(p_points integer, p_result jsonb)` が存在し、`workout_runs` へのinsert + `profiles.points/completed_runs/last_result` 更新を同時実行する。
- Adapter側はRPC失敗時に `workout_runs` insert + `profiles` update のフォールバック実装あり。

### 4) UIルーティング・主要ビューの現状
- Hash Routerで主要ルートは `#/`, `#/settings`, `#/quests/:tier`, `#/quest/:id`, `#/run/:id`, `#/rank/:board`, `#/rank`, `#/account`。
- 実行画面は `runView`、ランキングは `rankView`、アカウント概要は `accountView`。
- 文言・集計・表示の多くが現時点で `points` 前提（ラン画面の獲得ポイント表示、Rank説明など）。

---

## 命名・互換方針（固定）

points廃止までの移行で、フロント/永続化の参照名を以下で固定する。

- 最終的な主指標: `calories`
- 互換期間の併存: `points` は「旧互換値」として残置可（読み取り/バックフィル用途）
- workout result payload（アプリ内）:
  - 維持: `startTime`, `endTime`, `timestamp`, `sets`, `mode`, `difficulty`, `questId`
  - 追加: `calories`, `calorieBreakdown`（名称固定）
  - 段階廃止: `points`, `breakdown`
- profile集計:
  - 追加: `total_calories`（名称固定）
  - 互換維持: `points` は移行完了まで更新継続してもよい

## Phase実装計画（差分最小）

### Phase0: 「履歴＝投稿」の土台
1. `supabase/migrations/` を新設し、`workout_runs` に `visibility`, `published_at`, `note` を追加するSQLを作成。
2. local persistenceのhistory entryにも同キーを追加（未設定時デフォルト付与）。
3. `recordResult` のpayloadに投稿系フィールドを通せるようにし、既存呼び出しを壊さず後方互換で適用。

### Phase1: points → calories 置換
1. `core/points.js` 相当を段階置換し、METs式ベースの `calories` 計算へ移行（points計算は互換レイヤとして残置）。
2. `store.getPointSummary()` は内部を calories集計へ寄せつつ、呼び出し側の破壊を避けるため段階的にI/F整理。
3. UI文言（run/rank/account）を calories表示へ変更し、points表記を順次削除。
4. Supabaseは `profiles.total_calories`, `workout_runs.calories` を追加しバックフィルSQLを作成。

### Phase2: 週間メニュー（曜日+特別日）
1. 共通I/Fとして `weekly_menu` 構造（曜日キー + `specialDates`）を定義。
2. local driverに保存/取得を追加。
3. supabase driverにも同I/Fを追加（同期先テーブルは migration SQL で作成）。
4. UIはまずTODO表示で導線追加し、既存run導線を壊さずに接続。

### Phase3: 公開範囲 + フォロー
1. `follows` テーブル追加SQL（`follower_id`, `followee_id`, unique制約）。
2. 閲覧可能範囲I/Fを `visibility` 前提で追加（自分/公開/フォロー限定）。
   - v2方針: `profiles.default_visibility` + 投稿 `visibilityOverride` で実効公開範囲を決定。
3. supabase adapterに follow/unfollow・可視履歴取得メソッドを追加（`getFollowing/getFollowers/listVisibleWorkouts`）。
4. local driverは同名I/Fで擬似実装し、UI検証を可能にする。
5. visibility/published_at の運用ルールを `docs/privacy_and_follow.md` に固定する。

## 実装ルール（この計画以降）
- DB変更は必ず `supabase/migrations/*.sql` へ追加する（チャットのみ記述はしない）。
- 破壊的変更は禁止。既存列は即時削除せず、追加→バックフィル→参照切替→最終整理の順で進める。
- フィールド名は本計画で固定した名称を使い、途中で再命名しない。
