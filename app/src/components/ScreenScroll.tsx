import React, { ReactNode, useCallback, useRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { useRegisterScrollTop } from '../utils/scrollTop';

// ScrollView 래퍼 — 포커스 시 "맨 위로" 동작을 전역 FAB에 자동 등록
export function ScreenScroll(props: ScrollViewProps & { children?: ReactNode }) {
  const ref = useRef<ScrollView>(null);
  const toTop = useCallback(() => ref.current?.scrollTo({ y: 0, animated: true }), []);
  useRegisterScrollTop(toTop);
  return <ScrollView ref={ref} {...props} />;
}
