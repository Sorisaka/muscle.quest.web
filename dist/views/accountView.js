import { createAccountAvatar, getAvatarLabel } from '../ui/accountAvatar.js';
import { createAccountListRow, withPrivateLock } from '../ui/accountListRow.js';
import { createFollowActionButton } from '../ui/followActionButton.js';
import { createIncomingRequestActions, createOutgoingRequestActions } from '../ui/requestActionButtons.js';
import { createCountsSummaryBlock } from '../ui/accountCountsSummary.js';
import { resolveWorkoutPresentation } from '../core/workoutResultPresenter.js';

const resolveUiState = ({ currentUserId, account, followState }) => {
  if (!account?.id || account.id === currentUserId) return 'own_account';
  if (followState?.isFollowing) return 'following';
  if (followState?.hasPendingRequest) return 'requested';
  return 'not_following';
};

const buildStatusText = (code) => {
  const map = {
    FOLLOWED: 'フォローしました。',
    UNFOLLOWED: 'フォロー解除しました。',
    REQUESTED: 'フォローリクエストを送信しました。',
    REQUEST_PENDING: 'すでにリクエスト送信済みです。',
    REQUEST_CANCELLED: 'フォローリクエストを取消しました。',
    REQUEST_ACCEPTED: 'リクエストを承認しました。',
    REQUEST_REJECTED: 'リクエストを拒否しました。',
    SELF_FOLLOW_NOT_ALLOWED: '自分自身はフォローできません。',
    own_account: '自分のアカウントです。',
  };
  return map[code] || code || '';
};

const createLoading = (text = '読み込み中...') => {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  return p;
};

const createEmpty = (text = 'データはありません。') => {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  return p;
};

