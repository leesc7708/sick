// ─────────────────────────────────────────────────────────────
// 진료과 상담 지식베이스 (어느 과 가야 하나)
//  - ⚠️ 진단이 아니라 "어느 진료과로 가면 되는지" 안내 정보입니다(의료법 준수).
//  - "다래끼는 안과?" 처럼 헷갈리는 케이스와 산업현장 부상을 우선 수록.
//  - 규칙기반(무료·오프라인). 추후 AI 자유입력 상담(Cloud Functions 프록시)으로 확장 예정.
//    → services/deptConsult.ts 의 consultAI() 자리 참고.
// ─────────────────────────────────────────────────────────────

export type Urgency = 'emergency' | 'soon' | 'normal';

export interface DeptGuide {
  id: string;
  /** 매칭 키워드(부분일치). 사용자가 편하게 적은 말과 대조 */
  keywords: string[];
  /** 대표 증상명 (칩/제목) */
  symptom: string;
  /** 1순위 진료과 (facilities의 departments와 일치시켜 병원 필터에 사용) */
  primaryDept: string;
  /** 헷갈리기 쉬운 대안 진료과 (있으면 표시) */
  altDept?: string;
  /** 왜 이 과인지 한 줄 */
  reason: string;
  /** 헷갈림 해소 설명 (핵심 가치) */
  confuseNote?: string;
  urgency: Urgency;
  urgencyNote?: string;
  /** 산업현장 관련 여부 */
  work?: boolean;
}

