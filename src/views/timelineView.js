import { defaultHistoryFilter, filterRuns, getRunTags } from '../core/historyFilters.js';
import { createHistoryFilterControls, HISTORY_CATEGORY_LABELS, toMuscleLabel } from '../ui/historyFilterControls.js';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const getExerciseCountLabel = (result) => {
  const exercises = result?.exercises;
  if (Array.isArray(exercises) && exercises.length) {
    return `種目数: ${exercises.length}`;
  }
  return '';
};

const normalizeTimelineResponse = (timelineState) => {
  const state = timelineState || {};
  return {
    scope: state.scope || 'following',
    items: Array.isArray(state.items) ? state.items : [],
    nextBefore: state.nextBefore || null,
    loading: Boolean(state.loading),
    error: state.error || null,
    loadedOnceByScope: {
      following: Boolean(state.loadedOnceByScope?.following),
      global: Boolean(state.loadedOnceByScope?.global),
    },
    itemsByScope: {
      following: Array.isArray(state.itemsByScope?.following) ? state.itemsByScope.following : [],
      global: Array.isArray(state.itemsByScope?.global) ? state.itemsByScope.global : [],
    },
    nextBeforeByScope: {
      following: state.nextBeforeByScope?.following || null,
      global: state.nextBeforeByScope?.global || null,
    },
  };
};

