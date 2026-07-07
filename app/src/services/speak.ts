import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
// 한국어 음성 재생 (표현집 "바로 말하기")
//  - 1차: 웹 SpeechSynthesis(브라우저 내장 한국어 음성) — 오프라인·무비용·즉시.
//  - TODO(업그레이드): 고품질 오프라인은 사전생성 mp3(Google TTS) 번들.
//    네이티브 앱은 expo-speech 도입 필요(현재 미설치). 지금 배포 타깃은 웹.
//  - ⚠️ 폰에 한국어 음성이 없으면 어색할 수 있음 → 재생과 함께 항상 "큰 한국어 자막"을 병행 표시한다(화면이 최종 안전망).
// ─────────────────────────────────────────────────────────────

// BCP-47 로케일 매핑 (SpeechSynthesis 음성 선택용)
const LOCALE: Record<string, string> = {
  ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', vi: 'vi-VN', th: 'th-TH', es: 'es-ES',
};

const voiceCache: Record<string, any> = {};
function pickVoice(synth: any, lang: string) {
  if (voiceCache[lang]) return voiceCache[lang];
  const locale = LOCALE[lang] || lang;
  const short = (LOCALE[lang] || lang).split('-')[0].toLowerCase();
  const voices = synth.getVoices ? synth.getVoices() : [];
  const v =
    voices.find((x: any) => x.lang === locale) ||
    voices.find((x: any) => (x.lang || '').toLowerCase().startsWith(short)) ||
    null;
  if (v) voiceCache[lang] = v;
  return v;
}

export type SpeakResult = 'ok' | 'no-voice' | 'unsupported';

/** 지정 언어로 문장을 소리내어 읽는다. 재생 가능 여부 반환(자막 폴백 판단용). */
export function speak(text: string, lang = 'ko'): SpeakResult {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !(window as any).speechSynthesis) {
    return 'unsupported';
  }
  const synth = (window as any).speechSynthesis;
  try {
    synth.cancel(); // 연타 시 이전 음성 중단 후 재생(겹침 방지)
    const u = new (window as any).SpeechSynthesisUtterance(text);
    u.lang = LOCALE[lang] || lang;
    u.rate = 0.92; // 응급 상황 또박또박
    const v = pickVoice(synth, lang);
    if (v) u.voice = v;
    synth.speak(u);
    return v ? 'ok' : 'no-voice'; // 해당 언어 음성 미탑재면 자막 강조 필요
  } catch {
    return 'unsupported';
  }
}

/** 한국어 전용 래퍼(기존 호출부 호환) */
export function speakKorean(ko: string): SpeakResult {
  return speak(ko, 'ko');
}

let currentAudio: any = null;

/** 표현집 한국어 재생: 사전생성 mp3(고품질 Wavenet) 우선, 실패 시 브라우저 TTS 폴백. */
export function playPhraseAudio(id: string, fallbackKo: string): SpeakResult {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !(window as any).Audio) {
    return speak(fallbackKo, 'ko');
  }
  try {
    stopSpeaking();
    const a = new (window as any).Audio(`/audio-ko/${id}.mp3`);
    currentAudio = a;
    a.play().catch(() => speak(fallbackKo, 'ko')); // mp3 없거나 재생불가 → TTS
    return 'ok';
  } catch {
    return speak(fallbackKo, 'ko');
  }
}

export function stopSpeaking() {
  if (currentAudio) { try { currentAudio.pause(); currentAudio.currentTime = 0; } catch {} }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).speechSynthesis) {
    (window as any).speechSynthesis.cancel();
  }
}
