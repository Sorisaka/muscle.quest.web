# 種目マスタ 1件テンプレート（記入用）

## 基本情報
- id: `new-exercise-slug`
- isActive: `true / false`
- sortOrder: `数値`
- label: `表示名`
- category: `cardio | bodyweight | weights`
- muscles: `配列（例: ["core", "legs"]）`
- unit: `time | weightReps`
- description: `説明文`
- restSeconds: `休憩秒数`

## 難易度定義（beginner / intermediate / advanced 共通）
- defaultSets:
  - `unit=time` の場合: `{ "timeSeconds": number }`
  - `unit=weightReps` の場合: `{ "weight": number, "reps": number }`
- maxSets: `最大セット数`
- limits: `入力最小/最大`
- points:
  - base
  - perWork
  - setBonus
  - completion
  - challengeScale
- howto: `実施説明`

## 記入例（weightReps）
```json
{
  "id": "dumbbell-row",
  "isActive": true,
  "sortOrder": 60,
  "label": "ダンベルロー",
  "category": "weights",
  "muscles": ["back", "arms"],
  "unit": "weightReps",
  "description": "背中を中心に鍛えるローイング種目",
  "restSeconds": 40,
  "difficulties": {
    "beginner": {
      "defaultSets": [{ "weight": 4, "reps": 10 }],
      "maxSets": 5,
      "limits": { "weight": { "min": 0, "max": 30 }, "reps": { "min": 6, "max": 20 } },
      "points": { "base": 130, "perWork": 0.1, "setBonus": 8, "completion": 30, "challengeScale": 0.5 },
      "howto": "肩をすくめず肘を後方に引く"
    },
    "intermediate": { "defaultSets": [{ "weight": 6, "reps": 12 }], "maxSets": 6, "limits": { "weight": { "min": 0, "max": 40 }, "reps": { "min": 8, "max": 24 } }, "points": { "base": 170, "perWork": 0.12, "setBonus": 10, "completion": 40, "challengeScale": 0.55 }, "howto": "反動を使わず引き切る" },
    "advanced": { "defaultSets": [{ "weight": 10, "reps": 12 }], "maxSets": 7, "limits": { "weight": { "min": 0, "max": 60 }, "reps": { "min": 8, "max": 30 } }, "points": { "base": 200, "perWork": 0.14, "setBonus": 12, "completion": 55, "challengeScale": 0.6 }, "howto": "背中で引く意識を維持" }
  }
}
```
