export const FOLLOW_STATE_LABELS = {
  own_account: '自分のアカウント',
  following: 'フォロー中',
  requested: 'リクエスト送信済み',
  not_following: '未フォロー',
  error: 'エラー',
};

const createButton = (label, className = '') => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
};

export const createFollowActionButton = ({
  state = 'not_following',
  accountVisibility = 'public',
  onFollow,
  onUnfollow,
  onRequest,
  onCancelRequest,
} = {}) => {
  if (state === 'own_account') {
    const disabled = createButton(FOLLOW_STATE_LABELS.own_account, 'ghost');
    disabled.disabled = true;
    return disabled;
  }

  if (state === 'following') {
    const btn = createButton('フォロー解除', 'ghost');
    btn.addEventListener('click', () => onUnfollow?.());
    return btn;
  }

  if (state === 'requested') {
    const btn = createButton('リクエスト取消', 'ghost');
    btn.addEventListener('click', () => onCancelRequest?.());
    return btn;
  }

  const label = accountVisibility === 'private' ? 'フォローリクエスト' : 'フォロー';
  const btn = createButton(label);
  btn.addEventListener('click', () => {
    if (accountVisibility === 'private') onRequest?.();
    else onFollow?.();
  });
  return btn;
};
