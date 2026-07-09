import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { storage } from '../services/storage';

// 복약 알림 (기능 ②): 앱이 열려 있는 동안 브라우저 알림.
//  - 30초마다 현재 시각과 복약 시간(HH:MM)을 비교 → 일치 & 오늘 미복용 & 권한 허용이면 알림.
//  - 웹 전용(Notification API). 네이티브/미지원 환경은 즉시 반환(무해).
//  - 백그라운드(앱 꺼짐) 알림은 서비스워커+FCM 필요 — 여기선 다루지 않음(기능 ③ 별도).
export function MedReminder() {
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) return;
    let alive = true;

    const check = async () => {
      if (!alive) return;
      if (Notification.permission !== 'granted') return;
      let meds;
      try { meds = await storage.getMyMedicines(); } catch { return; }
      if (!meds.some((m) => m.times && m.times.length)) return;
      let taken: Record<string, boolean> = {};
      try { taken = await storage.getMedTakenToday(); } catch { /* 무시 */ }
      const d = new Date();
      const now = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const dayTag = d.toDateString();
      for (const m of meds) {
        for (const tm of m.times || []) {
          if (tm !== now) continue;
          if (taken[`${m.id}@${tm}`]) continue;
          const fk = `${m.id}@${tm}@${dayTag}`;
          if (fired.current.has(fk)) continue;
          fired.current.add(fk);
          try { new Notification('💊 복약 시간', { body: `${m.name} 드실 시간이에요 (${tm})`, tag: fk }); } catch { /* 무시 */ }
        }
      }
    };

    check();
    const iv = setInterval(check, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  return null;
}
