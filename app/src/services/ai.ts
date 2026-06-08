import { SymptomAnalysis, SymptomQuery, UserProfile } from '../types';
import { detectRedFlag } from '../data/redFlagKeywords';
import { storage } from './storage';

const DISCLAIMER =
  '⚠️ 본 정보는 참고용이며 의료 전문가의 진단을 대체하지 않습니다. 정확한 진단을 위해 의료기관을 방문하세요.';

const SYSTEM_PROMPT = `당신은 "어디아파" 앱의 건강 정보 가이드입니다.

중요한 규칙:
1. 절대 "진단", "처방", "추천" 같은 표현을 쓰지 마세요.
2. 대신 "관련 가능 상태(참고용)", "관련 진료과 안내", "정보 제공"이라는 표현을 쓰세요.
3. 응급 증상이 의심되면 isRedFlag를 true로 하고 즉시 응급실 안내가 필요한 이유를 설명하세요.
4. 모든 응답은 한국어로, 일반인이 이해할 수 있는 쉬운 표현으로 작성하세요.
5. 사용자의 연령, 기저질환, 복용약, 임부/수유부 여부를 반드시 고려하세요.

반드시 다음 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "isRedFlag": boolean,
  "redFlagReason": string | null,
  "possibleConditions": [
    { "name": "상태명 (참고용)", "probability": "high"|"medium"|"low", "description": "설명" }
  ],
  "recommendedDepartments": ["진료과1", "진료과2"],
  "selfCare": ["자가관리 팁1", "자가관리 팁2"],
  "urgency": "emergency"|"urgent"|"soon"|"routine"
}`;

function buildUserPrompt(query: SymptomQuery, profile: UserProfile | null): string {
  const lines: string[] = [];
  lines.push(`[증상 설명]\n${query.text}`);
  if (query.bodyParts.length > 0) lines.push(`[증상 부위] ${query.bodyParts.join(', ')}`);
  if (query.intensity) lines.push(`[통증 강도] ${query.intensity}/10`);
  if (query.duration) lines.push(`[지속 시간] ${query.duration}`);
  if (query.additional && query.additional.length > 0) {
    lines.push(`[추가 증상] ${query.additional.join(', ')}`);
  }

  if (profile) {
    lines.push('\n[사용자 정보]');
    lines.push(`- 연령: ${profile.age}세`);
    lines.push(`- 성별: ${profile.gender === 'male' ? '남' : profile.gender === 'female' ? '여' : '기타'}`);
    if (profile.isPregnant) lines.push('- 임신 중');
    if (profile.isLactating) lines.push('- 수유 중');
    if (profile.conditions.length > 0) lines.push(`- 기저질환: ${profile.conditions.join(', ')}`);
    if (profile.allergies.length > 0) lines.push(`- 알레르기: ${profile.allergies.join(', ')}`);
    if (profile.currentMedicines.length > 0) lines.push(`- 복용약: ${profile.currentMedicines.join(', ')}`);
  }

  return lines.join('\n');
}

interface MockPattern {
  id: string;
  keywords: string[];
  bodyParts?: string[];
  analysis: Omit<SymptomAnalysis, 'disclaimer' | 'isRedFlag'>;
}

