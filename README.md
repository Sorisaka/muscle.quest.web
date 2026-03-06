# muscle.quest.web

GitHub Pages 向けの Vanilla JS / HTML / CSS アプリです。表示言語は **日本語固定** です。

## 公開URL
- GitHub Pages（Actions 配信）: `https://<your-github-username>.github.io/muscle.quest.web/`

---

## Phase A（完了）: 表示言語を日本語固定
- 設定画面の「言語」切替は廃止済みです。
- 既存の `settings.language = "en"` を読み込んだ場合でも、アプリ内では `ja` に正規化して表示します。
- SQL 追加はありません。

---

## Phase B: トレーニング種目マスタ管理

### 1. 概要
本プロジェクトにおける「ワークアウトの追加・編集・削除」は、
**一般ユーザーの運動記録CRUDではなく、運営・開発者が管理する種目マスタ編集** を指します。

### 2. 種目データの保存場所（現行構造）
- 種目マスタ本体（単一ソース）: `src/data/workoutMaster.js`
- 既存互換エクスポート: `src/data/trainingDefinitions.js`
- クエスト定義（画面に出す導線）: `src/data/quests.json`
- 種目説明ページ: `src/content/exercises/*.html`
- タグ利用箇所: `src/core/exerciseTaxonomy.js`

### 3. 方針（A: コード/JSONベース管理）
Phase B では Supabase テーブル化ではなく、**コード管理（Gitレビュー前提）** を採用しています。

理由:
- 現行実装が静的データ読込中心で、種目マスタAPI/管理画面を持たないため。
- 最小変更で運営が安全に運用できる（PRレビュー、差分追跡、ロールバック容易）。

> Supabase は運動記録保存に利用し、種目マスタはデプロイで反映する方式です。

### 4. 種目追加・編集・削除の手順
#### 追加
1. `docs/templates/workout-master-entry-template.json` をコピーして内容を作成。
2. `src/data/workoutMaster.js` の `workoutMasterEntries` に追加。
3. `src/data/quests.json` に導線（`exercises`）を追加。
4. 必要に応じて `src/content/exercises/<slug>.html` を追加。

#### 編集
1. `id` は変更せず、対象エントリの属性を更新。
2. `category / muscles / unit / difficulties.*` の整合を確認。

#### 削除
- 推奨: `isActive: false`（無効化）
- 非推奨: 物理削除（既存記録との整合リスク）

### 5. 編集対象ファイル
- `src/data/workoutMaster.js`（必須）
- `src/data/quests.json`（必要時）
- `src/content/exercises/*.html`（必要時）
- 詳細手順: `docs/workout-master-management.md`
- テンプレート: `docs/templates/`

### 6. docs / templates
- `docs/workout-master-management.md`
- `docs/templates/workout-master-entry-template.json`
- `docs/templates/workout-master-entry-template.md`
- `docs/templates/workout-master-edit-checklist.md`
- `docs/templates/workout-master-delete-checklist.md`

### 7. Supabase を使う場合の適用手順
- Phase B の種目マスタ管理では **SQL追加なし**（migration/手動SQLともに不要）。
- Supabase を使っていても、種目マスタ変更は `src/` 更新→`npm run build`→Pages デプロイで反映します。

---

## ローカル開発手順（詳細）
1. 依存インストール
   ```bash
   npm ci
   ```
2. 設定ファイル作成
   ```bash
   cp src/config.example.js dist/config.js
   ```
3. `dist/config.js` を設定
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OAUTH_REDIRECT_TO`（必要時）
4. 開発サーバー起動
   ```bash
   npm run dev
   ```
5. 種目追加/編集/削除（無効化）後の確認
   - `#/` → `#/workouts/<tier>` で一覧反映
   - `#/quest/<id>` で説明反映
   - `#/run/<id>` で計画生成・入力UI確認
6. ビルド確認
   ```bash
   npm run build
   ```
7. 本番相当確認
   ```bash
   npm run preview
   ```

---

## デプロイ手順（GitHub Pages）
1. 変更をコミットし、対象ブランチへ push。
2. GitHub Actions で `npm run build` を実行。
3. 必要に応じて Actions で `dist/config.js` を生成。
4. `dist/` を Pages 配信。
5. 公開URLで次を確認。
   - 追加種目が表示される
   - 編集内容が反映される
   - 無効化した種目が導線から消える

---

## 動作確認チェックリスト
- [ ] 追加した種目が UI に表示される
- [ ] 編集した内容が UI に反映される
- [ ] 削除/無効化が説明どおりに動作する
- [ ] 既存記録の表示が壊れない
- [ ] README / docs / 実装に不整合がない
- [ ] `npm run build` が成功する

---

## 開発コマンド
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
