export const trainingConfig = {
  defaults: {
    timerTrainingSeconds: 90,
    timerRestSeconds: 20,
    timerSets: 3,
    mode: 'interval',
    timerType: 'interval',
  },
  limits: {
    trainingSeconds: { min: 10, max: 1800, label: 'トレーニング時間', description: '10秒〜30分で設定' },
    restSeconds: { min: 0, max: 900, label: '休憩時間', description: '最大15分まで' },
    sets: { min: 1, max: 20, label: 'セット数', description: '1〜20セットまで' },
  },
  descriptions: {
    timer: 'シンプルタイマー: 指定時間が経過すると完了通知します。',
    interval:
      'インターバルタイマー: トレーニングと休憩を自動で繰り返します（最終セット完了時は休憩へ遷移しません）。',
    stopwatch: 'ストップウォッチ: 自由計測。完了ボタンで計測を終了し、経過時間に応じてポイント計算します。',
  },
  points: {
    basePerSet: 30,
    perTrainingSecond: 0.5,
    restPenaltyPerSecond: 0.1,
    completionBonus: 80,
    stopwatchPerSecond: 0.25,
    difficultyMultiplier: {
      beginner: 1,
      intermediate: 1.15,
      advanced: 1.3,
    },
    note: 'セット完走でボーナス。休憩が長いほど控えめに加点。',
  },
};
