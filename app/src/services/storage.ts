import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  HealthCheckRecord,
  SymptomMemo,
  WorkHealthCheck,
  IncidentReport,
  MyMedicine,
} from '../types';
import { Lang } from '../i18n/translations';

const KEYS = {
  profile: 'eodi:profile',
  aiMode: 'eodi:aiMode',
  apiKey: 'eodi:apiKey', // deprecated — 클라이언트 키 저장은 보안상 제거 예정(서버 프록시로 이전)
  healthRecords: 'safecall:healthRecords',
  symptomMemos: 'safecall:symptomMemos',
  workChecks: 'safecall:workChecks',
  incidents: 'safecall:incidents',
  myMedicines: 'safecall:myMedicines',
  lang: 'lifeline:lang',
};

async function getList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}
async function saveList<T>(key: string, list: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

export const storage = {
  // ── 언어 ──
  async getLang(): Promise<Lang | null> {
    return (await AsyncStorage.getItem(KEYS.lang)) as Lang | null;
  },
  async setLang(l: Lang): Promise<void> {
    await AsyncStorage.setItem(KEYS.lang, l);
  },

  // ── 프로필 ──
  async getProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.profile);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },
  async setProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
  },

  // ── AI 모드(mock/real). 실제 호출은 서버 프록시 권장 ──
  async getAiMode(): Promise<'mock' | 'real'> {
    const raw = await AsyncStorage.getItem(KEYS.aiMode);
    return raw === 'real' ? 'real' : 'mock';
  },
  async setAiMode(mode: 'mock' | 'real'): Promise<void> {
    await AsyncStorage.setItem(KEYS.aiMode, mode);
  },

  // ── (deprecated) API 키 — SettingsScreen UI에서는 제거됨 ──
  async getApiKey(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.apiKey);
  },
  async setApiKey(key: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.apiKey, key);
  },

  // ── 건강검진기록 ──
  async getHealthRecords(): Promise<HealthCheckRecord[]> {
    return getList<HealthCheckRecord>(KEYS.healthRecords);
  },
  async getHealthRecord(id: string): Promise<HealthCheckRecord | null> {
    const list = await getList<HealthCheckRecord>(KEYS.healthRecords);
    return list.find((r) => r.id === id) ?? null;
  },
  async addHealthRecord(rec: HealthCheckRecord): Promise<void> {
    const list = await getList<HealthCheckRecord>(KEYS.healthRecords);
    list.unshift(rec);
    await saveList(KEYS.healthRecords, list);
  },
  async deleteHealthRecord(id: string): Promise<void> {
    const list = await getList<HealthCheckRecord>(KEYS.healthRecords);
    await saveList(KEYS.healthRecords, list.filter((r) => r.id !== id));
  },

  // ── 증상 메모 ──
  async getSymptomMemos(): Promise<SymptomMemo[]> {
    return getList<SymptomMemo>(KEYS.symptomMemos);
  },
  async getSymptomMemo(id: string): Promise<SymptomMemo | null> {
    const list = await getList<SymptomMemo>(KEYS.symptomMemos);
    return list.find((m) => m.id === id) ?? null;
  },
  async addSymptomMemo(memo: SymptomMemo): Promise<void> {
    const list = await getList<SymptomMemo>(KEYS.symptomMemos);
    list.unshift(memo);
    await saveList(KEYS.symptomMemos, list);
  },

  // ── 작업 전 건강체크 ──
  async getWorkChecks(): Promise<WorkHealthCheck[]> {
    return getList<WorkHealthCheck>(KEYS.workChecks);
  },
  async addWorkCheck(check: WorkHealthCheck): Promise<void> {
    const list = await getList<WorkHealthCheck>(KEYS.workChecks);
    list.unshift(check);
    await saveList(KEYS.workChecks, list);
  },

  // ── 사고 보고 ──
  async getIncidents(): Promise<IncidentReport[]> {
    return getList<IncidentReport>(KEYS.incidents);
  },
  async addIncident(report: IncidentReport): Promise<void> {
    const list = await getList<IncidentReport>(KEYS.incidents);
    list.unshift(report);
    await saveList(KEYS.incidents, list);
  },

  // ── 복용약 ──
  async getMyMedicines(): Promise<MyMedicine[]> {
    return getList<MyMedicine>(KEYS.myMedicines);
  },
  async addMyMedicine(med: MyMedicine): Promise<void> {
    const list = await getList<MyMedicine>(KEYS.myMedicines);
    list.push(med);
    await saveList(KEYS.myMedicines, list);
  },
  async deleteMyMedicine(id: string): Promise<void> {
    const list = await getList<MyMedicine>(KEYS.myMedicines);
    await saveList(KEYS.myMedicines, list.filter((m) => m.id !== id));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
