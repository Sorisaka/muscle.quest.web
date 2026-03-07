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

---

## Phase C: 入力設計の拡張（inputMode / distance + stopwatch）

### 設計変更の要約
- 種目定義に以下を追加しました。
  - `inputMode`: `weightReps` / `reps` / `hold` / `stopwatch`
  - `defaultTimerMode`: `interval` / `stopwatch`
  - `trackingMetrics`: 追加トラッキング（今回は `distance`）
  - `goalConfig`: 目標入力設定（今回は distance）
- ランニング / サイクリングは `inputMode: stopwatch` のまま、`trackingMetrics: ['distance']` で「距離付きストップウォッチ」を表現します。
- ランニングは `goalConfig.defaultValue = 1500m` を初期表示します。

### ローカル開発手順
1. 依存インストール
   ```bash
   npm i
   ```
2. 開発サーバー起動
   ```bash
   npm run dev
   ```
3. 画面確認
   - 種目詳細 `#/workout/<quest-id>`
   - 実行画面 `#/run/<quest-id>`

### 確認手順（最低限）
#### 入力形式の確認
- `weightReps` で重量 + 回数が編集できる
- `reps` で回数のみ編集できる
- `hold` で時間のみ編集できる
- `stopwatch` でセットUIが出ない

#### UI表示条件
- セット数 1 のとき休憩UIが出ない
- 複数セット時は休憩UIが出る
- `maxSets=1` のときセット数スライダーが出ない

#### 距離付きストップウォッチ
- ランニングで距離 1500m が初期表示される
- サイクリングで距離入力ができる
- 経過時間 + 距離から平均速度を算出できる
- 速度帯に応じた強度がカロリーへ反映される

#### 表示名
- `abdominal-crunches` は「クランチ」表記
- `weighted-abdominal-crunches` は「クランチ（加重）」
- `weighted-squats` は「スクワット（加重）」

#### 保存
- `distanceMeters` を含む結果が保存される
- 履歴・再表示時に不整合がない

### ビルド / プレビュー / デプロイ確認
1. ビルド
   ```bash
   npm run build
   ```
2. プレビュー
   ```bash
   npm run preview
   ```
3. GitHub Pages 反映後の確認観点
   - 実行画面の入力形式切替が想定どおり
   - ランニング / サイクリングで距離入力が表示される
   - 完了投稿後の履歴に結果が正しく表示される

### SQL / Supabase
- 今回は結果JSON (`result`) に `distanceMeters` を保持するため、**追加SQLは不要**です。
- 既存スキーマ互換を維持し、保存フォーマットを拡張しています。

---

## Phase D: タイマー設計と投稿UIの再整理（time / setRest）

- `inputMode: stopwatch` は廃止し、`inputMode: time` へ統一。
- `time` は `timeMode` で `stopwatch` / `timer` を切り替え可能。
- `weightReps` / `reps` は `setRest`（セット進行 + 手動休憩開始）を使用。
- `hold` は `interval`（保持→休憩を自動反復）を継続。
- 投稿UIは分離ボタンを廃止し、公開範囲を選べる split button へ変更。
- 旧 `stopwatch` 設定は `store` / `trainingPlan` で `time` へ移行するフォールバックを実装。

---

## Phase E: タイマー種別の再設計（time + 4 modes）

### 新仕様（実装済み）
- 種目タイプは `weightReps` / `reps` / `time` に統一。
- 旧 `hold` は廃止し、`time + intervalTimer` へ統合。
- 旧 `stopwatch` 型は `time + stopwatch` へ移行。
- `time` の `timeMode` は次の4種類。
  - `timer`
  - `stopwatch`
  - `intervalTimer`
  - `intervalStopwatch`

### モード別の入力表示
- `timer`: ワーク時間（秒）
- `stopwatch`: 入力なし（経過時間のみ）
- `intervalTimer`: ワーク時間 / 休憩時間 / セット数
- `intervalStopwatch`: 休憩時間 / セット数（各セットのワーク時間は事前入力なし）

### UI配置ルール
- 実行画面 `#/run/<id>` の配置を次の順番に統一。
  1. 時間表示
  2. ボタン群（ワークアウト詳細へ / リセット / 開始 / 投稿 split button）
  3. タイマー種別ブロック
  4. ワークアウト設定

### 確認手順
1. `npm run dev` で `#/run/<id>` を開く。
2. 画面幅を狭くして、ラベル・入力・セレクト・ボタンが重ならないことを確認。
3. `time + stopwatch` を選び、時間入力欄が出ないことを確認。
4. `time + timer` を選び、時間入力欄が表示されることを確認。
5. `time + intervalTimer` を選び、ワーク時間/休憩/セット数で進行できることを確認。
6. `time + intervalStopwatch` を選び、セット計測→休憩→次セットの流れを確認。
7. `npm run lint` と `npm run build` を実行し成功することを確認。
