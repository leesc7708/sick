// ─────────────────────────────────────────────────────────────
// 진료과 상담 로직
//  - 지금: 규칙기반 매칭(무료·오프라인·즉시). data/departmentGuide.ts 사용.
//  - 나중: AI 자유입력 상담. 아래 consultAI()를 Cloud Functions 프록시로 연결.
//    ⚠️ 보안·의료법상 클라이언트에 API 키를 넣지 말 것. 반드시 서버(Functions) 경유.
// ─────────────────────────────────────────────────────────────
import { DEPT_GUIDES, DeptGuide, GENERIC_GUIDE } from '../data/departmentGuide';

export interface ConsultResult {
  guide: DeptGuide;
  score: number;
}

// ── 응급 백스톱 스캔 ──
// AI/규칙기반이 응급을 과소평가(soon/normal)해도, 명백한 위험 신호가 보이면 emergency로 강제 상향.
// 프롬프트(다국어 처리)가 1차 방어, 이 스캔은 최후의 안전망.
const EMERGENCY_TERMS = [
  // 한국어 고위험 신호
  '식은땀', '호흡곤란', '숨을 못', '숨이 안', '숨차', '숨쉬기', '의식', '쓰러', '기절', '실신',
  '경련', '발작', '마비', '어눌', '말이 안', '대량출혈', '피가 안 멈', '피가 많이', '토혈', '피를 토', '혈변',
  '절단', '잘렸', '잘림', '감전', '질식', '가스 마', '벼락', '찢어지', '음낭', '고환', '열사병',
  '가슴이 조', '가슴이 답답', '가슴 통증', '흉통', '명치',
  // 다국어 최소 커버(AI 실패·규칙폴백 대비)
  'chest pain', 'can\'t breathe', 'cannot breathe', 'unconscious', 'seizure', 'stroke', 'bleeding heavily', 'amputat',
  'dolor de pecho', 'no puedo respirar', 'desmay', 'convuls',
];

export function scanEmergency(text: string): boolean {
  const q = (text || '').toLowerCase();
  return EMERGENCY_TERMS.some((t) => q.includes(t.toLowerCase()));
}

// 결과의 긴급도를 emergency로 강제 상향(불변성 유지)
function escalate(results: ConsultResult[]): ConsultResult[] {
  return results.map((r) =>
    r.guide.urgency === 'emergency'
      ? r
      : { ...r, guide: { ...r.guide, urgency: 'emergency' as const } },
  );
}

/** 사용자가 편하게 적은 문장 + 선택한 빠른칩을 지식베이스와 대조 */
export function consultRuleBased(text: string, quickIds: string[] = []): ConsultResult[] {
  const q = (text || '').toLowerCase().replace(/\s+/g, '');
  const results: ConsultResult[] = [];

  for (const guide of DEPT_GUIDES) {
    let score = 0;

    // 빠른칩으로 직접 선택한 경우 최우선
    if (quickIds.includes(guide.id)) score += 100;

    // 키워드 부분일치 (공백 제거 후 비교로 "손 저림"/"손저림" 모두 매칭)
    for (const kw of guide.keywords) {
      const k = kw.toLowerCase().replace(/\s+/g, '');
      if (q && q.includes(k)) score += 10;
    }

    if (score > 0) results.push({ guide, score });
  }

  // 아무 것도 못 찾으면 "못 찾았어요"로 막지 않고 1차 진료과(가정의학과/내과) 안내
  if (results.length === 0) return [{ guide: GENERIC_GUIDE, score: 1 }];

  return results.sort((a, b) => b.score - a.score);
}

/**
 * AI 자유입력 상담.
 *  - 빠른칩을 선택한 경우: 큐레이션된 규칙기반으로 즉시 응답(무료).
 *  - 자유 문장: Cloud Functions 프록시(/api/dept-consult)를 통해 Claude(Haiku)로 안내.
 *  - 네트워크/응답 실패 시 규칙기반으로 폴백(끊기지 않게).
 * ⚠️ API 키는 서버(함수 .env)에만 있고 앱엔 없다.
 */
export async function consultAI(
  text: string,
  quickIds: string[] = [],
  lang = 'ko',
  profile?: { age?: number; conditions?: string[]; currentMedicines?: string[] },
): Promise<ConsultResult[]> {
  const emerg = scanEmergency(text);

  // 빠른칩 선택은 즉시·무료 규칙기반 (응급 신호 있으면 상향)
  if (quickIds.length) {
    const r = consultRuleBased(text, quickIds);
    return emerg ? escalate(r) : r;
  }

  const t = (text || '').trim();
  if (!t) return consultRuleBased(text, quickIds);

  try {
    const res = await fetch('/api/dept-consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: t, lang, profile: profile || undefined }),
    });
    const j = await res.json();
    if (j?.ok && j.data?.dept) {
      const d = j.data;
      let urgency = ['emergency', 'soon', 'normal'].includes(d.urgency) ? d.urgency : 'normal';
      if (emerg) urgency = 'emergency'; // 백스톱: AI가 과소평가해도 상향
      const guide: DeptGuide = {
        id: 'ai',
        keywords: [],
        symptom: t.length > 34 ? t.slice(0, 34) + '…' : t,
        primaryDept: emerg && urgency === 'emergency' && !d.dept ? '응급의학과' : String(d.dept),
        altDept: d.alt ? String(d.alt) : undefined,
        reason: String(d.reason || ''),
        confuseNote: d.tip ? String(d.tip) : undefined,
        urgency,
        work: false,
      };
      return [{ guide, score: 100 }];
    }
  } catch (e) {
    // 무시하고 규칙기반 폴백
  }
  // 폴백: 규칙기반 (응급 신호 있으면 상향 — 매칭 실패로 normal 떨어지는 것 방지)
  const fb = consultRuleBased(text, quickIds);
  return emerg ? escalate(fb) : fb;
}
