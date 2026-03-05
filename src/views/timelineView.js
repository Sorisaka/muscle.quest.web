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
    items: Array.isArray(state.items) ? state.items : [],
    nextBefore: state.nextBefore || null,
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
  header.append(heading, back);

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
  let likeBusy = new Set();

  const renderCards = () => {
    list.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'タイムラインに表示できる投稿がありません。';
      list.append(empty);
      return;
    }

    items.forEach((item) => {
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

      const note = document.createElement('p');
      note.className = item.note ? '' : 'muted';
      note.textContent = item.note || 'メモはありません。';

      const actions = document.createElement('div');
      actions.className = 'timeline-card__actions';

      const likeButton = document.createElement('button');
      likeButton.type = 'button';
      likeButton.className = `like-button ${item.liked ? 'is-liked' : ''}`.trim();
      likeButton.textContent = `${item.liked ? '♥' : '♡'} ${Number(item.likeCount || 0)}`;
      likeButton.disabled = likeBusy.has(item.runId);
      likeButton.addEventListener('click', async () => {
        if (likeBusy.has(item.runId)) return;
        likeBusy = new Set([...likeBusy, item.runId]);
        renderCards();
        errorText.textContent = '';
        try {
          const next = await Promise.resolve(store.toggleLike(item.runId));
          items = items.map((entry) => {
            if (entry.runId !== item.runId) return entry;
            return {
              ...entry,
              liked: Boolean(next?.liked),
              likeCount: Number(next?.likeCount ?? entry.likeCount ?? 0),
            };
          });
        } catch (error) {
          errorText.textContent = 'Like の更新に失敗しました。時間をおいて再試行してください。';
        } finally {
          const nextBusy = new Set(likeBusy);
          nextBusy.delete(item.runId);
          likeBusy = nextBusy;
          renderCards();
        }
      });

      actions.append(likeButton);
      card.append(top, meta, note, actions);
      list.append(card);
    });
  };

  const loadTimeline = async ({ append = false } = {}) => {
    if (loading) return;
    loading = true;
    loadMore.disabled = true;
    errorText.textContent = '';
    try {
      const response = await Promise.resolve(store.fetchTimeline({
        scope,
        limit: 20,
        before: append ? nextBefore : null,
      }));
      const parsed = normalizeTimelineResponse(response);
      if (append) {
        const seen = new Set(items.map((entry) => entry.runId));
        const merged = parsed.items.filter((entry) => !seen.has(entry.runId));
        items = [...items, ...merged];
      } else {
        items = parsed.items;
      }
      nextBefore = parsed.nextBefore;
      renderCards();
      loadMore.style.display = nextBefore ? '' : 'none';
    } catch (error) {
      errorText.textContent = 'タイムライン取得に失敗しました。';
    } finally {
      loading = false;
      loadMore.disabled = false;
    }
  };

  const scopes = [
    { id: 'following', label: 'フォロー中' },
    { id: 'global', label: '全体公開' },
  ];

  scopes.forEach((candidate) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `tab ${scope === candidate.id ? 'is-active' : ''}`.trim();
    tab.textContent = candidate.label;
    tab.addEventListener('click', () => {
      if (scope === candidate.id || loading) return;
      playSfx('ui:navigate');
      scope = candidate.id;
      items = [];
      nextBefore = null;
      tabs.querySelectorAll('.tab').forEach((el) => el.classList.remove('is-active'));
      tab.classList.add('is-active');
      loadTimeline({ append: false });
    });
    tabs.append(tab);
  });

  loadMore.addEventListener('click', () => {
    loadTimeline({ append: true });
  });

  container.append(header, tabs, errorText, list, loadMore);
  loadTimeline({ append: false });
  return container;
};