export const renderAccount = (_params, { navigate, accountState, store }) => {
  const container = document.createElement('section');
  container.className = 'stack account-view';

  const status = accountState.getStatus();
  const profile = store.getProfile() || {};
  const currentUserId = status.id || 'guest';

  const feedback = document.createElement('p');
  feedback.className = 'muted';

  const profileCard = document.createElement('article');
  profileCard.className = 'card stack';

  const identity = document.createElement('div');
  identity.className = 'list-account-row';
  identity.append(
    createAccountAvatar({
      label: getAvatarLabel(status.displayName, 'G'),
      className: 'account-avatar--inline',
      icon: {
        icon_border: profile.icon_border,
        icon_background: profile.icon_background,
        icon_center_object: profile.icon_center_object,
      },
    }),
    Object.assign(document.createElement('strong'), {
      textContent: withPrivateLock(status.displayName || 'ゲスト', profile.account_visibility || profile.default_visibility || 'private'),
    }),
  );

  const countsSlot = document.createElement('div');
  countsSlot.append(createLoading());

  const followModalOverlay = document.createElement('div');
  followModalOverlay.className = 'follow-modal-overlay';
  followModalOverlay.hidden = true;

  const followModal = document.createElement('div');
  followModal.className = 'follow-modal card stack';
  followModal.setAttribute('role', 'dialog');
  followModal.setAttribute('aria-modal', 'true');
  followModal.setAttribute('aria-labelledby', 'follow-modal-title');

  const modalHeader = document.createElement('div');
  modalHeader.className = 'list-header';
  const searchTitle = document.createElement('h3');
  searchTitle.id = 'follow-modal-title';
  searchTitle.textContent = '新規フォロー';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'ghost';
  closeBtn.textContent = '閉じる';

  modalHeader.append(searchTitle, closeBtn);

  const controls = document.createElement('div');
  controls.className = 'list-header';
  const idInput = document.createElement('input');
  idInput.type = 'text';
  idInput.placeholder = 'IDを入力';
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.textContent = '検索';
  controls.append(idInput, searchBtn);

  const results = document.createElement('div');
  results.className = 'stack';

  followModal.append(modalHeader, controls, results);
  followModalOverlay.append(followModal);

  const closeModal = () => {
    followModalOverlay.hidden = true;
  };

  const openModal = () => {
    followModalOverlay.hidden = false;
    idInput.focus();
  };

  followModalOverlay.addEventListener('click', (event) => {
    if (event.target === followModalOverlay) closeModal();
  });
  closeBtn.addEventListener('click', closeModal);

  const performSearch = async () => {
    results.innerHTML = '';
    results.append(createLoading('検索中...'));
    const query = idInput.value.trim();
    try {
      const accounts = await Promise.resolve(store.searchAccounts(query, currentUserId, 20));
      results.innerHTML = '';
      if (!accounts?.length) {
        results.append(createEmpty('該当アカウントがありません。'));
        return;
      }

      for (const account of accounts) {
        const followState = await Promise.resolve(store.getFollowState(currentUserId, account.id));
        const uiState = resolveUiState({ currentUserId, account, followState });

        const actionEl = createFollowActionButton({
          state: uiState,
          accountVisibility: account.account_visibility,
          onFollow: async () => {
            const res = await Promise.resolve(store.followUser(currentUserId, account.id));
            feedback.textContent = buildStatusText(res?.code || 'FOLLOWED');
            performSearch();
          },
          onUnfollow: async () => {
            const res = await Promise.resolve(store.unfollowUser(currentUserId, account.id));
            feedback.textContent = buildStatusText(res?.code || 'UNFOLLOWED');
            performSearch();
          },
          onRequest: async () => {
            const res = await Promise.resolve(store.requestFollow(currentUserId, account.id));
            feedback.textContent = buildStatusText(res?.code || 'REQUESTED');
            performSearch();
          },
          onCancelRequest: async () => {
            const res = await Promise.resolve(store.cancelFollowRequest(currentUserId, account.id));
            feedback.textContent = buildStatusText(res?.code || 'REQUEST_CANCELLED');
            performSearch();
          },
        });

        results.append(createAccountListRow({ account, actionEl }));
      }
    } catch (_error) {
      results.innerHTML = '';
      results.append(createEmpty('検索に失敗しました。時間をおいて再試行してください。'));
    }
  };

  searchBtn.addEventListener('click', performSearch);

  Promise.resolve(store.getFollowCounts(currentUserId))
    .then((counts) => {
      countsSlot.innerHTML = '';
      countsSlot.append(createCountsSummaryBlock({
        counts,
        onOpenFollowing: () => navigate('#/account/following'),
        onOpenFollowers: () => navigate('#/account/followers'),
        onOpenFollowSearch: openModal,
      }));
    })
    .catch(() => {
      countsSlot.innerHTML = '';
      countsSlot.append(createEmpty('フォロー数の取得に失敗しました。'));
    });

  profileCard.append(identity, countsSlot);

  const activityCard = document.createElement('article');
  activityCard.className = 'card stack';
  activityCard.innerHTML = `<h3>活動情報</h3>
    <div class="account-metric__row"><span>消費カロリー</span><strong>${status.calories} kcal</strong></div>
    <div class="account-metric__row"><span>ストリーク</span><strong>${status.streak} 日</strong></div>
    <div class="account-metric__row"><span>完了ワークアウト</span><strong>${status.completedRuns || 0} 件</strong></div>`;

  const postCard = document.createElement('article');
  postCard.className = 'card stack';
  postCard.append(Object.assign(document.createElement('h3'), { textContent: '自分の投稿一覧' }));
  const list = document.createElement('div');
  list.className = 'stack';
  const entries = (store.getHistory() || []).slice(0, 10);
  let likeSummaryByRunId = new Map();

  const likeUsersModalOverlay = document.createElement('div');
  likeUsersModalOverlay.className = 'follow-modal-overlay';
  likeUsersModalOverlay.hidden = true;

  const likeUsersModal = document.createElement('div');
  likeUsersModal.className = 'follow-modal card stack';
  likeUsersModal.setAttribute('role', 'dialog');
  likeUsersModal.setAttribute('aria-modal', 'true');
  likeUsersModal.setAttribute('aria-labelledby', 'like-users-modal-title');

  const likeUsersHeader = document.createElement('div');
  likeUsersHeader.className = 'list-header';

  const likeUsersTitle = document.createElement('h3');
  likeUsersTitle.id = 'like-users-modal-title';
  likeUsersTitle.textContent = 'いいねしたユーザー';

  const likeUsersCloseBtn = document.createElement('button');
  likeUsersCloseBtn.type = 'button';
  likeUsersCloseBtn.className = 'ghost';
  likeUsersCloseBtn.textContent = '閉じる';

  const likeUsersList = document.createElement('div');
  likeUsersList.className = 'stack';

  likeUsersHeader.append(likeUsersTitle, likeUsersCloseBtn);
  likeUsersModal.append(likeUsersHeader, likeUsersList);
  likeUsersModalOverlay.append(likeUsersModal);

  const closeLikeUsersModal = () => {
    likeUsersModalOverlay.hidden = true;
  };

  const openLikeUsersModal = () => {
    likeUsersModalOverlay.hidden = false;
  };

  likeUsersModalOverlay.addEventListener('click', (event) => {
    if (event.target === likeUsersModalOverlay) closeLikeUsersModal();
  });
  likeUsersCloseBtn.addEventListener('click', closeLikeUsersModal);

  container.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !followModalOverlay.hidden) closeModal();
    if (event.key === 'Escape' && !likeUsersModalOverlay.hidden) closeLikeUsersModal();
  });

  const renderOwnPosts = () => {
    list.innerHTML = '';
    if (!entries.length) {
      list.append(createEmpty('投稿はまだありません。'));
      return;
    }

    entries.forEach((entry) => {
      const presentation = resolveWorkoutPresentation(entry);
      const card = document.createElement('article');
      card.className = 'card stack';

      const title = document.createElement('strong');
      title.textContent = presentation.workoutLabel;

      const amount = document.createElement('p');
      amount.className = 'muted';
      amount.textContent = presentation.workoutAmountLabel;

      const footer = document.createElement('div');
      footer.className = 'timeline-card__actions';
      const like = likeSummaryByRunId.get(String(entry.id));
      const likeCount = Number(like?.likeCount ?? 0);
      const likeButton = document.createElement('button');
      likeButton.type = 'button';
      likeButton.className = 'ghost like-count-button';
      likeButton.textContent = `♡ ${likeCount}`;
      likeButton.disabled = !entry?.id;
      likeButton.addEventListener('click', async () => {
        likeUsersList.innerHTML = '';
        likeUsersList.append(createLoading('いいねユーザーを読み込み中...'));
        openLikeUsersModal();
        try {
          const users = await Promise.resolve(store.getWorkoutRunLikeUsers(entry.id, 100));
          likeUsersList.innerHTML = '';
          if (!users?.length) {
            likeUsersList.append(createEmpty('この投稿へのいいねはまだありません。'));
            return;
          }
          users.forEach((account) => {
            likeUsersList.append(createAccountListRow({ account }));
          });
        } catch (_error) {
          likeUsersList.innerHTML = '';
          likeUsersList.append(createEmpty('いいねユーザー一覧の取得に失敗しました。'));
        }
      });
      footer.append(likeButton);

      card.append(title, amount, Object.assign(document.createElement('p'), { className: 'muted', textContent: `${entry.calories || 0} kcal` }), footer);
      list.append(card);
    });
  };

  renderOwnPosts();
  postCard.append(list, likeUsersModalOverlay);

  const ownRunIds = entries.map((entry) => entry?.id).filter(Boolean);
  if (ownRunIds.length) {
    Promise.resolve(store.getLikeCountsByWorkoutRunIds(ownRunIds))
      .then((rows) => {
        likeSummaryByRunId = new Map((rows || []).map((row) => [String(row.runId || row.run_id), row]));
        renderOwnPosts();
      })
      .catch(() => {
        likeSummaryByRunId = new Map();
        renderOwnPosts();
      });
  }

  container.append(profileCard, activityCard, postCard, feedback, followModalOverlay);
  return container;
};

