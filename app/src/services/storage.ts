import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const KEYS = {
  profile: 'eodi:profile',
  myMedicines: 'eodi:myMedicines',
  aiMode: 'eodi:aiMode',
  apiKey: 'eodi:apiKey',
};

export const storage = {
  async getProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.profile);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },
  async setProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
  },
  async getMyMedicines(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(KEYS.myMedicines);
    return raw ? (JSON.parse(raw) as string[]) : [];
  },
  async setMyMedicines(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.myMedicines, JSON.stringify(ids));
  },
  async getAiMode(): Promise<'mock' | 'real'> {
    const raw = await AsyncStorage.getItem(KEYS.aiMode);
    return raw === 'real' ? 'real' : 'mock';
  },
  async setAiMode(mode: 'mock' | 'real'): Promise<void> {
    await AsyncStorage.setItem(KEYS.aiMode, mode);
  },
  async getApiKey(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.apiKey);
  },
  async setApiKey(key: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.apiKey, key);
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
