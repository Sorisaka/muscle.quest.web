import { resolveWorkoutLabel } from './workoutLabel.js';
import { formatDateTimeJa } from './dateTimeFormatter.js';

export const resolveNotificationTypeLabel = (type) => {
  if (type === 'like') return 'いいね';
  if (type === 'follow') return 'フォロー';
  if (type === 'follow_request') return 'フォローリクエスト';
  return '通知';
};

export const buildNotificationMessage = (item = {}) => {
  const actor = item.actor_display_name || item.actor_username || 'ユーザー';
  if (item.type === 'like') {
    const workoutLabel = resolveWorkoutLabel(item.workout_exercise_slug);
    return `${actor} さんが ${workoutLabel}（${formatDateTimeJa(item.workout_created_at)}）の投稿にいいねしました`;
  }
  if (item.type === 'follow') return `${actor} さんがあなたをフォローしました`;
  if (item.type === 'follow_request') return `${actor} さんからフォローリクエストが届いています`;
  return item.message || '通知';
};
