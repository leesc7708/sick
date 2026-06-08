import { SymptomMemo } from '../types';

export type Urgency = 'red' | 'yellow' | 'gray';
export interface UrgencyResult {
  level: Urgency;
  title: string;
  message: string;
}

const RISK_WORK = ['밀폐공간', '화학물질 취급'];
const GAS_RE = /가스|질식|매캐|냄새|중독|연기/;

// 입력 기반 위급도 판단 (규칙 기반, 진단 아님)
export function assessUrgency(m: SymptomMemo): UrgencyResult {
  const acc = m.accompanying;
  const sev = m.severity ?? 0;
  const gasSuspect = GAS_RE.test(m.concern ?? '');

  const red =
    acc.includes('호흡곤란') ||
    (m.bodyParts.includes('가슴') && (acc.includes('호흡곤란') || acc.includes('어지럼') || sev >= 6)) ||
    (m.atWork && RISK_WORK.includes(m.workType ?? '') &&
      (acc.includes('어지럼') || acc.includes('메스꺼움') || acc.includes('구토') || acc.includes('호흡곤란') || gasSuspect)) ||
    gasSuspect ||
    sev >= 8 ||
    (m.bodyParts.includes('머리') && sev >= 7);

  if (red) {
    return {
      level: 'red',
      title: '지금 응급 상황일 수 있어요',
      message: '즉시 119에 연락하거나 가까운 응급실로 가세요. 동료·관리자에게 알리고 혼자 있지 마세요.',
    };
  }
  if (acc.length > 0 || sev >= 5) {
    return {
      level: 'yellow',
      title: '빠른 진료가 필요해요',
      message: '증상이 지속되거나 심해지면 곧바로 의료기관에서 진료받으세요.',
    };
  }
  return {
    level: 'gray',
    title: '경과를 지켜보세요',
    message: '증상이 심해지거나 새로 생기면 즉시 의료기관을 방문하세요.',
  };
}

// 지금 할 수 있는 대처 (일반 응급조치 안내, 처방 아님)
export function careActions(m: SymptomMemo): string[] {
  const out: string[] = [];
  const acc = m.accompanying;
  const gasSuspect = GAS_RE.test(m.concern ?? '');

  if (m.atWork && (m.workType === '밀폐공간' || gasSuspect)) {
    out.push('즉시 신선한 공기가 있는 곳으로 이동하세요. (무리하지 말고 주변에 도움을 요청)');
    out.push('보호구·조이는 옷을 느슨하게 하고 의식·호흡을 확인하세요.');
  }
  if (m.workType === '화학물질 취급' || gasSuspect) {
    out.push('피부·눈에 닿았다면 흐르는 물로 15분 이상 충분히 씻으세요.');
  }
  if (acc.includes('호흡곤란')) out.push('상체를 세워 편하게 앉고, 즉시 119에 연락하세요.');
  if (m.bodyParts.includes('가슴')) out.push('편한 자세로 안정을 취하고, 몸을 조이는 것을 푸세요.');
  if (acc.includes('열') || acc.includes('오한')) out.push('시원한 곳에서 휴식하고 수분을 충분히 드세요.');
  if (acc.includes('어지럼')) out.push('그 자리에 앉거나 누워 안정을 취하고, 갑자기 일어나지 마세요.');
  if (acc.includes('구토')) out.push('옆으로 눕혀 기도를 확보하고, 수분을 소량씩 드세요.');
  if (acc.includes('설사')) out.push('수분·전해질을 자주 보충하세요.');
  if (acc.includes('출혈')) out.push('깨끗한 천으로 출혈 부위를 직접 눌러 지혈하세요.');

  if (out.length === 0) out.push('무리한 작업을 멈추고 안정을 취하세요.');
  out.push('증상이 심하거나 나아지지 않으면 병원 진료 또는 119에 문의하세요.');
  return out;
}
