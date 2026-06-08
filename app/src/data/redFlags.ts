import { RedFlagItem, RedFlagResult } from '../types';

// 규칙 기반 응급 신호 체크리스트 (AI 단독판단 금지)
export const RED_FLAGS: RedFlagItem[] = [
  // 일반
  { id: 'chest', label: '가슴 통증 + 숨이 참', group: 'general', critical: true },
  { id: 'headache', label: '갑자기 생긴 매우 심한 두통', group: 'general', critical: true },
  { id: 'consciousness', label: '의식이 흐리거나 혼미함', group: 'general', critical: true },
  { id: 'paralysis', label: '한쪽 팔다리 마비·말이 어눌함', group: 'general', critical: true },
  { id: 'allergy', label: '심한 알레르기 반응 + 호흡곤란', group: 'general', critical: true },
  { id: 'bleeding', label: '멈추지 않는 출혈', group: 'general', critical: true },
  { id: 'fever', label: '고열과 함께 의식 저하', group: 'general', critical: true },
  { id: 'abdomen', label: '참기 힘든 심한 복통', group: 'general', critical: false },
  // 산업현장
  { id: 'confined', label: '밀폐공간에서 어지럼·메스꺼움', group: 'work', critical: true },
  { id: 'chemical', label: '화학물질이 눈·피부에 닿음', group: 'work', critical: true },
  { id: 'heat', label: '고온 작업 중 어지럼·탈진', group: 'work', critical: false },
  { id: 'fall', label: '추락·협착 후 통증·움직임 곤란', group: 'work', critical: true },
  { id: 'gas', label: '가스·분진 흡입 후 호흡곤란', group: 'work', critical: true },
  { id: 'shock', label: '감전 후 이상 증상', group: 'work', critical: true },
];

export function evaluateRedFlags(ids: string[]): RedFlagResult {
  const items = RED_FLAGS.filter((f) => ids.includes(f.id));
  if (items.some((f) => f.critical)) {
    return {
      level: 'red',
      selectedIds: ids,
      title: '응급 신호가 있을 수 있습니다',
      message: '즉시 119에 연락하거나 가까운 응급실을 확인하세요. 가능하면 동료·관리자에게 알리세요.',
    };
  }
  if (items.length > 0) {
    return {
      level: 'yellow',
      selectedIds: ids,
      title: '빠른 진료를 권합니다',
      message: '증상이 지속되거나 심해지면 가까운 의료기관에서 진료받으세요.',
    };
  }
  return {
    level: 'gray',
    selectedIds: ids,
    title: '응급 신호는 뚜렷하지 않습니다',
    message: '증상이 심해지거나 새로 생기면 즉시 의료기관을 방문하세요. 증상 메모를 이어서 작성할 수 있습니다.',
  };
}
