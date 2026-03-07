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


## Phase G: 投稿いいねユーザー一覧モーダル（RLS対応）

### 追加したSQL
- Migration:
  - `supabase/migrations/20260307_0013_add_like_users_rpc.sql`
  - `supabase/migrations/20260307_0014_refine_like_users_rpc.sql`
- 手動適用用SQL:
  - `supabase/sql/023_add_like_users_rpc.sql`
  - `supabase/sql/024_refine_like_users_rpc.sql`

### 追加したRPC/関数
- `public.get_workout_run_like_users(p_run_id bigint, p_limit int default 100)`
  - 用途: 投稿にいいねしたユーザー一覧（表示名・識別子・アイコン情報・liked_at）を返す。
  - 注意: 閲覧者が投稿を閲覧可能な場合のみ結果を返し、不可視投稿は空集合を返す。
- `public.can_view_workout_run(p_run_id bigint, p_viewer_id uuid default auth.uid())`
  - 用途: 投稿可視性判定（owner/public/private+follow/archived）を共通化する補助関数。

### ローカル/手動適用
- 手動で適用する場合は次を順に実行:
  1. `supabase/sql/023_add_like_users_rpc.sql`
  2. `supabase/sql/024_refine_like_users_rpc.sql`

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

---

## Phase F: 設定メニュー編集フローの刷新（ワークアウト選択モーダル）

### 変更概要
- `#/settings/menu` の曜日メニュー / 特別日メニュー編集を、自由入力から **ワークアウト選択モーダル経由** へ変更。
- 追加・再選択は「ワークアウト選択」ボタンで統一。
- モーダルでカテゴリー（未選択/有酸素/自重/ウエイト）と部位を絞り込み、複数選択を押下順番号付きで確定可能。
- 項目詳細は「表示名 / ワークアウト内容 / メモ」を編集し、表示名が空の場合はワークアウト既定名を表示。
- 旧データ（`exerciseSlug` / `questId` 中心）も正規化して読み込み、未知データは「不明なワークアウト」として破綻なく編集・保存可能。

### 参照元データと責務分離
- ワークアウト一覧・カテゴリー名・部位名・既定ラベル・デフォルト設定値は `src/core/menuWorkoutCatalog.js` / `src/core/menuPlanItem.js` で一元解決。
- `src/views/settingsView.js` は表示配列を受け取り、DOM描画とイベント制御に集中。

### 影響ファイル
- `src/views/settingsView.js`
- `src/style.css`
- `README.md`

### データ互換性の考え方
- 保存形式は既存の `weekly_plans.items` / `special_plans.items`（JSON配列）を維持。
- 新UIでは `displayName/workoutLabel/workoutConfig/muscles` を追加保持しつつ、既存の `exerciseSlug/questId/category/note/title` も維持。
- そのため DB スキーマ変更は不要（Supabase / local fallback とも同一経路で保存可能）。

### 部位・カテゴリーの正とした定義
- 部位/カテゴリーは `src/data/workoutMaster.js` -> `trainingDefinitions` を正として利用。
- 理由: 実行時の入力モードやデフォルトセットと同じマスタを参照でき、設定画面と実行画面の意味づけを一致させられるため。

### ソート順・選択順ルール
- モーダル一覧ソート: **カテゴリー → 部位 → 50音**。
- モーダル内の一時選択は、開くたびに現在一覧の順序から再生成。
- フィルタ変更では一時選択を破棄しない。
- 「選択」で一時選択順を一覧へ確定、「キャンセル」で破棄。
- 順序のソースオブトゥルースは編集中一覧（draft items）1つ。

### ローカルデバッグ手順
1. `npm i`
2. `npm run dev`
3. `#/settings/menu` を開き、以下を確認:
   - ワークアウト選択モーダルの開閉
   - カテゴリー/部位絞り込み
   - 複数選択の番号表示と解除時の詰め
   - 「選択」で一覧へ順序反映
   - 一覧の↑↓後にモーダル再オープンで番号順同期
   - 表示名空欄時の既定名表示
4. `npm run build`
5. `npm run preview` でビルド成果物を確認

### 手動確認項目
- 曜日メニュー・特別日メニュー双方で同一フローが使える
- 旧データがあるユーザーでも画面が開ける
- 不明なワークアウト項目の削除/並び替え/保存ができる
- local fallback と Supabase の双方で再読込時に項目順と詳細が保持される

### Supabase適用手順
- **追加 migration 不要**（テーブル変更なし）。
- 通常どおりフロントエンドをデプロイすれば反映。
- 既存運用環境では、ログインユーザーで `#/settings/menu` を開き保存→再読込で反映確認。

### デプロイ確認手順
1. `npm run build` 成功を確認。
2. 変更を push。
3. GitHub Pages 反映後に `#/settings/menu` を開き、モーダル選択～保存～再表示まで確認。
4. 併せて `#/` の「今日のTODOメニュー」で表示名/既定名フォールバックを確認。