const renderAccountsByIds = async ({ accounts = [], currentUserId, store, feedback, rerender }) => {
  if (!accounts.length) return [createEmpty('データはまだありません。')];

  const rows = [];
  for (const account of accounts) {
    const followState = await Promise.resolve(store.getFollowState(currentUserId, account.id));
    const uiState = resolveUiState({ currentUserId, account, followState });
    const actionEl = createFollowActionButton({
      state: uiState,
      accountVisibility: account.account_visibility,
      onFollow: async () => {
        const res = await Promise.resolve(store.followUser(currentUserId, account.id));
        feedback.textContent = buildStatusText(res?.code || 'FOLLOWED');
        rerender();
      },
      onUnfollow: async () => {
        const res = await Promise.resolve(store.unfollowUser(currentUserId, account.id));
        feedback.textContent = buildStatusText(res?.code || 'UNFOLLOWED');
        rerender();
      },
      onRequest: async () => {
        const res = await Promise.resolve(store.requestFollow(currentUserId, account.id));
        feedback.textContent = buildStatusText(res?.code || 'REQUESTED');
        rerender();
      },
      onCancelRequest: async () => {
        const res = await Promise.resolve(store.cancelFollowRequest(currentUserId, account.id));
        feedback.textContent = buildStatusText(res?.code || 'REQUEST_CANCELLED');
        rerender();
      },
    });
    rows.push(createAccountListRow({ account, actionEl }));
  }
  return rows;
};

