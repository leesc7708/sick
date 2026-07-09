// ─────────────────────────────────────────────────────────────
// E-Gen(국립중앙의료원) 실시간 공공데이터 클라이언트 헬퍼
//  - 서비스키는 서버(Cloud Functions .env)에만 있고, 앱은 동일 출처 프록시만 호출.
//  - /api/egen-severe  : 중증질환자 수용가능정보 (시도 단위)
//  - /api/egen-trauma  : 전국 권역외상센터 목록
//  ⚠️ 실데이터 API. 실패해도 기존 병원찾기 화면은 그대로 동작하도록 호출부에서 폴백 처리.
// ─────────────────────────────────────────────────────────────

// 전국 17개 시도 — STAGE1 값은 E-Gen이 받는 정확한 명칭(신 명칭: 강원특별자치도/전북특별자치도 등)
export const SIDO_LIST: string[] = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

export type SevereItem = { code: string; label: string };
export type SevereHospital = { hpid: string; name: string; acceptCount: number; available: SevereItem[] };
export type TraumaCenter = {
  hpid: string;
  name: string;
  addr: string;
  tel: string;
  erTel: string;
  lat: number | null;
  lon: number | null;
  emcls: string;
};

// 중증질환 수용가능 병원 조회. 실패 시 빈 배열(화면 폴백).
export async function fetchSevere(stage1: string, stage2?: string): Promise<SevereHospital[]> {
  try {
    const qs = new URLSearchParams({ stage1 });
    if (stage2) qs.set('stage2', stage2);
    const res = await fetch(`/api/egen-severe?${qs.toString()}`);
    const j = await res.json();
    if (j?.ok && Array.isArray(j.hospitals)) return j.hospitals as SevereHospital[];
  } catch {
    // 무시 — 호출부에서 빈 결과로 안내
  }
  return [];
}

// 전국 권역외상센터 조회. 실패 시 빈 배열(화면 폴백).
export async function fetchTrauma(): Promise<TraumaCenter[]> {
  try {
    const res = await fetch('/api/egen-trauma');
    const j = await res.json();
    if (j?.ok && Array.isArray(j.centers)) return j.centers as TraumaCenter[];
  } catch {
    // 무시
  }
  return [];
}
