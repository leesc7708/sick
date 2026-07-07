// ─────────────────────────────────────────────────────────────
// 진료과 상담 로직
//  - 지금: 규칙기반 매칭(무료·오프라인·즉시). data/departmentGuide.ts 사용.
//  - 나중: AI 자유입력 상담. 아래 consultAI()를 Cloud Functions 프록시로 연결.
//    ⚠️ 보안·의료법상 클라이언트에 API 키를 넣지 말 것. 반드시 서버(Functions) 경유.
// ─────────────────────────────────────────────────────────────
import { DEPT_GUIDES, DeptGuide } from '../data/departmentGuide';

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

  return results.sort((a, b) => b.score - a.score);
}

/**
 * (확장 예정) AI 자유입력 상담.
 * 배포 시 Firebase Cloud Functions 엔드포인트를 호출해 Claude(권장: Haiku)로
 * "어느 진료과로 가면 되는지" 안내를 받는다. 진단·처방은 금지, 안내만.
 *
 * 예) const res = await fetch(FUNCTIONS_URL + '/deptConsult', {
 *       method: 'POST', body: JSON.stringify({ text }) });
 *
 * 지금은 규칙기반으로 폴백한다.
 */
export async function consultAI(text: string, quickIds: string[] = []): Promise<ConsultResult[]> {
  // TODO: Cloud Functions 프록시 연동 후 아래 규칙기반 폴백을 교체/보완
  return consultRuleBased(text, quickIds);
}
