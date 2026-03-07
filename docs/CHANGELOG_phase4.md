# Phase 4 Changelog

## Timeline fetch flow and tab consistency update

- Added timeline store state fields to stabilize async rendering:
  - `loading`
  - `error`
  - `loadedOnceByScope`
  - scope cache: `itemsByScope`, `nextBeforeByScope`
- Centralized timeline updates through `applyTimeline(...)` so scope, items, loading/error, and paging cursor are updated consistently.
- Updated `fetchTimeline({ scope, limit, before, force })` behavior:
  - head fetch (`before == null`) only auto-loads once per scope
  - loaded scope does not auto-refetch unless `force: true`
  - head fetch clears items immediately to avoid previous-tab residual cards
  - pagination (`before` set) appends with de-duplication
- Updated timeline view behavior:
  - added `更新` button to force refresh current scope
  - tab switch triggers fetch only for not-yet-loaded scope
  - already loaded scope switches instantly via scope cache
  - loading / error / empty-state are rendered explicitly
- Scope mismatch bug fix impact:
  - following ↔ global tab switches no longer show stale cards from previous scope
  - global zero-result case now renders empty-state correctly
