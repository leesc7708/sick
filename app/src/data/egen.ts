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

// 응급실 실시간 가용병상 (egenBeds 프록시)
export type BedHospital = { hpid: string; name: string; tel: string; erBeds: number | null; at: string };

// 시도(선택적 시군구) 응급실 실시간 가용병상 조회. 실패 시 빈 배열(화면 폴백).
export async function fetchBeds(stage1: string, stage2?: string): Promise<BedHospital[]> {
  try {
    const qs = new URLSearchParams({ stage1 });
    if (stage2) qs.set('stage2', stage2);
    const res = await fetch(`/api/egen-beds?${qs.toString()}`);
    const j = await res.json();
    if (j?.ok && Array.isArray(j.hospitals)) return j.hospitals as BedHospital[];
  } catch {
    // 무시 — 호출부에서 빈 결과로 안내
  }
  return [];
}

// ── GPS 자동 지역선택 (A: 가장 가까운 시도 중심점 · 키 불필요) ──
// 17개 시도 대략 중심좌표. name은 SIDO_LIST 명칭과 정확히 일치해야 함.
const SIDO_CENTROIDS: { name: string; lat: number; lon: number }[] = [
  { name: '서울특별시', lat: 37.5665, lon: 126.978 },
  { name: '부산광역시', lat: 35.1796, lon: 129.0756 },
  { name: '대구광역시', lat: 35.8714, lon: 128.6014 },
  { name: '인천광역시', lat: 37.4563, lon: 126.7052 },
  { name: '광주광역시', lat: 35.1595, lon: 126.8526 },
  { name: '대전광역시', lat: 36.3504, lon: 127.3845 },
  { name: '울산광역시', lat: 35.5384, lon: 129.3114 },
  { name: '세종특별자치시', lat: 36.4801, lon: 127.289 },
  { name: '경기도', lat: 37.3, lon: 127.05 }, // 인구중심(수원·성남·용인축)으로 조정 — 서울 흡수 방지
  { name: '강원특별자치도', lat: 37.8228, lon: 128.1555 },
  { name: '충청북도', lat: 36.8, lon: 127.7 },
  { name: '충청남도', lat: 36.5184, lon: 126.8 },
  { name: '전북특별자치도', lat: 35.7175, lon: 127.153 },
  { name: '전라남도', lat: 34.8679, lon: 126.991 },
  { name: '경상북도', lat: 36.4919, lon: 128.8889 },
  { name: '경상남도', lat: 35.4606, lon: 128.2132 },
  { name: '제주특별자치도', lat: 33.489, lon: 126.4983 },
];

export function nearestSido(lat: number, lon: number): string {
  let best = SIDO_LIST[0];
  let bestD = Infinity;
  for (const c of SIDO_CENTROIDS) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestD) { bestD = d; best = c.name; }
  }
  return best;
}

// 브라우저 위치 → 가장 가까운 시도명. 권한거부/미지원/타임아웃 시 null(폴백).
export function detectSido(timeoutMs = 6000): Promise<string | null> {
  return new Promise((resolve) => {
    const geo: any = typeof navigator !== 'undefined' ? (navigator as any).geolocation : null;
    if (!geo || typeof geo.getCurrentPosition !== 'function') return resolve(null);
    let done = false;
    const finish = (v: string | null) => { if (!done) { done = true; resolve(v); } };
    try {
      geo.getCurrentPosition(
        (pos: any) => finish(nearestSido(pos.coords.latitude, pos.coords.longitude)),
        () => finish(null),
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
      );
    } catch {
      finish(null);
    }
    setTimeout(() => finish(null), timeoutMs + 500);
  });
}

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

// AED(자동심장충격기) 위치. buildPlace/주소/관리기관/연락처/24시간여부.
//  ⚠️ 좌표 없음 → 지역(시도/시군구) 기준 목록. 실패 시 빈 배열(화면 폴백).
export type AedItem = { place: string; addr: string; org: string; tel: string; is24h: boolean };

export async function fetchAed(stage1: string, stage2?: string): Promise<AedItem[]> {
  try {
    const qs = new URLSearchParams({ stage1 });
    if (stage2) qs.set('stage2', stage2);
    const res = await fetch(`/api/egen-aed?${qs.toString()}`);
    const j = await res.json();
    if (j?.ok && Array.isArray(j.aeds)) return j.aeds as AedItem[];
  } catch {
    // 무시 — 호출부에서 빈 결과로 안내
  }
  return [];
}