const MOCK_PATTERNS: MockPattern[] = [
  {
    id: 'headache',
    keywords: ['머리', '두통', '편두통', '머리가 아'],
    bodyParts: ['머리'],
    analysis: {
      possibleConditions: [
        { name: '긴장성 두통 관련 (참고용)', probability: 'high', description: '스트레스나 자세에서 오는 흔한 두통입니다.' },
        { name: '편두통 관련 (참고용)', probability: 'medium', description: '한쪽 머리가 박동성으로 아픈 두통입니다.' },
        { name: '부비동염 관련 (참고용)', probability: 'low', description: '얼굴 압통이 함께 있다면 가능성이 있습니다.' },
      ],
      recommendedDepartments: ['신경과', '이비인후과', '가정의학과'],
      selfCare: ['충분한 수분 섭취', '어두운 곳에서 휴식', '카페인 섭취 줄이기', '규칙적인 수면'],
      urgency: 'routine',
    },
  },
  {
    id: 'abdomen',
    keywords: ['배가', '복통', '속이', '명치', '윗배', '아랫배', '설사', '구토', '메스꺼'],
    bodyParts: ['배'],
    analysis: {
      possibleConditions: [
        { name: '소화불량 관련 (참고용)', probability: 'high', description: '과식이나 자극적 음식 섭취 후 흔히 나타납니다.' },
        { name: '위염 관련 (참고용)', probability: 'medium', description: '공복 또는 식후 통증이 반복된다면 가능합니다.' },
        { name: '장염 관련 (참고용)', probability: 'medium', description: '설사/구토가 동반되면 가능성이 있습니다.' },
      ],
      recommendedDepartments: ['내과', '소화기내과'],
      selfCare: ['미음/죽 등 부드러운 식이', '카페인/매운 음식 피하기', '수분 보충', '복부 따뜻하게'],
      urgency: 'soon',
    },
  },
  {
    id: 'cold',
    keywords: ['기침', '가래', '콧물', '재채기', '코막힘', '인후통', '목이 아', '편도'],
    bodyParts: ['귀/코/목'],
    analysis: {
      possibleConditions: [
        { name: '감기 관련 (참고용)', probability: 'high', description: '바이러스성 상기도 감염일 가능성이 높습니다.' },
        { name: '인후염 관련 (참고용)', probability: 'medium', description: '목 통증과 함께 발열이 있다면 가능합니다.' },
        { name: '알레르기 비염 관련 (참고용)', probability: 'low', description: '재채기/콧물이 주된 증상이면 가능합니다.' },
      ],
      recommendedDepartments: ['이비인후과', '내과'],
      selfCare: ['따뜻한 물 자주 섭취', '실내 가습', '충분한 휴식', '손 자주 씻기'],
      urgency: 'routine',
    },
  },
  {
    id: 'skin',
    keywords: ['피부', '두드러기', '가려', '발진', '뾰루지', '여드름', '습진'],
    bodyParts: ['피부'],
    analysis: {
      possibleConditions: [
        { name: '접촉성 피부염 관련 (참고용)', probability: 'high', description: '특정 물질 접촉 후 발생하는 염증입니다.' },
        { name: '두드러기 관련 (참고용)', probability: 'medium', description: '알레르기 반응으로 나타날 수 있습니다.' },
        { name: '습진 관련 (참고용)', probability: 'low', description: '만성적으로 반복된다면 가능합니다.' },
      ],
      recommendedDepartments: ['피부과', '알레르기내과'],
      selfCare: ['시원한 물로 진정', '긁지 않기', '보습 유지', '의심 물질 회피'],
      urgency: 'soon',
    },
  },
  {
    id: 'joint',
    keywords: ['관절', '무릎', '어깨', '팔꿈치', '발목', '손목', '아킬레스', '인대', '연골', '관절염', '욱신'],
    bodyParts: ['팔/손', '다리/발'],
    analysis: {
      possibleConditions: [
        { name: '근육통/염좌 관련 (참고용)', probability: 'high', description: '무리한 사용이나 외상 후 흔히 나타납니다.' },
        { name: '건염 관련 (참고용)', probability: 'medium', description: '반복적 동작으로 인한 힘줄 염증일 수 있습니다.' },
        { name: '관절염 관련 (참고용)', probability: 'low', description: '만성적으로 반복되거나 부종이 있다면 가능합니다.' },
      ],
      recommendedDepartments: ['정형외과', '재활의학과'],
      selfCare: ['휴식 (무리한 사용 자제)', '냉찜질 (급성기)', '온찜질 (만성기)', '체중 부하 줄이기'],
      urgency: 'soon',
    },
  },
  {
    id: 'back',
    keywords: ['허리', '등이', '척추', '디스크', '요통', '담', '담에 걸'],
    bodyParts: ['등/허리'],
    analysis: {
      possibleConditions: [
        { name: '근막통증 관련 (참고용)', probability: 'high', description: '자세나 근육 긴장에서 오는 통증입니다.' },
        { name: '디스크 관련 (참고용)', probability: 'medium', description: '다리 저림이 동반되면 가능성이 있습니다.' },
        { name: '척추 압박 관련 (참고용)', probability: 'low', description: '고령이거나 외상 후라면 가능합니다.' },
      ],
      recommendedDepartments: ['정형외과', '신경외과', '재활의학과'],
      selfCare: ['바른 자세 유지', '스트레칭', '무거운 물건 들기 피하기', '온찜질'],
      urgency: 'soon',
    },
  },
  {
    id: 'eye',
    keywords: ['눈이', '눈물', '눈곱', '눈 충혈', '시야', '안구', '눈꺼풀', '다래끼'],
    bodyParts: ['눈'],
    analysis: {
      possibleConditions: [
        { name: '결막염 관련 (참고용)', probability: 'high', description: '바이러스/세균/알레르기성 염증일 수 있습니다.' },
        { name: '안구건조증 관련 (참고용)', probability: 'medium', description: '화면 작업이 많을 경우 흔합니다.' },
        { name: '다래끼 관련 (참고용)', probability: 'low', description: '눈꺼풀 부종이 있다면 가능합니다.' },
      ],
      recommendedDepartments: ['안과'],
      selfCare: ['눈 비비지 않기', '인공눈물 사용', '화면 휴식 (20-20-20 규칙)', '청결 유지'],
      urgency: 'soon',
    },
  },
  {
    id: 'ear',
    keywords: ['귀가', '귀 아', '귀에서', '이명', '귀 막', '청력'],
    bodyParts: ['귀/코/목'],
    analysis: {
      possibleConditions: [
        { name: '중이염 관련 (참고용)', probability: 'high', description: '감기 이후나 어린 연령에서 흔합니다.' },
        { name: '외이도염 관련 (참고용)', probability: 'medium', description: '귀 청소 후나 물이 들어간 후 가능합니다.' },
        { name: '이관 기능장애 관련 (참고용)', probability: 'low', description: '비행기 탑승 후 등에 나타날 수 있습니다.' },
      ],
      recommendedDepartments: ['이비인후과'],
      selfCare: ['귀 후비지 않기', '물 들어가지 않게', '코를 너무 세게 풀지 않기'],
      urgency: 'soon',
    },
  },
  {
    id: 'tooth',
    keywords: ['이가', '치아', '잇몸', '치통', '충치', '시린'],
    bodyParts: ['입/치아'],
    analysis: {
      possibleConditions: [
        { name: '충치 관련 (참고용)', probability: 'high', description: '차거나 단 것에 민감하면 가능성이 높습니다.' },
        { name: '치주염 관련 (참고용)', probability: 'medium', description: '잇몸 부종/출혈이 있다면 가능합니다.' },
        { name: '지각과민 관련 (참고용)', probability: 'low', description: '시린 증상이 주된 경우 가능합니다.' },
      ],
      recommendedDepartments: ['치과'],
      selfCare: ['미지근한 물로 양치', '단단한 음식 피하기', '치실 사용', '치과 방문 권장'],
      urgency: 'soon',
    },
  },
  {
    id: 'urinary',
    keywords: ['소변', '방광', '배뇨', '오줌', '요로', '잔뇨', '빈뇨'],
    bodyParts: ['비뇨/생식기'],
    analysis: {
      possibleConditions: [
        { name: '방광염 관련 (참고용)', probability: 'high', description: '여성에게 흔하며 배뇨 시 통증/잔뇨감이 특징입니다.' },
        { name: '요로결석 관련 (참고용)', probability: 'medium', description: '옆구리 통증이 동반되면 가능성이 있습니다.' },
        { name: '전립선 관련 (참고용)', probability: 'low', description: '중년 이상 남성에서 빈뇨가 있다면 가능합니다.' },
      ],
      recommendedDepartments: ['비뇨의학과', '산부인과'],
      selfCare: ['수분 충분히 섭취', '소변을 참지 않기', '청결 유지'],
      urgency: 'soon',
    },
  },
  {
    id: 'mental',
    keywords: ['우울', '불안', '잠이 안', '불면', '잠을 못', '공황', '스트레스', '집중이 안'],
    bodyParts: ['정신/수면'],
    analysis: {
      possibleConditions: [
        { name: '스트레스 반응 관련 (참고용)', probability: 'high', description: '일시적인 스트레스 반응일 수 있습니다.' },
        { name: '불안/우울 관련 (참고용)', probability: 'medium', description: '2주 이상 지속되면 전문가 상담을 권장합니다.' },
        { name: '수면장애 관련 (참고용)', probability: 'low', description: '수면 위생이 무너졌을 가능성이 있습니다.' },
      ],
      recommendedDepartments: ['정신건강의학과'],
      selfCare: ['규칙적인 수면', '카페인/알코올 줄이기', '가벼운 운동', '필요시 전문 상담'],
      urgency: 'routine',
    },
  },
  {
    id: 'fever',
    keywords: ['열이', '발열', '오한', '몸살', '미열', '고열'],
    analysis: {
      possibleConditions: [
        { name: '바이러스 감염 관련 (참고용)', probability: 'high', description: '감기/독감 등 일반적인 바이러스 감염일 수 있습니다.' },
        { name: '세균 감염 관련 (참고용)', probability: 'medium', description: '3일 이상 지속되거나 고열이면 가능성이 있습니다.' },
      ],
      recommendedDepartments: ['내과', '가정의학과'],
      selfCare: ['수분 충분히', '미온수 마사지', '해열제 (약사 상담 후)', '충분한 휴식'],
      urgency: 'soon',
    },
  },
  {
    id: 'chest',
    keywords: ['가슴', '심장이', '두근', '심계', '흉부'],
    bodyParts: ['가슴'],
    analysis: {
      possibleConditions: [
        { name: '근골격계 통증 관련 (참고용)', probability: 'high', description: '자세나 근육 긴장에서 오는 흉벽 통증일 수 있습니다.' },
        { name: '역류성 식도염 관련 (참고용)', probability: 'medium', description: '식후 가슴쓰림이 있다면 가능합니다.' },
        { name: '심혈관 관련 (참고용)', probability: 'low', description: '운동 시 악화되거나 호흡곤란 동반 시 즉시 진료가 필요합니다.' },
      ],
      recommendedDepartments: ['내과', '심장내과'],
      selfCare: ['편한 자세로 휴식', '카페인/자극적 음식 피하기', '증상 악화 시 즉시 진료'],
      urgency: 'soon',
    },
  },
];

