// 입력 옵션 모음 (증상 메모·작업 체크 등에서 사용)

export const WORK_TYPES = ['밀폐공간', '화학물질 취급', '고소작업', '중장비', '용접·화기', '일반작업'];

export const BODY_PARTS = ['머리', '눈', '코/목', '가슴', '배', '등/허리', '팔', '다리', '피부'];

export const ACCOMPANYING = ['열', '구토', '설사', '발진', '호흡곤란', '어지럼', '오한', '출혈'];

export const HEALTH_CHECK_TYPES = ['특수건강진단', '일반건강검진', '채용시건강검진', '기타'] as const;

export const INCIDENT_TYPES = ['질식', '화상', '추락', '중독', '감전', '기타'] as const;
