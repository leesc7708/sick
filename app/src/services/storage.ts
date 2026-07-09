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
  aiConsent: 'lifeline:aiConsent', // 국외이전(증상 텍스트 → 해외 AI) 동의 여부
  healthConsent: 'lifeline:healthConsent', // 민감정보(기저질환·알레르기·복용약) 수집·이용 동의 시각(ISO). 미동의=null
  onboardedPrefix: 'lifeline:onboarded:', // + uid → 'yes'. 계정별 온보딩 완료. (기존 profile.onboardingDone은 기기공유라 라우팅 부적합 → 대체)
  phraseFaves: 'lifeline:phraseFaves', // 표현집 즐겨찾기 문장 id
  phraseRecents: 'lifeline:phraseRecents', // 표현집 최근 사용 문장 id
  medTaken: 'lifeline:medTaken', // 오늘 복약 체크 { date, taken:{ 'medId@HH:MM':true } } — 날짜 바뀌면 초기화
};

async function getList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}
async function saveList<T>(key: string, list: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}
// 오늘 날짜 (복약 체크 일자 비교용)
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const storage = {
  // ── 언어 ──
  async getLang(): Promise<Lang | null> {
    return (await AsyncStorage.getItem(KEYS.lang)) as Lang | null;
  },
  async setLang(l: Lang): Promise<void> {
    await AsyncStorage.setItem(KEYS.lang, l);
  },

  // ── AI 국외이전 동의 (증상 문구가 해외 AI로 전송됨) ──
  async getAiConsent(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.aiConsent)) === 'yes';
  },
  async setAiConsent(v: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.aiConsent, v ? 'yes' : 'no');
  },

  // ── 민감정보(건강) 수집·이용 동의 — 동의 시각 기록. 미동의 시 null ──
  async getHealthConsent(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.healthConsent);
  },
  async setHealthConsent(agreed: boolean): Promise<void> {
    if (agreed) await AsyncStorage.setItem(KEYS.healthConsent, new Date().toISOString());
    else await AsyncStorage.removeItem(KEYS.healthConsent);
  },

  // ── 온보딩 완료 여부 (계정별) — 로그인 후 최초 1회 온보딩 라우팅 게이팅용 ──
  async getOnboarded(uid: string): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.onboardedPrefix + uid)) === 'yes';
  },
  async setOnboarded(uid: string, done: boolean): Promise<void> {
    if (done) await AsyncStorage.setItem(KEYS.onboardedPrefix + uid, 'yes');
    else await AsyncStorage.removeItem(KEYS.onboardedPrefix + uid);
  },

  // ── 표현집 즐겨찾기 / 최근 ──
  async getPhraseFaves(): Promise<string[]> {
    const r = await AsyncStorage.getItem(KEYS.phraseFaves);
    return r ? (JSON.parse(r) as string[]) : [];
  },
  async setPhraseFaves(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.phraseFaves, JSON.stringify(ids));
  },
  async getPhraseRecents(): Promise<string[]> {
    const r = await AsyncStorage.getItem(KEYS.phraseRecents);
    return r ? (JSON.parse(r) as string[]) : [];
  },
  async pushPhraseRecent(id: string): Promise<string[]> {
    const cur = await this.getPhraseRecents();
    const next = [id, ...cur.filter((x) => x !== id)].slice(0, 8);
    await AsyncStorage.setItem(KEYS.phraseRecents, JSON.stringify(next));
    return next;
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

  // ── 오늘 복약 체크 (날짜 바뀌면 자동 초기화) ──
  async getMedTakenToday(): Promise<Record<string, boolean>> {
    const raw = await AsyncStorage.getItem(KEYS.medTaken);
    if (!raw) return {};
    try { const o = JSON.parse(raw); return o.date === todayStr() ? (o.taken || {}) : {}; } catch { return {}; }
  },
  async setMedTaken(key: string, val: boolean): Promise<void> {
    const cur = await this.getMedTakenToday();
    const taken = { ...cur, [key]: val };
    await AsyncStorage.setItem(KEYS.medTaken, JSON.stringify({ date: todayStr(), taken }));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
