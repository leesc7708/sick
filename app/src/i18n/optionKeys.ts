// 저장은 한국어 원본(데이터 일관성·기존 기록 호환), 표시는 번역 키로 매핑.
// 입력 화면(SymptomInput/IncidentReport)과 표시 화면(SymptomSummary/History)이 같은 맵을 써야
// 저장값↔라벨이 어긋나지 않으므로 여기 한 곳에 둔다.

export const BP_KEY: Record<string, string> = {
  '머리': 'bp_head', '눈': 'bp_eye', '코/목': 'bp_nose', '가슴': 'bp_chest', '배': 'bp_belly', '등/허리': 'bp_back', '팔': 'bp_arm', '다리': 'bp_leg', '피부': 'bp_skin',
};

export const AC_KEY: Record<string, string> = {
  '열': 'ac_fever', '구토': 'ac_vomit', '설사': 'ac_diarrhea', '발진': 'ac_rash', '호흡곤란': 'ac_dyspnea', '어지럼': 'ac_dizzy', '오한': 'ac_chill', '출혈': 'ac_bleed',
};

export const WT_KEY: Record<string, string> = {
  '밀폐공간': 'wt_confined', '화학물질 취급': 'wt_chem', '고소작업': 'wt_height', '중장비': 'wt_heavy', '용접·화기': 'wt_weld', '일반작업': 'wt_general',
};

export const IT_KEY: Record<string, string> = {
  '질식': 'it_choke', '화상': 'it_burn', '추락': 'it_fall', '중독': 'it_poison', '감전': 'it_shock', '기타': 'it_other',
};

type TFn = (key: string) => string;

// 저장된 한국어 원본 → 사용자 언어 라벨. 맵에 없는 값(구버전·자유입력)은 원본 그대로.
export function label(map: Record<string, string>, koValue: string, t: TFn): string {
  const key = map[koValue];
  return key ? t(key) : koValue;
}

export function labelList(map: Record<string, string>, koValues: string[], t: TFn): string {
  return koValues.map((v) => label(map, v, t)).join(', ');
}
