import { formatDateTimeJa } from '../core/dateTimeFormatter.js';
import { buildNotificationMessage, resolveNotificationTypeLabel } from '../core/notificationPresenter.js';

const createActionButton = (label, onClick, className = 'ghost') => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
};

export const renderNotifications = (_params, { store, navigate, accountState }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const status = document.createElement('p');
  status.className = 'muted';

  const header = document.createElement('div');
  header.className = 'list-header';

  const backBtn = createActionButton('← 戻る', () => navigate('#/timeline'));
  const refreshBtn = createActionButton('更新', () => load(true));
  const markReadBtn = createActionButton('通知を既読にする', async () => {
    try {
      await Promise.resolve(store.markAllNotificationsRead());
      await Promise.resolve(store.fetchNotificationUnreadCount({ force: true }));
      render();
    } catch (_error) {
      status.textContent = '既読更新に失敗しました。';
    }
  });

  header.append(backBtn, refreshBtn);

  const title = document.createElement('h2');
  title.textContent = '通知';

  const controls = document.createElement('div');
  controls.className = 'list-header';
  controls.append(markReadBtn);

  const list = document.createElement('div');
  list.className = 'stack';

  const currentUserId = accountState.getStatus().id;


  const resolveFollowBackAction = (item) => {
    const visibility = item.actor_account_visibility || 'private';
    const isPrivate = visibility === 'private';

    if (item.is_following_actor) {
      return null;
    }

    if (isPrivate && item.has_outgoing_request) {
      return { label: 'リクエスト送信済み', disabled: true, mode: 'requested' };
    }

    return {
      label: isPrivate ? 'フォローリクエスト' : 'フォローバック',
      disabled: false,
      mode: isPrivate ? 'request' : 'follow',
    };
  };

  const renderActions = (item, actions) => {
    const appendFollowBackAction = () => {
      const action = resolveFollowBackAction(item);
      if (!action) return;
      const button = createActionButton(action.label, async () => {
        if (action.mode === 'follow') {
          await Promise.resolve(store.followUser(currentUserId, item.actor_id));
        } else if (action.mode === 'request') {
          await Promise.resolve(store.requestFollow(currentUserId, item.actor_id));
        }
        await load(true);
      });
      if (action.disabled) button.disabled = true;
      actions.append(button);
    };

    if (item.type === 'follow_request') {
      if (item.has_pending_request) {
        actions.append(
          createActionButton('許可', async () => {
            await Promise.resolve(store.respondFollowRequest(currentUserId, item.actor_id, 'approve'));
            await load(true);
          }),
          createActionButton('拒否', async () => {
            await Promise.resolve(store.respondFollowRequest(currentUserId, item.actor_id, 'reject'));
            await load(true);
          }, 'ghost'),
        );
      } else {
        appendFollowBackAction();
      }
      return;
    }

    if (item.type === 'follow') {
      appendFollowBackAction();
    }
  };


  const render = () => {
    const state = store.getNotificationState();
    const items = Array.isArray(state?.items) ? state.items : [];
    status.textContent = state?.error || '';
    markReadBtn.disabled = !items.some((entry) => !entry?.read_at);
    list.innerHTML = '';

    if (state?.loading && !items.length) {
      list.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: '通知を読み込み中...' }));
      return;
    }

    if (!items.length) {
      list.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: '通知はありません。' }));
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = `card stack notification-card ${item.read_at ? '' : 'notification-card--unread'}`.trim();

      const head = document.createElement('div');
      head.className = 'list-header';
      head.append(
        Object.assign(document.createElement('strong'), { textContent: resolveNotificationTypeLabel(item.type) }),
        Object.assign(document.createElement('span'), { className: 'muted', textContent: formatDateTimeJa(item.created_at) }),
      );

      const body = document.createElement('p');
      body.textContent = buildNotificationMessage(item);

      const actions = document.createElement('div');
      actions.className = 'timeline-card__actions';
      renderActions(item, actions);

      card.append(head, body);
      if (actions.children.length) card.append(actions);
      list.append(card);
    });
  };

  const load = async (force = false) => {
    try {
      await Promise.all([
        Promise.resolve(store.fetchNotifications({ force, limit: 50 })),
        Promise.resolve(store.fetchNotificationUnreadCount({ force: true })),
      ]);
      render();
    } catch (_error) {
      render();
    }
  };

  container.append(header, title, controls, status, list);
  render();
  load(true);
  return container;
};
