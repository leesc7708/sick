export interface RedFlagRule {
  id: string;
  label: string;
  keywords: string[];
  combinationRequired?: string[][];
  reason: string;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'chest_pain_dyspnea',
    label: '흉통 + 호흡곤란',
    keywords: ['가슴', '흉통', '심장', '쥐어짜', '뻐근'],
    combinationRequired: [['숨', '호흡', '숨차']],
    reason: '흉통과 호흡곤란이 함께 나타나면 심근경색 등 응급 상황일 수 있습니다.',
  },
  {
    id: 'worst_headache',
    label: '인생 최악의 두통',
    keywords: ['인생 최악', '벼락', '벼락치듯', '갑자기 머리', '머리가 터질'],
    reason: '갑자기 발생한 심한 두통은 뇌출혈/지주막하 출혈의 신호일 수 있습니다.',
  },
  {
    id: 'consciousness',
    label: '의식 변화/혼돈',
    keywords: ['의식이 없', '의식을 잃', '혼미', '혼돈', '말이 어눌', '못 알아보'],
    reason: '의식 변화는 즉시 응급실 평가가 필요한 신경학적 응급 신호입니다.',
  },
  {
    id: 'meningitis',
    label: '발열 + 목 경직',
    keywords: ['목이 뻣뻣', '목 경직', '고개를 못', '경부 강직'],
    combinationRequired: [['열', '발열', '고열']],
    reason: '발열과 함께 목이 뻣뻣하면 수막염 가능성이 있어 즉시 진료가 필요합니다.',
  },
  {
    id: 'rebound_tenderness',
    label: '심한 복통 + 반발통',
    keywords: ['배를 누르고 떼면', '반발통', '복부 강직', '배가 돌처럼'],
    reason: '복막염 등 외과적 응급 상황의 신호일 수 있습니다.',
  },
  {
    id: 'stroke',
    label: '뇌졸중 의심',
    keywords: ['한쪽 마비', '한쪽 팔', '한쪽 다리', '얼굴 마비', '입이 돌아', '발음이', '말이 안 나'],
    reason: '편측 마비/언어장애/안면마비는 뇌졸중 의심 증상으로 골든타임이 중요합니다.',
  },
  {
    id: 'anaphylaxis',
    label: '아나필락시스',
    keywords: ['두드러기', '발진', '입술 부어', '얼굴 부어', '목이 부어'],
    combinationRequired: [['숨', '호흡', '쌕쌕'], ['어지', '쓰러', '의식']],
    reason: '발진과 함께 호흡곤란/어지러움이 있으면 아나필락시스 가능성이 있습니다.',
  },
  {
    id: 'severe_bleeding',
    label: '심한 출혈',
    keywords: ['피가 멈추지', '대량 출혈', '피를 토', '검은 변', '혈변'],
    reason: '심한 출혈은 즉시 응급 평가가 필요합니다.',
  },
  {
    id: 'infant_fever_consciousness',
    label: '영유아 고열 + 의식저하',
    keywords: ['아이가 늘어', '아기가 처져', '아이 의식', '깨워도 안'],
    combinationRequired: [['열', '고열', '39도', '40도']],
    reason: '영유아의 고열과 의식 저하는 즉시 응급실 방문이 필요합니다.',
  },
];

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

export function detectRedFlag(text: string): { triggered: boolean; reason?: string; rule?: RedFlagRule } {
  const lower = text.toLowerCase();
  for (const rule of RED_FLAG_RULES) {
    if (!includesAny(lower, rule.keywords)) continue;
    if (rule.combinationRequired && rule.combinationRequired.length > 0) {
      const allGroupsHit = rule.combinationRequired.every((group) => includesAny(lower, group));
      if (!allGroupsHit) continue;
    }
    return { triggered: true, reason: rule.reason, rule };
  }
  return { triggered: false };
}
