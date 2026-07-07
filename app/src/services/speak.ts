import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
// 한국어 음성 재생 (표현집 "바로 말하기")
//  - 1차: 웹 SpeechSynthesis(브라우저 내장 한국어 음성) — 오프라인·무비용·즉시.
//  - TODO(업그레이드): 고품질 오프라인은 사전생성 mp3(Google TTS) 번들.
//    네이티브 앱은 expo-speech 도입 필요(현재 미설치). 지금 배포 타깃은 웹.
//  - ⚠️ 폰에 한국어 음성이 없으면 어색할 수 있음 → 재생과 함께 항상 "큰 한국어 자막"을 병행 표시한다(화면이 최종 안전망).
// ─────────────────────────────────────────────────────────────

let koVoice: any = null;

function pickKoVoice(synth: any) {
  if (koVoice) return koVoice;
  const voices = synth.getVoices ? synth.getVoices() : [];
  koVoice =
    voices.find((v: any) => v.lang === 'ko-KR') ||
    voices.find((v: any) => (v.lang || '').toLowerCase().startsWith('ko')) ||
    null;
  return koVoice;
}

export type SpeakResult = 'ok' | 'no-voice' | 'unsupported';

/** 한국어 문장을 소리내어 읽는다. 재생 가능 여부를 반환(자막 폴백 판단용). */
export function speakKorean(ko: string): SpeakResult {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !(window as any).speechSynthesis) {
    return 'unsupported';
  }
  const synth = (window as any).speechSynthesis;
  try {
    synth.cancel(); // 연타 시 이전 음성 중단 후 재생(겹침 방지)
    const u = new (window as any).SpeechSynthesisUtterance(ko);
    u.lang = 'ko-KR';
    u.rate = 0.92; // 응급 상황 또박또박
    const v = pickKoVoice(synth);
    if (v) u.voice = v;
    synth.speak(u);
    return v ? 'ok' : 'no-voice'; // 한국어 음성 미탑재면 자막 강조 필요
  } catch {
    return 'unsupported';
  }
}

export function stopSpeaking() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).speechSynthesis) {
    (window as any).speechSynthesis.cancel();
  }
}