function matchPattern(text: string, bodyParts: string[]): MockPattern | undefined {
  const lower = text.toLowerCase();
  // 1차: 텍스트 키워드 매칭
  const byText = MOCK_PATTERNS.find((p) => p.keywords.some((k) => lower.includes(k.toLowerCase())));
  if (byText) return byText;
  // 2차: 신체 부위 매칭
  if (bodyParts.length > 0) {
    const byBody = MOCK_PATTERNS.find((p) => p.bodyParts?.some((bp) => bodyParts.includes(bp)));
    if (byBody) return byBody;
  }
  return undefined;
}

function mockAnalyze(query: SymptomQuery, profile: UserProfile | null): SymptomAnalysis {
  const redFlag = detectRedFlag(query.text);
  if (redFlag.triggered) {
    return {
      isRedFlag: true,
      redFlagReason: redFlag.reason,
      possibleConditions: [],
      recommendedDepartments: ['응급의학과'],
      selfCare: [],
      urgency: 'emergency',
      disclaimer: DISCLAIMER,
    };
  }

  const matched = matchPattern(query.text, query.bodyParts);
  if (matched) {
    return { isRedFlag: false, ...matched.analysis, disclaimer: DISCLAIMER };
  }

  // 기본 응답 (매칭되지 않은 경우)
  return {
    isRedFlag: false,
    possibleConditions: [
      {
        name: '여러 원인 가능 (참고용)',
        probability: 'medium',
        description: '증상 정보가 일반적이어서 다양한 원인이 있을 수 있습니다. 증상이 지속되면 의료기관 방문을 권장합니다.',
      },
    ],
    recommendedDepartments: ['가정의학과', '내과'],
    selfCare: ['충분한 휴식', '수분 섭취', '증상 변화 관찰'],
    urgency: 'soon',
    disclaimer: DISCLAIMER,
  };
}

