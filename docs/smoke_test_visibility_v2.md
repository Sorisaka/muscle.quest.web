# Smoke Test: Visibility v2

## 前提
- `npm run build`
- `npm run dev`

## 1) default_visibility=private で既定投稿
1. 設定画面で既定公開範囲を `private` に保存。
2. ワークアウト完了後にメイン「投稿」を押す。
3. 保存された投稿が `private` になることを確認。

## 2) privateアカウントでも全体公開上書き
1. 既定は `private` のまま。
2. ワークアウト完了後に「全体公開で投稿」を押す。
3. 投稿が `public` になることを確認。

## 3) public既定でもフォロワーのみ上書き
1. 設定画面で既定公開範囲を `public` に保存。
2. ワークアウト完了後に「フォロワーのみで投稿」を押す。
3. 投稿が `followers` になることを確認。

## 4) local / supabase 両方確認
- local driver: ログインなしで同手順を実施し、履歴編集で値を確認。
- supabase driver: ログイン状態で同手順を実施し、`workout_runs.visibility` を確認。
