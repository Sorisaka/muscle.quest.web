# Calories計算仕様（Phase1）

## 基本式
- `kcal = MET * 3.5 * weight_kg / 200 * minutes`
- `minutes` は `startTime/endTime` があればその差分を優先し、なければ `elapsedSeconds` や `trainingSeconds` から算出。

## プロフィール推定（auto）
身長 `H(m)=height_cm/100` と `sex` から推定する。

- `step_length_m`: male `H*0.415`, female `H*0.413`, unknown `H*0.414`
- `arm_length_m`: male `H*0.486`, female `H*0.478`, unknown `H*0.482`
- `torso_length_m`: male `H*0.219`, female `H*0.216`, unknown `H*0.218`
- `leg_length_m`: male `H*0.616`, female `H*0.621`, unknown `H*0.619`

`*_mode=auto` の項目のみ再推定し、`manual` は入力値を維持。

## METテーブル（簡易3段階）
- cardio(walk): light 2.8 / moderate 3.8 / vigorous 5.0
- cardio(run): light 6.0 / moderate 8.0 / vigorous 10.0
- bodyweight: light 3.8 / moderate 5.2 / vigorous 7.0
- resistance(weights): light 3.5 / moderate 5.0 / vigorous 6.5

## 速度推定
歩数がある場合:
- `distance_m = step_length_m * steps`
- `speed_kmh = (distance_m / seconds) * 3.6`

この速度で walk/run の強度を推定して MET を決める。

## 注意
- 本実装の kcal は推定値であり、医療用途の正確値ではありません。
- 既存データ互換のため `points` は内部で保持する場合がありますが、UI表示は `calories` を優先します。
