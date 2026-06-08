# 라이프라인 Lifeline (Expo + React Native)

> 📌 이름 최종 확정: 어디아파 → 세이프콜 → **라이프라인 (Lifeline)** (2026-06-08). 산업현장 근로자 안전·응급(@work) 앱.
> 외부 데모: **https://lifeline-safety.web.app**

산업현장 근로자 안전·응급 + 병원 연결 도우미 앱. (구 "어디아파"·"세이프콜")

## 구현 범위 (Phase 1 + Phase 2)

- ✅ 5단계 온보딩 (연령/성별/임부수유/기저질환/알레르기/복용약)
- ✅ 홈 (6개 기능 타일 + 프로필 카드)
- ✅ 증상 입력 (자연어 + 12개 신체 부위 + 통증 강도 + 지속 시간)
- ✅ Red Flag 시스템 (9가지 응급 패턴 클라이언트 검출 + 119/응급실 안내)
- ✅ AI 증상 분석 (Mock / 실제 Claude API 스위치)
- ✅ 분석 결과 (가능 상태 / 진료과 / 자가 관리 / 긴급도)
- ✅ 병원 찾기 (8개 mock 병원, 진료과/영업시간/주차 필터, 거리/평점 정렬, 전화·카카오맵 연결)
- ✅ 약 검색 (8개 mock 약품, 일반/전문 구분)
- ✅ 약 상세 (효능/복용법/주의사항/성분/보관)
- ✅ 내 약 목록 (AsyncStorage 영구 저장)
- ✅ 약 상호작용 체크 (5단계 위험도 시각화)
- ✅ 설정 (AI 모드 전환, Anthropic API 키 관리, 데이터 초기화)

## 실행

```powershell
cd app
npx expo start
```

Expo Dev Tools가 뜨면:
- 휴대폰 — Expo Go 앱 설치 후 QR 코드 스캔
- 안드로이드 에뮬레이터 — `a`
- iOS 시뮬레이터 (macOS) — `i`
- 웹 브라우저 — `w`

## Claude API 연동

기본은 Mock 모드(키 없이 동작). 실제 Claude API를 쓰려면:

1. https://console.anthropic.com 에서 API 키 발급
2. 앱 실행 → 홈 → ⚙️ 설정 → "실제 (Claude)" 선택
3. API 키 입력 후 저장
4. 홈 화면 우상단 배지가 "AI: 실제"로 변경됨

키는 `AsyncStorage`에 기기 로컬로 저장됩니다.
※ 프로덕션 배포 시에는 키를 클라이언트에 보관하지 말고 서버 프록시를 통해 호출해야 합니다.

## 안전망 (Red Flag)

AI 모드와 관계없이, 증상 입력 시 항상 클라이언트에서 응급 키워드를 1차 검출합니다.
`src/data/redFlagKeywords.ts` 의 9개 규칙:

1. 흉통 + 호흡곤란
2. 인생 최악의 두통 (벼락두통)
3. 의식 변화/혼돈
4. 발열 + 목 경직 (수막염)
5. 심한 복통 + 반발통
6. 편측 마비/언어장애 (뇌졸중)
7. 아나필락시스
8. 심한 출혈
9. 영유아 고열 + 의식저하

검출 시 즉시 RedFlag 화면으로 전환되어 119/응급실 안내가 우선됩니다.

## 폴더 구조

```
src/
  components/   - Screen, Card, PrimaryButton, Disclaimer
  data/         - mockHospitals, mockMedicines, redFlagKeywords, bodyParts
  navigation/   - RootNavigation (Stack Navigator)
  screens/      - 11개 화면
  services/     - ai (mock+real), storage (AsyncStorage 래퍼)
  theme/        - colors, typography
  types/        - 공통 타입
```

## 다음 단계 (실제 서비스화 전 필수)

기획서 §11 법적 고려사항 참고:

- [ ] 의료진/약사 자문단 구성 및 콘텐츠 검수
- [ ] 식약처 의약품안전나라 공공데이터 연동 (현재 8개 mock → 6.5만 품목)
- [ ] 건강보험심사평가원 병원 API 연동 (현재 8개 mock → 전국)
- [ ] 카카오/네이버 지도 SDK 통합 (현재 URL 링크만)
- [ ] AI 응답 서버 프록시 (API 키 클라이언트 노출 금지)
- [ ] ISMS-P 인증, 개인정보 암호화
- [ ] 의료법/약사법 검토 (법률 자문)
- [ ] 배상책임보험
- [ ] 접근성 (WCAG 2.1 AA) 정식 감사
