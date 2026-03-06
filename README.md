# muscle.quest.web

GitHub Pages 配信用の Vanilla JS/HTML/CSS アプリです。

## 表示言語
- UI 表示言語は **日本語固定** です。
- 既存データに `settings.language = "en"` が残っていても、アプリ表示は日本語で動作します。

---

## Phase B: ワークアウト CRUD（追加・編集・削除）整備

### 1. 概要
本 Phase では「ワークアウト記録（実行結果）」の CRUD 導線を、実装とドキュメントを一致させて整理しました。

- **追加**: 従来どおり `#/run/:id` から投稿可能
- **編集**: `#/history` / `#/history/:date` で投稿設定（公開範囲・メモ）を更新可能
- **削除**: `#/history` / `#/history/:date` で記録削除可能

### 2. 実際の操作導線
- 追加:
  - `#/` → `#/workouts/:tier` → `#/workout/:id` → `#/run/:id`
  - 完了後に「投稿」から公開範囲を選択して保存
- 編集:
  - `#/history` または `#/history/:date`
  - 日別一覧の「投稿設定を編集」
- 削除:
  - `#/history` または `#/history/:date`
  - 日別一覧の「この記録を削除」

### 3. local 保存と Supabase 保存の違い
- local:
  - `localStorage` ベース (`src/data/adapters/localPersistence.js`)
  - `timestamp` を基準に履歴管理
- Supabase:
  - `workout_runs` テーブルベース (`src/services/supabase/supabaseAdapter.js`)
  - `created_at` / `published_at` を使用
- 共通:
  - Supabase 失敗時は local fallback で破綻を防止

### 4. 主要ファイル一覧
- 追加導線: `src/views/runView.js`
- 編集/削除導線: `src/views/historyView.js`
- アプリ層: `src/core/store.js`
- local adapter: `src/data/adapters/localPersistence.js`
- Supabase adapter: `src/services/supabase/supabaseAdapter.js`
- adapter interface: `src/services/storage/StorageAdapter.js`

### 5. docs / templates 一覧
- `docs/workout-crud-guide.md`
- `docs/templates/workout-entry-template.json`
- `docs/templates/workout-entry-template.md`
- `docs/templates/workout-update-checklist.md`
- `docs/templates/workout-delete-checklist.md`

### 6. SQL の適用要否
- **SQL追加なし**
- 理由: `workout_runs` の update/delete policy は既存 SQL に定義済みで、今回不足していたのはクライアント導線（UI + adapter 実装）だったため

---

## ローカルデバッグ手順
1. 依存インストール
   - `npm ci`
2. ランタイム設定ファイル作成
   - `cp src/config.example.js dist/config.js`
3. 必要に応じて `dist/config.js` を編集
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OAUTH_REDIRECT_TO`（必要時）
4. 開発サーバー起動
   - `npm run dev`
5. CRUD 確認観点
   - 追加: `#/run/:id` から投稿して `#/history` に反映される
   - 編集: `#/history/:date` で公開範囲/メモ更新が反映される
   - 削除: `#/history/:date` で記録削除後に一覧から消える
   - Supabase 利用時: 失敗時 fallback でも画面崩れしない

## 本番相当確認手順
1. `npm run build`
2. `npm run preview`
3. `http://localhost:4174` で主要導線（ホーム/実行/履歴/設定）を確認

## デプロイ手順
1. `npm ci`
2. `npm run build`
3. Supabase 変更が必要な Phase のみ `supabase db push`（本 Phase は不要）
4. GitHub Pages 用に `dist/` を配信
5. デプロイ後確認
   - `#/run/:id` 投稿
   - `#/history/:date` 編集/削除
   - ルーティング遷移

## 動作確認チェックリスト
- [ ] 追加できる
- [ ] 編集できる（公開範囲・メモ）
- [ ] 削除できる
- [ ] README / docs / 実装の説明が一致している
- [ ] SQL 追加が不要である理由が README と docs に記載されている

---

## 開発コマンド
- `npm i`
- `npm run dev`
- `npm run build`
- `npm run lint`
