import React, { ReactNode, useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, ScrollViewProps } from 'react-native';
import { useRegisterScrollTop, fabStore } from '../utils/scrollTop';

// ScrollView 래퍼 — 포커스 시 "맨 위로" 동작을 전역 FAB에 자동 등록 + 스크롤량으로 FAB 노출 제어
export function ScreenScroll(props: ScrollViewProps & { children?: ReactNode }) {
  const ref = useRef<ScrollView>(null);
  const toTop = useCallback(() => {
    ref.current?.scrollTo({ y: 0, animated: true });
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  useRegisterScrollTop(toTop);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    fabStore.onScroll(e.nativeEvent.contentOffset.y);
    props.onScroll?.(e);
  };
  return <ScrollView ref={ref} scrollEventThrottle={16} {...props} onScroll={onScroll} />;
}
