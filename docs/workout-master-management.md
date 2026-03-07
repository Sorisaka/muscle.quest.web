# トレーニング種目マスタ管理ガイド（運営・開発者向け）

## 1. 種目マスタとは何か
トレーニング種目マスタは、アプリで利用する「種目定義（ID、表示名、カテゴリ、難易度ごとの既定セットやポイント計算パラメータなど）」の正本です。

このマスタは **運動記録（workout_runs / body_metrics など）とは別物** であり、運営・開発側が管理します。

## 2. 現在の保存場所
現行構成では、種目マスタは Supabase テーブルではなく、リポジトリ内のコード管理です（Phase B 方針 A）。

- 種目マスタ本体: `src/data/workoutMaster.js`
- アプリ互換エクスポート（既存参照用）: `src/data/trainingDefinitions.js`
- 種目タグ参照（カテゴリ/部位）: `src/core/exerciseTaxonomy.js`
- クエスト定義（どの種目をUIに載せるか）: `src/data/quests.json`
- 種目コンテンツ（説明ページ）: `src/content/exercises/*.html`

### Supabase テーブルを採用しない理由
- 現行UIは `src/` の静的データを前提としており、種目マスタ取得APIや管理UIを持っていません。
- まずは現行構造に沿って、Git 管理＋レビューで安全に運用できる方式を優先します。
- このため **Phase B では SQL 追加は不要** です。

## 3. 追加手順
1. `docs/templates/workout-master-entry-template.json` をコピーし、1件分のエントリを作成。
2. `src/data/workoutMaster.js` の `workoutMasterEntries` に追加。
3. `src/data/quests.json` に、新種目を使うクエストを追加（または既存クエストに `exercises` で紐づけ）。
4. 必要に応じて `src/content/exercises/<slug>.html` を追加。
5. `npm run build` でビルド成功を確認。
6. `npm run dev` または `npm run preview` で、一覧・詳細・実行画面に反映されることを確認。

## 4. 編集手順
1. 対象種目の `id` を変更せず、`workoutMasterEntries` の該当要素を編集。
2. 次を確認して更新:
   - `label`, `description`
   - `category`, `muscles`
   - `difficulties.*.defaultSets`, `limits`, `points`
3. 必要なら `quests.json` や `content/exercises/*.html` も追従修正。
4. `npm run build` + 画面確認を実施。

## 5. 削除手順
本番運用では物理削除より **無効化（論理削除）** を推奨します。

- 推奨: `isActive: false` に変更
  - クエスト一覧・詳細（`src/core/content.js`）から自動で除外
  - 既存記録の参照整合を維持しやすい
- 非推奨: エントリ自体の物理削除
  - 過去データのカテゴリ/部位解決が `unknown` になる可能性あり

## 6. 削除ではなく無効化にすべきケース
- 既に公開済みで過去の運動記録に参照されている種目
- 一時停止（季節メニュー、イベントメニュー）
- 将来再公開の可能性がある種目

## 7. 必須項目 / 任意項目
### 必須
- `id`（一意キー）
- `isActive`
- `label`
- `category`
- `muscles`
- `unit`
- `restSeconds`
- `difficulties.beginner/intermediate/advanced`
  - `defaultSets`
  - `maxSets`
  - `limits`
  - `points`

### 任意
- `sortOrder`
- `description`
- `difficulties.*.howto`

## 8. UI 表示への反映箇所
- 一覧・詳細表示: `src/views/homeView.js`, `src/views/questListView.js`, `src/views/questView.js`
- 実行計画生成: `src/core/trainingPlan.js`
- 実行画面: `src/views/runView.js`
- 履歴タグ: `src/core/exerciseTaxonomy.js`

## 9. カロリー計算やカテゴリ分類への影響
- 消費カロリー推定・ポイントは `difficulties.*.points` を参照します。
- 部位タグ/カテゴリは `category`, `muscles` を参照します。
- `unit` が `time` と `weightReps` で入力UIや計画生成が変わるため、変更時は必ず run 画面を確認してください。

## 10. ローカル確認方法
1. `npm ci`
2. `cp src/config.example.js dist/config.js`
3. 必要なら `dist/config.js` を設定
4. `npm run dev`
5. 追加/編集/無効化後に以下を確認
   - `#/` → `#/workouts/<tier>` で一覧表示
   - `#/quest/<id>` で説明・ステップ表示
   - `#/run/<id>` で計画生成・保存
6. `npm run build`
7. `npm run preview`

## 11. Supabase 利用時の反映方法
- 種目マスタはコード管理のため、Supabase に対する追加 SQL は不要です。
- Supabase 利用時も、種目変更の反映は **デプロイ（`dist/` 更新）** によって行います。
- ただし記録データは Supabase に保存されるため、無効化時は既存履歴表示の回帰確認を必ず実施してください。
