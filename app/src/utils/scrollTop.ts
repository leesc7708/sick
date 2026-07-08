import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// 현재 포커스된 화면의 "맨 위로" 동작을 전역에 등록 → 전역 FAB이 호출
export const activeScrollTop = { current: null as (() => void) | null };

// ── FAB 표시 여부 전역 스토어 (스크롤을 충분히 내렸을 때만 노출) ──
// 로그인 등 스크롤 없는 화면·최상단에서는 숨겨 '미완성' 인상을 제거.
const SHOW_AFTER = 320;
let visible = false;
const listeners = new Set<() => void>();
export const fabStore = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  getSnapshot() { return visible; },
  set(v: boolean) { if (v !== visible) { visible = v; listeners.forEach((l) => l()); } },
  onScroll(y: number) { this.set(y > SHOW_AFTER); },
};

export function useRegisterScrollTop(scrollToTop: () => void) {
  useFocusEffect(
    useCallback(() => {
      activeScrollTop.current = scrollToTop;
      return () => {
        if (activeScrollTop.current === scrollToTop) activeScrollTop.current = null;
        fabStore.set(false); // 화면 이탈 시 FAB 숨김
      };
    }, [scrollToTop]),
  );
}
