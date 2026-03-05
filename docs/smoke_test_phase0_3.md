# Smoke Test: Phase0〜3

## 0. 事前準備
- `npm i`
- `npm run build`
- `npm run dev`

---

## 1. Local driver 確認

### 1-1. プロフィール/カロリー設定
1. `#/settings` を開く。
2. Simple タブで `height_cm/weight_kg/sex` を入力し保存。
3. Advanced タブで一部を `manual` にして `height_cm` を変更し、manual項目が維持されることを確認。

### 1-2. ワークアウト記録
1. `#/run/<questId>` でワークアウト実行。
2. `visibility` と `note` を指定して「完了して記録」。
3. `#/account` で総/日/週/月の消費カロリーが更新されることを確認。

### 1-3. 週間メニュー/特別日
1. `#/settings` で週間メニュー（曜日）を登録。
2. 特別日メニューを当日に登録。
3. `#/` で「今日のTODO」に特別日が優先表示されることを確認。
4. TODO のチェック状態が当日中維持されることを確認。

### 1-4. フォロー/公開範囲
1. `#/account` のフォロー欄で疑似IDをフォロー/解除。
2. 「投稿公開設定（最近の履歴）」で `visibility/note` を保存。

---

## 2. Supabase driver 確認

### 2-1. DB適用
1. `supabase db push` で `supabase/migrations/*.sql` を適用。
2. テーブル/列確認:
   - `profiles.total_calories`
   - `workout_runs.calories/visibility/published_at/note`
   - `follows`, `weekly_plans`, `special_plans`

### 2-2. ログイン〜記録
1. アプリでログイン。
2. `#/settings` でプロフィール保存（身長/体重/性別/mode）。
3. ワークアウト記録で `visibility` と `note` を保存。
4. Supabase 上の `workout_runs` に値が反映されることを確認。

### 2-3. フォロー/可視取得I/F
1. `follows` に follow/unfollow が反映されることを確認。
2. `listVisibleWorkouts(viewerId,targetUserId)` で以下判定を確認:
   - private: 投稿者のみ
   - followers: 投稿者 + follower
   - public: 全員

---

## 3. 互換性確認
- 旧データ（`points` のみ・`calories` 欠損）が履歴にあっても画面が壊れない。
- calories 集計は `calories` 欠損時 `0` 扱いで継続表示される。
