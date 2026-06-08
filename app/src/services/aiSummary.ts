import { SymptomMemo } from '../types';

export interface AiSummary {
  summary: string;
  questions: string[];
}

// AI는 "정리"만 한다 — 진단·병명·확률·약 추천 금지(의료법/약사법).
// ⚠️ 실제 AI 호출은 서버 프록시(Firebase Cloud Functions)를 통해서만.
//    클라이언트에는 API 키를 저장하지 않는다. 아래는 입력 기반 데모 요약.
export async function summarizeSymptom(memo: SymptomMemo): Promise<AiSummary> {
  const parts: string[] = [];
  if (memo.startedAt) parts.push(`${memo.startedAt}부터`);
  if (memo.bodyParts.length) parts.push(memo.bodyParts.join(', '));
  if (typeof memo.severity === 'number') parts.push(`강도 ${memo.severity}/10`);
  if (memo.accompanying.length) parts.push(`동반: ${memo.accompanying.join(', ')}`);

  let summary = parts.join(' · ');
  if (memo.atWork) summary += `${summary ? ' / ' : ''}${memo.workType ?? '작업'} 중 발생`;
  if (!summary) summary = '입력된 증상 정보를 정리했습니다.';

  const questions: string[] = [];
  if (memo.atWork) questions.push('작업 환경(밀폐공간·화학물질 등)과 관련이 있을 수 있나요?');
  questions.push('추가 검사가 필요한가요?');
  questions.push('작업에 복귀해도 괜찮은가요?');
  questions.push('집에서 주의할 점이 있나요?');

  return { summary, questions };
}