export const DEPT_GUIDES: DeptGuide[] = [
  // ── 헷갈리는 대표 케이스 ──
  {
    id: 'stye',
    keywords: ['다래끼', '눈꺼풀', '눈두덩', '눈에 뭐', '눈 붓', '눈 종기'],
    symptom: '눈에 다래끼',
    primaryDept: '안과',
    altDept: '피부과',
    reason: '다래끼는 눈꺼풀 기름샘의 염증이라 안과 진료 대상입니다.',
    confuseNote: '눈꺼풀 피부라서 피부과로 착각하기 쉽지만, 눈 부속기관이라 안과가 맞습니다. 짜지 말고 안과에서 처치받으세요.',
    urgency: 'normal',
  },
  {
    id: 'hand_numb',
    keywords: ['손저림', '손 저', '손목 저', '손가락 저', '손 감각', '손이 찌릿'],
    symptom: '손·손목 저림',
    primaryDept: '정형외과',
    altDept: '신경과',
    reason: '손목의 신경 눌림(수근관증후군)이면 정형외과, 목에서 내려오는 문제면 신경과입니다.',
    confuseNote: '손만 저리고 손목을 털면 나아지면 정형외과(수근관증후군)일 확률이 높고, 목·어깨부터 팔로 저림이 이어지면 신경과/신경외과를 고려하세요.',
    urgency: 'normal',
  },
  {
    id: 'dizzy',
    keywords: ['어지럼', '어지러', '빙빙', '핑 돌', '현기증', '균형'],
    symptom: '어지럼증',
    primaryDept: '이비인후과',
    altDept: '신경과',
    reason: '빙빙 도는 어지럼(회전성)은 귀 안 평형기관 문제로 이비인후과가 우선입니다.',
    confuseNote: '천장이 도는 느낌이면 이비인후과(전정기관), 말이 어눌하거나 한쪽 힘이 빠지면 즉시 응급실/신경과로 가세요.',
    urgency: 'soon',
    urgencyNote: '말어눌·한쪽 마비·심한 두통 동반 시 119(뇌졸중 의심).',
  },
  {
    id: 'rash',
    keywords: ['두드러기', '발진', '가려', '피부 뒤집', '알레르기', '두들'],
    symptom: '두드러기·발진',
    primaryDept: '피부과',
    altDept: '알레르기내과',
    reason: '대부분의 피부 발진·두드러기는 피부과에서 진료합니다.',
    confuseNote: '특정 음식·약을 먹으면 반복되거나, 입술·목이 붓고 숨이 차면 알레르기내과 또는 응급실을 고려하세요.',
    urgency: 'normal',
    urgencyNote: '입술·혀 부음, 호흡곤란 동반 시 119(아나필락시스).',
  },
  {
    id: 'back_leg',
    keywords: ['허리', '허리 아프', '다리 저', '엉덩이 저', '디스크', '좌골'],
    symptom: '허리통증 + 다리 저림',
    primaryDept: '정형외과',
    altDept: '신경외과',
    reason: '허리에서 다리로 뻗치는 저림은 척추 신경 눌림일 수 있어 정형외과·신경외과를 봅니다.',
    confuseNote: '단순 허리 근육통은 정형외과, 다리 저림·힘빠짐이 뚜렷하면 신경외과 진료가 필요할 수 있습니다.',
    urgency: 'normal',
    urgencyNote: '대소변 조절이 안 되거나 양다리 마비 시 즉시 응급실.',
  },
  {
    id: 'chest',
    keywords: ['가슴', '가슴 아프', '가슴 답답', '심장', '가슴 통증', '가슴 조여'],
    symptom: '가슴 통증·답답함',
    primaryDept: '내과',
    altDept: '응급의학과',
    reason: '가슴 통증은 심장·폐 문제일 수 있어 내과(순환기) 진료가 필요합니다.',
    confuseNote: '쥐어짜는 통증이 팔·턱으로 퍼지거나 식은땀·호흡곤란이 함께면 참지 말고 즉시 119.',
    urgency: 'soon',
    urgencyNote: '식은땀·호흡곤란·팔/턱 방사통 동반 시 즉시 119(심근경색 의심).',
  },
  {
    id: 'nosebleed',
    keywords: ['코피', '코 피', '코피 자주', '코 막힘', '콧물'],
    symptom: '코피가 자주 남',
    primaryDept: '이비인후과',
    reason: '반복되는 코피·코막힘은 이비인후과 진료 대상입니다.',
    confuseNote: '멈추지 않는 코피나 다치지 않았는데 자주 나면 이비인후과에서 원인을 확인하세요.',
    urgency: 'normal',
  },
  {
    id: 'toothache',
    keywords: ['치통', '이가 아프', '잇몸', '이 시려', '충치', '이빨'],
    symptom: '치통·잇몸',
    primaryDept: '치과',
    reason: '치아·잇몸 통증은 치과입니다.',
    urgency: 'normal',
  },
  {
    id: 'urine',
    keywords: ['소변', '오줌', '배뇨', '소변 볼 때', '방광', '전립선'],
    symptom: '소변 문제(따갑고 잦음)',
    primaryDept: '비뇨의학과',
    altDept: '내과',
    reason: '배뇨 통증·빈뇨는 비뇨의학과 진료 대상입니다.',
    confuseNote: '여성의 단순 방광염은 내과·산부인과에서도 보지만, 반복되거나 남성이면 비뇨의학과를 권합니다.',
    urgency: 'normal',
  },
  {
    id: 'joint',
    keywords: ['관절', '무릎', '어깨 아프', '관절 붓', '손가락 마디', '류마'],
    symptom: '관절이 붓고 아픔',
    primaryDept: '정형외과',
    altDept: '류마티스내과',
    reason: '다치거나 삔 관절은 정형외과입니다.',
    confuseNote: '여러 관절이 대칭으로 붓고 아침에 뻣뻣하면 류마티스내과(염증성 관절염)를 고려하세요.',
    urgency: 'normal',
  },

  // ── 산업현장 특화 (work) ──
  {
    id: 'weld_eye',
    keywords: ['용접', '눈부심', '눈 따가', '아크', '눈 시려', '전광', '용접 후 눈'],
    symptom: '용접 후 눈 통증·눈부심',
    primaryDept: '안과',
    reason: '용접 불빛(자외선)에 각막이 화상을 입은 전광성 안염일 수 있어 안과 진료가 필요합니다.',
    confuseNote: '용접 몇 시간 뒤 눈이 모래알 낀 듯 아프고 눈물이 나면 전형적 증상입니다. 눈 비비지 말고 안과로.',
    urgency: 'soon',
    urgencyNote: '양쪽 시력 저하가 심하면 응급실 안과.',
    work: true,
  },
  {
    id: 'eye_foreign',
    keywords: ['눈에 쇳', '눈 이물', '쇠가루', '분진 눈', '눈에 튀', '이물질 눈'],
    symptom: '눈에 이물질(쇳가루·분진)',
    primaryDept: '안과',
    altDept: '응급의학과',
    reason: '각막에 박힌 금속·이물은 안과에서 제거해야 합니다. 무리하게 빼지 마세요.',
    confuseNote: '문지르면 각막이 더 손상됩니다. 깨끗한 물로 헹구고 안과(야간이면 응급실)로 가세요.',
    urgency: 'soon',
    work: true,
  },
  {
    id: 'chem_eye',
    keywords: ['화학물질 눈', '약품 눈', '눈에 약품', '산 눈', '눈에 튄', '눈 화상'],
    symptom: '화학물질이 눈에 튐',
    primaryDept: '응급의학과',
    altDept: '안과',
    reason: '화학물질 눈 손상은 응급입니다. 즉시 흐르는 물로 15분 이상 씻으며 응급실로.',
    confuseNote: '먼저 씻는 것이 가장 중요합니다(최소 15분). 씻으면서 바로 병원으로 이동하세요.',
    urgency: 'emergency',
    urgencyNote: '즉시 눈 세척 후 119 / 응급실. 지체 금지.',
    work: true,
  },
  {
    id: 'burn',
    keywords: ['화상', '데었', '뜨거운', '불에', '증기 화상', '피부 벗겨'],
    symptom: '화상(데임)',
    primaryDept: '응급의학과',
    altDept: '화상',
    reason: '넓거나 깊은 화상, 얼굴·관절·생식기 화상은 응급실/화상전문 진료가 필요합니다.',
    confuseNote: '먼저 흐르는 미지근한 물로 식히세요. 물집을 터뜨리지 말고, 넓으면 화상전문·응급실로.',
    urgency: 'soon',
    urgencyNote: '넓은 화상·호흡기 화상(연기 흡입)은 즉시 119.',
    work: true,
  },
  {
    id: 'dust_breath',
    keywords: ['분진', '먼지 마셔', '숨차', '호흡', '기침 계속', '가스 마셔', '매연'],
    symptom: '분진·가스 흡입 후 호흡 불편',
    primaryDept: '호흡기내과',
    altDept: '응급의학과',
    reason: '분진·유해가스 흡입 후 기침·호흡곤란은 호흡기내과 진료가 필요합니다.',
    confuseNote: '밀폐공간 가스(황화수소 등) 노출 후 어지럽거나 숨차면 즉시 대피 후 119.',
    urgency: 'soon',
    urgencyNote: '밀폐공간 가스 노출·의식저하 시 즉시 119.',
    work: true,
  },
  {
    id: 'cut',
    keywords: ['베였', '찢어', '피 많이', '열상', '칼에', '절단', '손가락 잘'],
    symptom: '베임·열상(피가 남)',
    primaryDept: '외과',
    altDept: '응급의학과',
    reason: '깊게 베이거나 피가 멎지 않으면 외과·응급실에서 봉합이 필요합니다.',
    confuseNote: '깨끗한 천으로 누르고, 절단 부위가 있으면 비닐에 싸 얼음과 함께 병원으로. 지혈 안 되면 119.',
    urgency: 'soon',
    urgencyNote: '분수처럼 출혈·절단 시 즉시 119.',
    work: true,
  },
  {
    id: 'heat',
    keywords: ['열사병', '더위', '탈진', '땀 안 나', '어지럽고 토', '폭염', '온열'],
    symptom: '더위로 인한 탈진·열사병',
    primaryDept: '응급의학과',
    altDept: '내과',
    reason: '고온 작업 중 어지럼·구역·의식저하는 열사병일 수 있어 응급 대응이 필요합니다.',
    confuseNote: '그늘로 옮겨 시원하게 하고 수분 보충. 의식이 흐리거나 땀이 안 나면 즉시 119.',
    urgency: 'soon',
    urgencyNote: '의식저하·경련·땀 없음 시 즉시 119.',
    work: true,
  },

  // ── 흔한 근골격 (현장에서 자주) ──
  {
    id: 'sprain',
    keywords: ['삐', '접질', '접길', '삐끗', '발목', '손목 삐', '접질렸', '겹질', '인대'],
    symptom: '발목·손목 삠(염좌)',
    primaryDept: '정형외과',
    reason: '삐거나 접질린 관절(염좌)은 정형외과에서 진료합니다.',
    confuseNote: '초기엔 냉찜질·압박·거상(RICE). 붓기·멍이 심하거나 디딜 수 없으면 골절 확인이 필요해 정형외과로.',
    urgency: 'normal',
    urgencyNote: '뼈가 어긋나 보이거나 전혀 디딜 수 없으면 응급실.',
    work: true,
  },
  {
    id: 'fracture',
    keywords: ['부러', '골절', '뼈', '깁스', '으스러', '금 갔'],
    symptom: '뼈가 부러진 것 같음(골절 의심)',
    primaryDept: '정형외과',
    altDept: '응급의학과',
    reason: '골절 의심(심한 통증·변형·못 움직임)은 정형외과·응급실에서 X-ray 확인이 필요합니다.',
    confuseNote: '부목으로 고정하고 움직이지 마세요. 뼈가 튀어나오거나 출혈이 있으면 119.',
    urgency: 'soon',
    urgencyNote: '개방골절(뼈 노출)·심한 변형 시 즉시 119.',
    work: true,
  },
  {
    id: 'bruise',
    keywords: ['부딪', '타박', '멍', '찧', '부딪혔', '맞았', '눌렸'],
    symptom: '부딪힘·타박상',
    primaryDept: '정형외과',
    reason: '부딪히거나 눌린 타박상은 정형외과에서 봅니다.',
    confuseNote: '냉찜질로 붓기 완화. 시간이 지나도 붓고 아프거나 움직이기 힘들면 정형외과로.',
    urgency: 'normal',
    work: true,
  },
  {
    id: 'lowback',
    keywords: ['허리 삐', '허리 담', '허리 뻐근', '허리 무거', '삐끗 허리', '허리 굽'],
    symptom: '허리를 삐끗함(단순 요통)',
    primaryDept: '정형외과',
    reason: '무거운 것을 들다 삐끗한 단순 요통은 정형외과에서 진료합니다.',
    confuseNote: '다리로 저림·힘빠짐이 뻗치면 신경외과 진료가 필요할 수 있습니다.',
    urgency: 'normal',
    work: true,
  },

  // ── 흔한 내과·감기 계열 ──
  {
    id: 'cold',
    keywords: ['감기', '기침', '콧물', '목 아프', '가래', '몸살', '재채기', '코막'],
    symptom: '감기 증상(기침·콧물·목아픔)',
    primaryDept: '이비인후과',
    altDept: '내과',
    reason: '감기·기침·콧물·목통증은 이비인후과 또는 내과에서 진료합니다.',
    confuseNote: '고열이 며칠 지속되거나 숨이 차면 내과(호흡기)로.',
    urgency: 'normal',
  },
  {
    id: 'fever',
    keywords: ['열이', '고열', '발열', '몸이 뜨거', '오한'],
    symptom: '열이 남(발열)',
    primaryDept: '내과',
    reason: '원인 모를 발열은 내과에서 진료합니다.',
    confuseNote: '숨이 차거나 의식이 흐리거나 열이 매우 높으면 응급실.',
    urgency: 'normal',
    urgencyNote: '호흡곤란·의식저하 동반 시 119.',
  },
  {
    id: 'tummy',
    keywords: ['배 아프', '복통', '배탈', '설사', '체', '소화', '속 쓰', '토', '메스꺼'],
    symptom: '배가 아픔(복통·소화)',
    primaryDept: '내과',
    reason: '복통·소화불량·설사는 내과에서 진료합니다.',
    confuseNote: '오른쪽 아랫배가 갑자기 심하게 아프거나 피를 토하면 응급실(맹장·출혈 의심).',
    urgency: 'normal',
    urgencyNote: '갑작스런 극심한 복통·혈변·토혈 시 응급실.',
  },
  {
    id: 'headache',
    keywords: ['머리 아프', '두통', '머리가 지끈', '편두통'],
    symptom: '머리가 아픔(두통)',
    primaryDept: '내과',
    altDept: '신경과',
    reason: '흔한 두통은 내과에서 1차 진료가 가능합니다.',
    confuseNote: '갑자기 벼락 맞은 듯한 극심한 두통, 말어눌·한쪽 마비 동반 시 즉시 119(뇌출혈 의심).',
    urgency: 'normal',
    urgencyNote: '갑작스런 최악의 두통·마비 동반 시 119.',
  },
  {
    id: 'eye_red',
    keywords: ['눈 충혈', '눈 빨', '눈 가려', '눈곱', '눈 이물감', '눈 피로'],
    symptom: '눈이 충혈·가려움',
    primaryDept: '안과',
    reason: '눈 충혈·가려움·이물감은 안과에서 진료합니다.',
    urgency: 'normal',
  },
  {
    id: 'skin_wound',
    keywords: ['상처', '긁혔', '까졌', '물집', '곪', '염증', '덧났'],
    symptom: '피부 상처·곪음',
    primaryDept: '외과',
    altDept: '피부과',
    reason: '베이거나 곪은 상처는 외과, 발진·트러블은 피부과에서 봅니다.',
    confuseNote: '깊거나 계속 곪고 열이 나면 외과에서 처치받으세요.',
    urgency: 'normal',
    work: true,
  },
];

// 아무 매칭도 없을 때의 안전 폴백 — "못 찾았어요"로 막지 않고 1차 진료과를 안내
export const GENERIC_GUIDE: DeptGuide = {
  id: 'general',
  keywords: [],
  symptom: '어느 과인지 애매한 증상',
  primaryDept: '가정의학과',
  altDept: '내과',
  reason: '어느 과인지 딱 떨어지지 않을 땐 가정의학과·내과에서 먼저 진료받고 필요한 과를 안내받을 수 있습니다.',
  confuseNote: '증상을 조금 더 구체적으로 적어주시면(어디가·언제부터·어떻게) 더 정확히 안내해 드려요. 많이 아프거나 응급이면 119.',
  urgency: 'normal',
};
