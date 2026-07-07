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
export async function consultAI(text: string, quickIds: string[] = [], lang = 'ko'): Promise<ConsultResult[]> {
  // 빠른칩 선택은 즉시·무료 규칙기반
  if (quickIds.length) return consultRuleBased(text, quickIds);

  const t = (text || '').trim();
  if (!t) return consultRuleBased(text, quickIds);

  try {
    const res = await fetch('/api/dept-consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: t, lang }),
    });
    const j = await res.json();
    if (j?.ok && j.data?.dept) {
      const d = j.data;
      const urgency = ['emergency', 'soon', 'normal'].includes(d.urgency) ? d.urgency : 'normal';
      const guide: DeptGuide = {
        id: 'ai',
        keywords: [],
        symptom: t.length > 34 ? t.slice(0, 34) + '…' : t,
        primaryDept: String(d.dept),
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
  return consultRuleBased(text, quickIds);
}