export const renderAccountConnections = (params, { navigate, store, accountState, followRequestsReturnPath }) => {
  const type = params.type;
  const status = accountState.getStatus();
  const currentUserId = status.id || 'guest';

  const container = document.createElement('section');
  container.className = 'stack';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = type === 'requests' ? '← 戻る' : '← アカウント情報へ戻る';
  back.addEventListener('click', () => navigate(type === 'requests' ? (followRequestsReturnPath || '#/account') : '#/account'));

  const title = document.createElement('h2');
  title.textContent = type === 'followers' ? 'フォロワー一覧' : type === 'following' ? 'フォロー一覧' : 'フォローリクエスト一覧';

  const feedback = document.createElement('p');
  feedback.className = 'muted';

  const list = document.createElement('div');
  list.className = 'stack';

  const isRequestList = type === 'requests';
  const tabs = isRequestList ? document.createElement('div') : null;
  const incomingTab = isRequestList ? document.createElement('button') : null;
  const outgoingTab = isRequestList ? document.createElement('button') : null;
  if (tabs && incomingTab && outgoingTab) {
    tabs.className = 'tabs';
    incomingTab.type = 'button';
    incomingTab.className = 'tab is-active';
    incomingTab.textContent = '受信';
    outgoingTab.type = 'button';
    outgoingTab.className = 'tab';
    outgoingTab.textContent = '送信済み';
    tabs.append(incomingTab, outgoingTab);
  }

  let requestDirection = 'incoming';

  const renderFollowList = async () => {
    const accounts = await Promise.resolve(type === 'followers' ? store.getFollowers(currentUserId) : store.getFollowing(currentUserId));
    const rows = await renderAccountsByIds({ accounts: accounts || [], currentUserId, store, feedback, rerender: render });
    list.innerHTML = '';
    rows.forEach((row) => list.append(row));
  };

  const renderRequestList = async () => {
    const requests = await Promise.resolve(store.listFollowRequests(currentUserId, requestDirection));
    list.innerHTML = '';
    if (!requests?.length) {
      list.append(createEmpty(requestDirection === 'incoming' ? '受信リクエストはありません。' : '送信済みリクエストはありません。'));
      return;
    }

    requests.forEach((row) => {
      const account = requestDirection === 'incoming' ? row.requester : row.target;
      const actions = requestDirection === 'incoming'
        ? createIncomingRequestActions({
          onApprove: async () => {
            const result = await Promise.resolve(store.respondFollowRequest(currentUserId, row.requester_id, 'approve'));
            feedback.textContent = buildStatusText(result?.code || 'REQUEST_ACCEPTED');
            render();
          },
          onReject: async () => {
            const result = await Promise.resolve(store.respondFollowRequest(currentUserId, row.requester_id, 'reject'));
            feedback.textContent = buildStatusText(result?.code || 'REQUEST_REJECTED');
            render();
          },
        })
        : createOutgoingRequestActions({
          onCancel: async () => {
            const result = await Promise.resolve(store.cancelFollowRequest(currentUserId, row.target_id));
            feedback.textContent = buildStatusText(result?.code || 'REQUEST_CANCELLED');
            render();
          },
        });

      list.append(createAccountListRow({ account, actionEl: actions }));
    });
  };

  const render = async () => {
    list.innerHTML = '';
    list.append(createLoading());

    try {
      if (isRequestList) {
        await renderRequestList();
      } else {
        await renderFollowList();
      }
    } catch (_error) {
      list.innerHTML = '';
      list.append(createEmpty('一覧取得に失敗しました。再読み込みしてください。'));
    }
  };

  if (incomingTab && outgoingTab) {
    incomingTab.addEventListener('click', () => {
      requestDirection = 'incoming';
      incomingTab.classList.add('is-active');
      outgoingTab.classList.remove('is-active');
      render();
    });

    outgoingTab.addEventListener('click', () => {
      requestDirection = 'outgoing';
      incomingTab.classList.remove('is-active');
      outgoingTab.classList.add('is-active');
      render();
    });
  }

  render();

  if (tabs) {
    container.append(back, title, tabs, feedback, list);
  } else {
    container.append(back, title, feedback, list);
  }
  return container;
};
