export const trainingConfig = {
  defaults: {
    timerTrainingSeconds: 90,
    timerRestSeconds: 20,
    timerSets: 3,
    mode: 'setRest',
    timerType: 'setRest',
    timeMode: 'stopwatch',
  },
  limits: {
    trainingSeconds: { min: 10, max: 1800, label: 'トレーニング時間', description: '10秒〜30分で設定' },
    restSeconds: { min: 0, max: 900, label: '休憩時間', description: '最大15分まで' },
    sets: { min: 1, max: 20, label: 'セット数', description: '1〜20セットまで' },
  },
  descriptions: {
    timer: 'タイマー: 指定時間のカウントダウンを行い、終了時に完了します。',
    interval:
      'インターバルタイマー: 運動時間と休憩時間をセット数ぶん自動で繰り返します。',
    setRest:
      'セット進行 + 休憩タイマー: セット完了後に休憩を開始し、次セットへ進みます。',
    timeStopwatch: 'ストップウォッチ: 経過時間を計測します。',
    timeTimer: 'タイマー: 設定した時間をカウントダウンします。',
    timeIntervalTimer: 'インターバルタイマー: ワーク時間と休憩時間をセット数ぶん繰り返します。',
    timeIntervalStopwatch: 'インターバルストップウォッチ: 各セットの経過時間を計測し、セット間に休憩を挟みます。',
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
