import type { Lang } from '../i18n/translations';

export interface PolicySection { h: string; body: string; }
export interface Policy { title: string; intro: string; sections: PolicySection[]; updated: string; }

// 개인정보 처리방침 — ko/en 정식 작성, 나머지 언어는 en 폴백(법적 원문은 ko).
// 실제 수집·저장 구조에 맞춘 정직한 고지: 민감 건강정보=기기 로컬, 계정·현장=Firebase(서울), AI 상담 시에만 국외이전(별도 동의).
const ko: Policy = {
  title: '개인정보 처리방침',
  intro: '라이프라인(Lifeline)은 현장 근로자·거주 외국인의 응급 대응과 안전관리를 돕기 위한 앱입니다. 아래와 같이 개인정보를 최소한으로 수집·이용합니다.',
  updated: '시행일 2026-07-08',
  sections: [
    { h: '1. 수집 항목', body: '· 계정: 아이디, 이름, 전화번호\n· (선택) 민감 건강정보: 기저질환, 알레르기, 복용 중인 약\n· 이용 기록: 증상 정리 메모, 작업 전 건강체크, 사고 보고, 건강검진 기록' },
    { h: '2. 수집·이용 목적', body: '응급 상황에서 정확한 안내를 제공하고, 현장 안전관리(작업 전 컨디션 확인·긴급 알림)를 지원하기 위해서만 사용합니다. 진단·처방 목적이 아니며 의료행위를 대체하지 않습니다.' },
    { h: '3. 저장 위치', body: '· 민감 건강정보(기저질환·알레르기·복용약)와 증상·체크·기록은 사용자의 기기(로컬)에만 저장되며 서버로 전송되지 않습니다.\n· 계정 정보와 현장 그룹·긴급 알림은 Firebase(Google Cloud, 서울 리전)에 저장됩니다.' },
    { h: '4. 국외 이전', body: 'AI 자유상담 기능을 사용할 때에 한해, 입력한 증상 텍스트가 해외 AI 서비스로 전송됩니다. 이는 별도 동의를 받은 경우에만 이루어지며, 미동의 시 규칙 기반 안내만 제공됩니다.' },
    { h: '5. 보유 및 파기', body: '로컬 데이터는 앱 삭제 시 함께 삭제됩니다. 민감정보 수집 동의는 언제든 철회할 수 있으며, 철회 시 해당 로컬 데이터는 삭제됩니다.' },
    { h: '6. 이용자 권리', body: '이용자는 자신의 정보 열람·수정·삭제를 요청할 수 있습니다. 앱 내 설정에서 프로필 정보를 직접 수정·삭제할 수 있습니다.' },
    { h: '7. 문의', body: '개인정보 관련 문의: 디와이산업개발' },
  ],
};

const en: Policy = {
  title: 'Privacy Policy',
  intro: 'Lifeline helps on-site workers and foreign residents with emergency response and safety management. We collect and use personal data to the minimum extent as follows.',
  updated: 'Effective 2026-07-08',
  sections: [
    { h: '1. Data Collected', body: '· Account: username, name, phone number\n· (Optional) Sensitive health data: conditions, allergies, current medications\n· Usage records: symptom notes, pre-work health checks, incident reports, health-exam records' },
    { h: '2. Purpose', body: 'Used only to provide accurate guidance in emergencies and to support on-site safety management (pre-work condition checks, emergency alerts). Not for diagnosis or prescription; it does not replace professional medical care.' },
    { h: '3. Storage Location', body: '· Sensitive health data (conditions, allergies, medications) and symptom/check/records are stored only on your device (locally) and are not sent to any server.\n· Account info and crew/emergency alerts are stored in Firebase (Google Cloud, Seoul region).' },
    { h: '4. Overseas Transfer', body: 'Only when you use the AI free-consultation feature, the symptom text you enter is sent to an overseas AI service. This happens only with your separate consent; without it, only rule-based guidance is provided.' },
    { h: '5. Retention & Disposal', body: 'Local data is deleted when the app is removed. Consent for sensitive-data collection can be withdrawn at any time, upon which the related local data is deleted.' },
    { h: '6. Your Rights', body: 'You may request access, correction, or deletion of your data. You can edit or delete your profile directly in the app settings.' },
    { h: '7. Contact', body: 'Privacy inquiries: DY Industrial Development' },
  ],
};

const MAP: Partial<Record<Lang, Policy>> = { ko, en };
export function getPolicy(lang: Lang): Policy {
  return MAP[lang] ?? en; // 미작성 언어는 영문 폴백
}
