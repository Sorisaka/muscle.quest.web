# 種目マスタ編集チェックリスト

- [ ] `id` を変更していない（既存データ互換）
- [ ] `category` / `muscles` が既存列挙値に収まっている
- [ ] `unit` と `defaultSets` / `limits` の組み合わせが正しい
- [ ] beginner/intermediate/advanced の3難易度が存在する
- [ ] `points` パラメータを更新した場合、難易度バランスを確認した
- [ ] `npm run build` が成功する
- [ ] `#/workouts/*` / `#/quest/*` / `#/run/*` で表示崩れがない
- [ ] 履歴画面のカテゴリ・部位フィルタが意図通りに動く