export const renderTimeline = (_params, { navigate, playSfx, store }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const header = document.createElement('div');
  header.className = 'list-header';
  const heading = document.createElement('h2');
  heading.textContent = 'Timeline';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  const refreshButton = document.createElement('button');
  refreshButton.type = 'button';
  refreshButton.className = 'ghost';
  refreshButton.textContent = '更新';

  header.append(heading, refreshButton, back);

  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  const errorText = document.createElement('p');
  errorText.className = 'muted';

  const list = document.createElement('div');
  list.className = 'stack';

  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.className = 'ghost';
  loadMore.textContent = 'もっと見る';

  let scope = 'following';
  let items = [];
  let nextBefore = null;
  let loading = false;
  let error = null;
  let loadedOnceByScope = { following: false, global: false };
  let itemsByScope = { following: [], global: [] };
  let nextBeforeByScope = { following: null, global: null };
  let likeBusy = new Set();
  let filterState = { ...defaultHistoryFilter };

  const syncFromStore = () => {
    const parsed = normalizeTimelineResponse(store.getTimelineState());
    scope = parsed.scope;
    items = parsed.items;
    nextBefore = parsed.nextBefore;
    loading = parsed.loading;
    error = parsed.error;
    loadedOnceByScope = parsed.loadedOnceByScope;
    itemsByScope = parsed.itemsByScope;
    nextBeforeByScope = parsed.nextBeforeByScope;
  };

  const updateActiveTab = () => {
    tabs.querySelectorAll('.tab').forEach((el) => {
      const active = el.dataset.scope === scope;
      el.classList.toggle('is-active', active);
    });
  };

  const renderCards = () => {
    list.innerHTML = '';

    if (loading && !items.length) {
      const busy = document.createElement('p');
      busy.className = 'muted';
      busy.textContent = 'タイムラインを読み込み中...';
      list.append(busy);
      return;
    }

    const filteredItems = filterRuns(items, filterState);

    if (!filteredItems.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'タイムラインに表示できる投稿がありません。';
      list.append(empty);
      return;
    }

    filteredItems.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card timeline-card';

      const top = document.createElement('div');
      top.className = 'timeline-card__top';

      const author = document.createElement('strong');
      author.textContent = item.authorDisplayName || 'Unknown';

      const date = document.createElement('span');
      date.className = 'muted';
      date.textContent = formatDateTime(item.publishedAt || item.createdAt);
      top.append(author, date);

      const meta = document.createElement('div');
      meta.className = 'timeline-card__meta';
      meta.append(
        (() => {
          const calories = document.createElement('span');
          calories.className = 'pill';
          calories.textContent = `${Number(item.calories || 0)} kcal`;
          return calories;
        })(),
      );

      const exerciseLabel = getExerciseCountLabel(item.result);
      if (exerciseLabel) {
        const ex = document.createElement('span');
        ex.className = 'pill';
        ex.textContent = exerciseLabel;
        meta.append(ex);
      }

      const tags = getRunTags(item.result || item);
      const tagLine = document.createElement('p');
      tagLine.className = 'muted';
      tagLine.textContent = `${HISTORY_CATEGORY_LABELS[tags.category] || HISTORY_CATEGORY_LABELS.unknown} / ${(tags.muscles || []).map(toMuscleLabel).join('・') || '未設定'}`;

      const note = document.createElement('p');
      note.className = item.note ? '' : 'muted';
      note.textContent = item.note || 'メモはありません。';

      const actions = document.createElement('div');
      actions.className = 'timeline-card__actions';

      const likeButton = document.createElement('button');
      likeButton.type = 'button';
      likeButton.className = `like-button ${item.liked ? 'is-liked' : ''}`.trim();
      likeButton.textContent = `${item.liked ? '♥' : '♡'} ${Number(item.likeCount || 0)}`;
      likeButton.disabled = likeBusy.has(item.runId) || loading;
      likeButton.addEventListener('click', async () => {
        if (likeBusy.has(item.runId)) return;
        likeBusy = new Set([...likeBusy, item.runId]);
        render();
        try {
          await Promise.resolve(store.toggleLike(item.runId));
          syncFromStore();
        } catch (likeError) {
          error = 'Like の更新に失敗しました。時間をおいて再試行してください。';
        } finally {
          const nextBusy = new Set(likeBusy);
          nextBusy.delete(item.runId);
          likeBusy = nextBusy;
          render();
        }
      });

      actions.append(likeButton);
      card.append(top, meta, tagLine, note, actions);
      list.append(card);
    });
  };

  const render = () => {
    updateActiveTab();
    errorText.textContent = error || '';
    refreshButton.disabled = loading;
    refreshButton.textContent = loading ? '更新中...' : '更新';
    loadMore.disabled = loading || !nextBefore;
    loadMore.style.display = nextBefore ? '' : 'none';
    renderCards();
  };

  const loadTimeline = async ({ append = false, force = false } = {}) => {
    if (loading) return;
    error = null;
    render();
    try {
      const pending = Promise.resolve(store.fetchTimeline({
        scope,
        limit: 20,
        before: append ? nextBefore : null,
        force,
      }));
      syncFromStore();
      render();
      await pending;
      syncFromStore();
      render();
    } catch (timelineError) {
      syncFromStore();
      error = timelineError?.message || error || 'タイムライン取得に失敗しました。';
      render();
    }
  };

  const scopes = [
    { id: 'following', label: 'フォロー中' },
    { id: 'global', label: '全体公開' },
  ];

  scopes.forEach((candidate) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.dataset.scope = candidate.id;
    tab.className = `tab ${scope === candidate.id ? 'is-active' : ''}`.trim();
    tab.textContent = candidate.label;
    tab.addEventListener('click', () => {
      if (scope === candidate.id || loading) return;
      playSfx('ui:navigate');
      scope = candidate.id;
      const loaded = Boolean(loadedOnceByScope[candidate.id]);
      if (loaded) {
        const state = normalizeTimelineResponse(store.getTimelineState());
        items = state.itemsByScope[scope] || [];
        nextBefore = state.nextBeforeByScope[scope] || null;
        loading = false;
        error = null;
        render();
        return;
      }
      loadTimeline({ append: false });
    });
    tabs.append(tab);
  });

  refreshButton.addEventListener('click', () => {
    loadTimeline({ append: false, force: true });
  });

  loadMore.addEventListener('click', () => {
    loadTimeline({ append: true });
  });

  const filterSlot = document.createElement('div');
  const renderFilter = () => {
    filterSlot.innerHTML = '';
    filterSlot.append(createHistoryFilterControls({ state: filterState, onChange: (next) => { filterState = { ...next }; render(); }, title: '絞り込み', cardClassName: 'card stack' }));
  };
  renderFilter();

  container.append(header, tabs, filterSlot, errorText, list, loadMore);

  syncFromStore();
  render();
  if (!loadedOnceByScope[scope]) {
    loadTimeline({ append: false });
  }

  return container;
};
