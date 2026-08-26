// ─────────────────────────────────────────────────────────────
// E-Gen(국립중앙의료원) 실시간 공공데이터 클라이언트 헬퍼
//  - 서비스키는 서버(Cloud Functions .env)에만 있고, 앱은 동일 출처 프록시만 호출.
//  - /api/egen-severe  : 중증질환자 수용가능정보 (시도 단위)
//  - /api/egen-trauma  : 전국 권역외상센터 목록
//  ⚠️ 실데이터 API. 실패는 반드시 status:'fail'로 화면까지 올린다(아래 EgenResult 참고).
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 조회 결과 타입 — "결과 0건"과 "조회 실패"를 같은 값으로 돌려주지 않는다.
//  2026-08-26 장애 교훈: 결제(Blaze) 중단으로 /api/egen-* 프록시가 11일간 503이었는데
//  모든 fetch가 실패를 []로 삼켜 화면에는 "조건에 맞는 곳이 없어요"만 떴다.
//  → 장애가 "그 지역엔 원래 없나 보다"로 보여 11일간 발견되지 않았다.
//  이제 실패는 status:'fail'로 올라가고, 화면은 LoadError(장애 안내 + 재시도)를 띄운다.
// ─────────────────────────────────────────────────────────────
//  status: 'ok'   = 상류에서 받은 실시간 값
//         'fail' = 조회 실패 (화면은 LoadError로 안내 + 재시도)
//         'stale'= 조회는 실패했지만 앱 동봉 스냅샷으로 대체함 (화면은 기준일 배지 표시)
export type EgenResult<T> = { status: 'ok' | 'fail' | 'stale'; items: T[] };

async function egenGet<T>(path: string, key: string): Promise<EgenResult<T>> {
  try {
    const res = await fetch(path);
    // 503(결제중단·배포누락) / 500(서버키 미설정) / 4xx — 본문 볼 것도 없이 장애
    if (!res.ok) return { status: 'fail', items: [] };
    // 오류 HTML이 오면 여기서 throw → catch로 떨어진다
    const j = await res.json();
    if (j?.ok && Array.isArray(j[key])) return { status: 'ok', items: j[key] as T[] };
    return { status: 'fail', items: [] }; // { ok:false } 또는 형식 불일치
  } catch {
    return { status: 'fail', items: [] }; // 네트워크 단절·타임아웃·JSON 파싱 실패
  }
}

// 시도(+선택 시군구) 쿼리스트링
function regionQuery(stage1: string, stage2?: string): string {
  const qs = new URLSearchParams({ stage1 });
  if (stage2) qs.set('stage2', stage2);
  return qs.toString();
}

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

// 시도(선택적 시군구) 응급실 실시간 가용병상 조회. 실패 시 status:'fail'.
export function fetchBeds(stage1: string, stage2?: string): Promise<EgenResult<BedHospital>> {
  return egenGet<BedHospital>(`/api/egen-beds?${regionQuery(stage1, stage2)}`, 'hospitals');
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

// 병·의원 / 약국 (지역 단위 실데이터). 좌표 포함(길찾기).
export type HospitalItem = { hpid: string; name: string; addr: string; tel: string; div: string; lat: number | null; lon: number | null };
export type PharmacyItem = { hpid: string; name: string; addr: string; tel: string; lat: number | null; lon: number | null };

export function fetchHospitals(stage1: string, stage2?: string): Promise<EgenResult<HospitalItem>> {
  return egenGet<HospitalItem>(`/api/egen-hospitals?${regionQuery(stage1, stage2)}`, 'hospitals');
}

export function fetchPharmacy(stage1: string, stage2?: string): Promise<EgenResult<PharmacyItem>> {
  return egenGet<PharmacyItem>(`/api/egen-pharmacy?${regionQuery(stage1, stage2)}`, 'pharmacies');
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

// 중증질환 수용가능 병원 조회. 실패 시 status:'fail'.
export function fetchSevere(stage1: string, stage2?: string): Promise<EgenResult<SevereHospital>> {
  return egenGet<SevereHospital>(`/api/egen-severe?${regionQuery(stage1, stage2)}`, 'hospitals');
}

// 전국 권역외상센터 조회.
//  ⚠️ 이 화면만은 빈 채로 두지 않는다 — 중증외상 환자를 어디로 보낼지 정하는 목록이다.
//  실패하면 앱에 동봉한 정적 스냅샷(20곳)으로 폴백하고 status:'stale'로 알린다.
//  화면은 stale일 때 "YYYY-MM-DD 기준" 배지를 띄워 오래된 정보를 최신인 척하지 않는다.
export async function fetchTrauma(): Promise<EgenResult<TraumaCenter>> {
  const r = await egenGet<TraumaCenter>('/api/egen-trauma', 'centers');
  if (r.status === 'ok' && r.items.length > 0) return r;
  const { TRAUMA_CENTERS_SNAPSHOT } = await import('./traumaCenters');
  return { status: 'stale', items: TRAUMA_CENTERS_SNAPSHOT };
}

// AED(자동심장충격기) 위치. buildPlace/주소/관리기관/연락처/24시간여부.
//  ⚠️ 좌표 없음 → 지역(시도/시군구) 기준 목록. 실패 시 status:'fail'.
export type AedItem = { place: string; addr: string; org: string; tel: string; is24h: boolean };

export function fetchAed(stage1: string, stage2?: string): Promise<EgenResult<AedItem>> {
  return egenGet<AedItem>(`/api/egen-aed?${regionQuery(stage1, stage2)}`, 'aeds');
}