### 既知の制約
- 同一ワークアウトを同一メニュー内で重複選択する用途は想定せず、選択順管理は `exerciseSlug` 単位。
- 一部 legacy データで `exerciseSlug` が欠損している場合は項目由来を特定できないため、再選択で置き換えて利用する運用を推奨。


## Phase F: タイムライン取得経路の分離と通知フィード

### 変更概要
- タイムライン本体 (`get_timeline`) といいね集計 (`get_timeline_like_summaries`) を分離しました。
- 通知一覧を `#/notifications` として追加しました。
- 左ドロワーに通知導線（未読件数表示）を追加しました。

### Supabase SQL 適用手順
1. migration を使う場合
   ```bash
   # Supabase CLI を使う場合の例
   supabase db push
   ```
2. 手動適用の場合
   - `supabase/sql/018_phase6_timeline_notifications.sql` を SQL Editor で実行

### ローカル確認手順
1. 開発サーバーを起動
   ```bash
   npm run dev
   ```
2. `#/timeline` を表示
   - 一覧が表示されること
   - いいね操作後に件数が更新されること
3. `#/notifications` を表示
   - フォローリクエスト通知 / いいね通知が表示されること
4. 左ドロワーを開く
   - 通知ボタンに未読件数が表示されること

### 動作確認項目
- タイムライン読み込み時に RLS 由来で一覧取得が失敗しないこと
- いいね数は分離取得でも表示されること
- 通知画面が表示できること
- `npm run build` が成功すること


### 追補: タイムライン / 自分の投稿一覧 表示改善
- タイムライン・自分の投稿一覧で、種目名を日本語ラベルで表示
- 結果データから「どれくらい運動したか」を運動タイプ別に表示（時間/距離/セット）
- 自分の投稿一覧でも likes 集計を別取得で表示（`♡ n`）


## Phase G: 通知機能（DB保存 + 未読件数 + 一括既読）

### 通知テーブルの役割
- `notifications` は「受信者(user_id)に対して、誰(actor_user_id)が、何(type)をしたか」を保存します。
- type は `like` / `follow` / `follow_request`。
- 未読は `read_at is null` で判定します。

### 発火条件
- like通知: 他人の投稿にいいねしたとき（自分への自分いいねは通知しない）
- follow通知: フォロー成立時
- follow request通知: リクエスト送信時（status=pending）
- いいね解除時: **通知は残します**（履歴として保持）

### SQL適用手順
1. migration適用: `supabase db push`
2. 手動適用: `supabase/sql/019_notifications_table.sql` を SQL Editor で実行

### ローカル確認方法
1. `npm run dev`
2. 左ドロワーを開く（都度未読件数を再取得）
3. 通知ボタンの右端バッジを確認（0件時は非表示）
4. `#/notifications` で like / follow / follow request が表示されること
5. 「通知を既読にする」で未読バッジが0になること


### 通知機能のSQL適用順
1. `supabase/sql/018_phase6_timeline_notifications.sql`
2. `supabase/sql/019_notifications_table.sql`

## Phase H: フォロー検索 / いいね永続化 / 通知導線UIの修正

### 追加ファイル
- migration: `supabase/migrations/20260307_0012_fix_follow_search_and_like_toggle.sql`
- 手動SQL: `supabase/sql/020_fix_follow_search_and_like_toggle.sql`

### 目的
- 新規フォロー検索で exact UUID が 0 件になりやすい環境差分を吸収するため、`search_accounts` を再定義
- `toggle_like` の DB 正更新を前提に、フロントのローカルフォールバックによる見かけだけ更新を廃止
- 左ドロワー通知ボタンのラベル中央固定 + バッジ右端固定

### SQL 適用順（018/019 前提）
1. `supabase/sql/018_phase6_timeline_notifications.sql`
2. `supabase/sql/019_notifications_table.sql`
3. `supabase/sql/020_fix_follow_search_and_like_toggle.sql`

### ローカル確認手順
1. `npm run dev`
2. 新規フォロー検索
   - UUID 完全一致で検索結果が出る
   - display_name 部分一致で検索結果が出る
   - 自分自身は結果に出ない
   - RPC失敗時は「検索に失敗しました。時間をおいて再試行してください。」
3. タイムラインいいね
   - いいね操作時に 400 が出ない
   - リロード後も like 状態が維持される
4. 通知
   - A の投稿を B が like すると A に like 通知が作成される
   - 左ドロワー未読件数が再取得で整合する
5. 左ドロワー
   - 通知ラベルが中央固定で、バッジが右端表示（1 / 9 / 12 / 99+）

### 手順化（確認ケース）
- ケースA（public投稿）
  1. A が public 投稿
  2. B が like
  3. A 側で通知追加と未読増加を確認
- ケースB（private投稿 + follow済み）
  1. B が A を follow
  2. A の private 投稿に B が like
  3. リロード後も like 維持 + A 側通知を確認
- ケースC（archived投稿）
  1. archived 投稿への like を試行
  2. DB 側で拒否され UI が破綻しないことを確認
