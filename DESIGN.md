# Design Notes

## 現状把握（ルーティングと主要画面）
- ルータ定義: `src/app.js` の `routes` で `#/`, `#/settings`, `#/quests/:tier`, `#/quest/:id`, `#/run/:id` が登録され、`createRouter`(`src/core/router.js`) で hash ベース遷移を処理。
- 画面レンダラ:
  - Home: `src/views/homeView.js`
  - Quest List: `src/views/questListView.js`
  - Quest Detail & Timer設定: `src/views/questView.js`
  - Run (インターバルタイマー/ストップウォッチ): `src/views/runView.js`
  - Settings: `src/views/settingsView.js`
  - Rank（サンプル静的）: `src/views/rankView.js`
- タイマー/ストップウォッチ実装箇所: `src/views/runView.js` に手書きの setInterval ベース実装があり、別途 `src/core/timerEngine.js` に汎用エンジンが存在するが未使用。

## トレーニング定義の所在
- クエスト定義（種目・難易度相当・時間目安・セット手順など）は `src/data/quests.json` にハードコードされ、ビルド時に `scripts/build.js` で `dist/generated/contentMap.js` として展開される。
- タイマーの規定値は `src/core/store.js` の `defaultSettings`（training/rest 秒数、セット数）にハードコードされている。

## 追加機能に向けた責務分離の設計メモ
- **設定の分離:** トレーニング用の規定値・上限値・ポイント計算式・説明文を `src/data/trainingConfig.js`（もしくは同等の設定モジュール）にまとめ、UI/ロジックから切り離して編集容易性を確保する。
- **タイマー改修:** 既存の `src/core/timerEngine.js` を再利用し、`runView` はエンジンからのスナップショット購読で UI を更新する。モード切替（タイマー/ストップウォッチ）とセット進行・経過計測を統一管理。
- **ポイント機能:** 設定ファイルに基づく計算を `src/core/points.js` に集約し、完了結果を渡すとポイントと内訳を返す。Run 完了時にポイントを計算してプロフィールへ反映、ランキングに利用する。
- **永続化のアダプタ化:** `src/data/persistence.js` にインタフェースを定義し、ローカルストレージ実装（`local`）と将来の Supabase 実装（`supabase` スタブ）を切り替え可能にする。ランキング取得・プロフィール保存・Run 記録をアダプタ越しに実施。
- **UI 影響:** 既存ルーティングを維持しつつ `#/rank/...` を正式登録。設定と Run 画面にポイント/タイマー説明を表示するが、レイアウト崩れを避けるため既存スタイルを流用する。

## 変更実装プラン（実ファイル想定）
- 追加: `src/data/trainingConfig.js`（設定）、`src/core/trainingPlan.js`（上限チェック・デフォルト生成）、`src/core/points.js`（計算）、`src/data/persistence.js`＋`src/data/adapters/localPersistence.js`＋`src/data/adapters/supabaseStub.js`（アダプタ）。
- 改修: `src/core/store.js`（設定の参照・プロフィール/ラン記録・アダプタ連携）、`src/views/questView.js`（設定画面での値整合、説明表示）、`src/views/runView.js`（タイマーエンジン利用・完了時ポイント付与）、`src/views/rankView.js`（アダプタ経由ランキング表示）、`src/views/homeView.js`（ランキング導線追加）、`src/app.js`（ランキングルート追加）、`src/style.css`（新 UI スタイル）。
- 必要に応じて README/コピー対象は既存ビルド（src→dist コピー + 生成）を維持。
