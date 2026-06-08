// 세이프콜 타입 — @work 산업현장 안전·응급 + 건강검진기록 (2026-06-08 재정의)

export type AppMode = 'work' | 'general';
export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  mode: AppMode;
  age?: number;
  gender?: Gender;
  conditions: string[];
  allergies: string[];
  currentMedicines: string[];
  onboardingDone: boolean;
}

// ── 응급 신호 (규칙 기반 3단계) ──
export type RedFlagLevel = 'red' | 'yellow' | 'gray';
export interface RedFlagItem {
  id: string;
  label: string;
  group: 'general' | 'work';
  critical: boolean; // true면 선택 시 즉시 red
}
export interface RedFlagResult {
  level: RedFlagLevel;
  selectedIds: string[];
  title: string;
  message: string;
}

// ── 증상 메모 + AI 진료요약 ──
export interface SymptomMemo {
  id: string;
  who: 'self' | 'coworker';
  startedAt?: string;
  bodyParts: string[];
  severity?: number; // 0~10
  pattern?: string;
  accompanying: string[];
  atWork: boolean;
  workType?: string;
  meds?: string;
  allergies?: string;
  photos?: string[];
  concern?: string;
  aiSummary?: string;
  aiQuestions?: string[];
  createdAt: string;
}

// ── 건강검진기록 (킬러 기능) ──
export type HealthCheckType = '특수건강진단' | '일반건강검진' | '채용시건강검진' | '기타';
export interface HealthCheckRecord {
  id: string;
  type: HealthCheckType;
  title: string;
  fileType: 'pdf' | 'image';
  fileUri: string;
  examDate?: string;
  expireDate?: string;
  result?: string; // 예: 적합 / 사후관리 / 부적합
  memo?: string;
  createdAt: string;
}

// ── 작업 전 건강체크 (@work) ──
export interface WorkHealthCheck {
  id: string;
  workType: string;
  sleepOk: boolean;
  noAlcohol: boolean;
  tookMeds: boolean;
  noDizziness: boolean;
  completedAt: string;
}

// ── 사고·이상 보고 (@work) ──
export type IncidentType = '질식' | '화상' | '추락' | '중독' | '감전' | '기타';
export interface IncidentReport {
  id: string;
  type: IncidentType;
  locationText?: string;
  memo?: string;
  reportedAt: string;
}

// ── 복용약 ──
export interface MyMedicine {
  id: string;
  name: string;
  doseTime?: string;
  note?: string;
}

// ── 병원·약국·응급실 (E-Gen mock) ──
export type FacilityKind = 'er' | 'hospital' | 'pharmacy';
export interface Hospital {
  id: string;
  name: string;
  kind: FacilityKind;
  departments: string[];
  address: string;
  distanceKm: number;
  isOpenNow: boolean;
  hasNight: boolean;
  hasWeekend: boolean;
  availableBeds?: number; // 실시간 가용병상 (응급실)
  phone: string;
}

// ── 응급처치 카드 ──
export interface FirstAidCard {
  type: IncidentType;
  title: string;
  steps: string[];
}

// ── 지난 기록 통합 ──
export type HistoryKind = 'symptom' | 'incident' | 'workcheck';
export interface HistoryItem {
  id: string;
  kind: HistoryKind;
  title: string;
  subtitle?: string;
  date: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  RedFlag: undefined;
  SymptomInput: undefined;
  SymptomSummary: { memoId?: string } | undefined;
  HospitalFinder: { kind?: FacilityKind } | undefined;
  HealthRecords: undefined;
  HealthRecordShare: { recordId: string };
  WorkCheck: undefined;
  IncidentReport: undefined;
  ManagerDashboard: undefined;
  MyMedicines: undefined;
  History: undefined;
  Settings: undefined;
};
