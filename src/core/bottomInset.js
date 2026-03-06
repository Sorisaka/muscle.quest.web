const KEYBOARD_THRESHOLD = 140;

const setViewportVars = ({ navHeight = 70 } = {}) => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const innerHeight = window.innerHeight || 0;
  const viewportHeight = viewport?.height || innerHeight;
  const viewportTop = viewport?.offsetTop || 0;

  const occupiedBottom = Math.max(0, Math.round(innerHeight - (viewportHeight + viewportTop)));
  const keyboardVisible = occupiedBottom > KEYBOARD_THRESHOLD;
  const browserUiOffset = keyboardVisible ? 0 : occupiedBottom;
  const appVisibleHeight = Math.max(320, Math.round(viewportHeight + viewportTop));

  root.style.setProperty('--browser-ui-offset', `${browserUiOffset}px`);
  root.style.setProperty('--keyboard-visible', keyboardVisible ? '1' : '0');
  root.style.setProperty('--bottom-nav-height', `${navHeight}px`);
  root.style.setProperty('--app-visible-height', `${appVisibleHeight}px`);
};

export const initBottomInsetSync = ({ navEl }) => {
  let rafId = 0;

  const update = () => {
    const navHeight = Math.round(navEl?.getBoundingClientRect?.().height || navEl?.offsetHeight || 70);
    setViewportVars({ navHeight });
  };

  const withRaf = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      update();
    });
  };

  window.addEventListener('resize', withRaf);
  window.addEventListener('orientationchange', withRaf);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', withRaf);
    window.visualViewport.addEventListener('scroll', withRaf);
  }

  update();

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('resize', withRaf);
    window.removeEventListener('orientationchange', withRaf);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', withRaf);
      window.visualViewport.removeEventListener('scroll', withRaf);
    }
  };
};