async function realAnalyze(
  query: SymptomQuery,
  profile: UserProfile | null,
  apiKey: string,
): Promise<SymptomAnalysis> {
  // Anthropic SDK는 RN 환경에서 fetch 기반으로 동작 가능
  const userPrompt = buildUserPrompt(query, profile);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API 오류: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = (data.content?.[0]?.text ?? '').trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd < 0) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }
  const json = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  return {
    isRedFlag: !!json.isRedFlag,
    redFlagReason: json.redFlagReason ?? undefined,
    possibleConditions: json.possibleConditions ?? [],
    recommendedDepartments: json.recommendedDepartments ?? [],
    selfCare: json.selfCare ?? [],
    urgency: json.urgency ?? 'routine',
    disclaimer: DISCLAIMER,
  };
}

export async function analyzeSymptom(query: SymptomQuery): Promise<SymptomAnalysis> {
  const profile = await storage.getProfile();
  const mode = await storage.getAiMode();

  // Red Flag는 mode와 관계없이 항상 클라이언트에서 1차 검출 (안전망)
  const redFlag = detectRedFlag(query.text);
  if (redFlag.triggered) {
    return {
      isRedFlag: true,
      redFlagReason: redFlag.reason,
      possibleConditions: [],
      recommendedDepartments: ['응급의학과'],
      selfCare: [],
      urgency: 'emergency',
      disclaimer: DISCLAIMER,
    };
  }

  if (mode === 'real') {
    const apiKey = await storage.getApiKey();
    if (!apiKey) {
      throw new Error('Claude API 키가 설정되지 않았습니다. 설정 화면에서 키를 등록하세요.');
    }
    try {
      return await realAnalyze(query, profile, apiKey);
    } catch (e) {
      console.warn('[ai] real mode failed, fallback to mock:', e);
      return mockAnalyze(query, profile);
    }
  }

  return mockAnalyze(query, profile);
}
