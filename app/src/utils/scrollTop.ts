import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// 현재 포커스된 화면의 "맨 위로" 동작을 전역에 등록 → 전역 FAB이 호출
export const activeScrollTop = { current: null as (() => void) | null };

export function useRegisterScrollTop(scrollToTop: () => void) {
  useFocusEffect(
    useCallback(() => {
      activeScrollTop.current = scrollToTop;
      return () => {
        if (activeScrollTop.current === scrollToTop) activeScrollTop.current = null;
      };
    }, [scrollToTop]),
  );
}
