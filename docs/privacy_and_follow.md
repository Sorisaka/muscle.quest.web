# Privacy / Visibility / Follow 運用メモ（Phase3）

## workout_runs の公開範囲
- `visibility`:
  - `private`: 自分のみ閲覧可
  - `followers`: 自分 + フォロワーのみ閲覧可
  - `public`: 全員閲覧可
- `published_at`:
  - `private` の場合は `null`
  - `followers/public` の場合は公開時刻を保持
- `note`:
  - 投稿に紐づく任意のテキストメモ

## 公開時刻の運用
- 記録作成時に `visibility` が `followers/public` なら `published_at` を自動設定する。
- 後から公開範囲を更新した場合も `followers/public` なら `published_at` がなければ補完する。
- `private` に戻した場合は `published_at` を `null` に戻す。

## follows の定義
- `follows(follower_id, followee_id)` は「follower が followee を購読している」ことを表す。
- `followers` 公開の閲覧判定では、viewer が target を follow している場合に閲覧可とする。

## Phase4 向け I/F
- `getFollowing(userId)`
- `getFollowers(userId)`
- `listVisibleWorkouts(viewerId, targetUserId)`

これらを使って、タイムライン実装時に可視投稿のみを合成する。
