# 라이프라인(Lifeline) TODO — 전문가 검증 반영

작성일: 2026-06-08 (5개 전문가 팀 검증 기반)
근거: `라이프라인_전문가검증_2026-06-08.md`

> 우선순위: **P0 = 콘테스트 제출/신뢰 직결(즉시)** · P1 = 완성도·차별점 · P2 = 품질·실서비스 준비

---

### 2026-07-08 | P0 2건: 부적합 자가체크 로그 재설계 + 민감정보 동의·개인정보 처리방침
- **[P0] 부적합 자가체크→작업진행 로그 재설계**(중처법 역효과 해소): 기존엔 음주·수면부족·어지럼이어도 무조건 "체크 완료"로 저장 → '사업주가 부적합 알고도 투입' 증거화 위험. WorkHealthCheck에 result('ok'/'caution'/'unfit')·advisedStop 추가. **위험작업(밀폐·화학·고소)+부적합=unfit**→"작업 보류·관리자 즉시 보고" 강경 배너+빨강 버튼, 일반작업+부적합=caution(주의), 그 외 ok. 부적합도 정직하게 result로 기록(감사추적). 판정 로직 6케이스 검증 통과
- **[P0] 민감정보 수집·이용 동의**(Play Store 필수/개인정보보호법): 온보딩에서 기저질환·알레르기·복용약을 무동의 수집하던 것 → 체크박스 동의 신설. 미동의+민감정보 입력 시 저장 차단·안내, 미동의 시 해당 필드 저장 안 함(빈 배열). storage.get/setHealthConsent(동의 시각 ISO 기록). 게이팅 로직 4케이스 검증 통과
- **개인정보 처리방침 화면 신설**: PrivacyPolicyScreen + data/privacyPolicy.ts(ko/en 정식 7절: 수집항목·목적·저장위치·국외이전·보유파기·이용자권리·문의, 나머지 5개 언어 en 폴백). 실제 구조 정직 고지(민감정보=기기 로컬, 계정=Firebase 서울, AI상담 시만 국외이전). 온보딩 동의카드+설정에서 진입
- 신규 t() 키 9개 7개 언어 전체 번역(wc_unfit_*·consent_*·privacy_*). tsc 통과·빌드·audio 복사·배포 완료
- ⏳ 남은 P0: DeptConsult 결과화면 다국어(KB 언어필드화)·특수건진 유효기간 유해인자별 / P2: Cloud Functions·FCM·오프라인큐잉 / E-Gen키·KIPRIS(형님)

### 2026-07-08 | P0 5건 구현 완료 + 외부 디자인팀 점검 반영(UI/UX 개선)
- **P0 5건 전부 구현·배포·e2e**(계획: 라이프라인_P0실행계획_아키텍처): #5 위치정보 처리방침 / #1 온보딩 도달경로 복구 / #4 WorkCheck 기본값 미선택+tookMeds 참고분리 / #3 최고권한 변경 확인 다이얼로그 / #2 관리자 읽기범위 축소(rules). #2 e2e 14/0(svisor 전사 덤프 차단·usernames get·신 watchMembers·긴급 라우팅)
- **#1 보강**(스크린샷서 발견): 로그인 전환 시 온보딩 건너뛰던 타이밍 버그 → user&&!onboarded면 Home을 스택에서 제외(RN auth 패턴). 실브라우저 재캡처로 온보딩 정상 진입 확인
- **외부 디자인팀 실스크린샷 점검**(모바일 실렌더 5장 + 토큰): 진단=①흰-위-흰 저대비로 납작 ②채도색 무위계 적층 ③이모지/라인아이콘 혼재. TOP5 반영:
  - 배경 #F9FAFB→#EEF1F4 + shadow.card 강화(0.06→0.10) → 카드 부양감(전 화면 즉효)
  - 이모지→라인아이콘 통일(Icon.tsx vest/user/speech 추가, 온보딩 모드·홈 인사말)
  - 색 위계: 홈 응급신호 버튼 solid→outline(119만 loud), 모드토글 주황Chip→세그먼트 컨트롤
  - FAB 스크롤 반응형(fabStore, 로그인·최상단 숨김) + 홈 하단여백 겹침 해소
  - Chip 터치타겟 44px, WorkCheck unfit 배너 위계 강화(아이콘+h3)+색 토큰화(emergency/warningLight)
- **디자인 P1/P2 추가 완료**(실브라우저 재캡처 검증):
  - 로그인: 세로 중앙정렬+아이디/비번 라벨+placeholder 대비 / LangSwitcher 세로늘어남 회귀 수정(flexGrow:0)
  - 홈 3섹션 그룹핑(건강·응급/현장@work/내 기록·설정, 다국어 라벨)
  - 응급실 병상 상태 컬러 배지 승격(초록 가용병상N/빨강 만실 pill)
  - 접근성 props(accessibilityRole/Label/State) — PrimaryButton·ListTile·Chip·세그먼트·역할pill
- 검증: 매 배치 tsc·빌드·배포·실브라우저 스크린샷 확인(로그인·홈·워크체크·병원·표현집·증상정리 회귀 0). 자산 wheresick-5617a.web.app
- 남은 디자인(저우선): @work 워드마크 pill화·빈상태 CTA·라운드 완전통일 (문서 라이프라인_3팀검토)
- ⏳ 미구현 기능(P1, 디자인 아님): unfit WorkCheck '관리자 즉시 보고'가 아직 로컬저장만 → svisor 서버전송 필요(중처법 감사추적 실질화). 2계정 라이브 긴급 시연 녹화

### 2026-07-08 | 회원 승인·역할배정 화면(ssvisor 키스톤) + 2계정 e2e 검증
- **발견**: 어제 만든 로그인·역할·크루 시스템에 **가입자 승인/역할부여 UI가 부재**(ManagerDashboard는 로컬스토리지 데모, 실제 승인기능 없음). ssvisor만 rules상 role/status 변경 가능한데 이를 실행할 화면이 없어 **활성 svisor·worker 생성 불가 → 2계정 e2e 자체가 막힘**. mmersum만 콘솔 수동설정 상태였음
- **UserAdminScreen 신설**(ssvisor 전용): listUsers()로 전체회원(승인대기 우선정렬) + 역할버튼(근로자/에스바이저/떠블에스바이저) 원터치 승인=active 승격 + 거부. auth.ts에 listUsers()·setUserRoleStatus() 추가. 홈에 ssvisor용 "회원 승인·역할 관리" 진입버튼. 본인 총괄권한 자가해제 방지
- **2계정 e2e 실백엔드 검증 14/0 통과**(실 Firebase SDK+실 firestore.rules 관통, tools 스크립트 scratchpad): 가입→ssvisor승격(gcloud REST)→회원목록조회→워커승인→**워커 자가 권한상승 시도 거부(rules 차단 확인)**→크루생성→아이디검색→워커추가→소속조회→긴급알림생성→관리자 라우팅수신→ack→자기이탈. 테스트데이터 자동정리
- tsc 통과·빌드·audio-ko 102개 복사·hosting 배포 완료(wheresick-5617a.web.app)
- ⏳ 남은것 그대로: P2 Cloud Functions(멤버십 하드닝·미응답3분 확산)·FCM 웹푸시·오프라인큐잉 / 남은 P0(DeptConsult 결과 다국어·민감정보 동의·부적합자가체크 로그·특수건진 유효기간) / E-Gen키·KIPRIS(형님). ⚠️브라우저 UI 픽셀 실테스트는 별도(로직·규칙 e2e는 통과)

---

## 🔴 P0 — 제출 전 반드시 (말과 실물 일치 회복)

- [ ] **구버전 위반 화면 격리/제거** — `SymptomResultScreen`(병명·확률 배지), `ai.ts`의 `realAnalyze`/`SYSTEM_PROMPT`/`MOCK_PATTERNS`, `MedicineSearch`/`MedicineDetail`/`InteractionCheck`, `mockMedicines.ts`, `redFlagKeywords.ts`, `storage.getApiKey/setApiKey/KEYS.apiKey`, 미사용 `FloatingSOS`.
      → 코드 보존 규칙상 삭제 대신 **`/legacy` 폴더 격리 + tsconfig/번들 exclude** 권장. (개발·의료·보안·심사 4팀 공통)
- [ ] **응급 경로 다국어화** — `redFlags.ts` 증상 14종 + 판정 메시지 + `firstAid`/`FIRST_STEPS` + `careGuide`를 `{ko,en,zh,ja,vi,th,es}` 구조로, `RedFlag`/`IncidentReport`/`SymptomSummary`/`HospitalFinder`에 `t()` 적용. "보여주기 카드"는 **모국어+한국어 병기**. (개발·UX 2팀)
- [ ] **검진기록 공유 허위 보안 문구 수정**(즉시·한 줄) — "30분 만료·다운로드 차단"을 "데모 미리보기 — 실제 만료/접근제어는 서버 연동 후 적용"으로. "만료 링크 공유"≠"관리자 전송" 동작 분리. (UX·의료·보안 3팀)

## 🟠 P1 — 완성도·차별점·발표 신뢰

- [ ] **E-Gen 실시간 응급실 API 1건 실연동** — 공공데이터포털 무료 키 발급 → 1개 지역 실시간 가용병상. 차별점 2번을 "사실"로. 못 붙이면 전 화면 "데모 데이터" 정직 라벨링. (심사)
- [ ] **AI 키 Cloud Functions 프록시 이전** — 디와이온 기존 Firebase Functions 재활용. 보안 + "기존 인프라 재활용" 주장 동시 실현. (심사·보안)
- [ ] **홈 상시 119 직통 버튼** — 응급신호 체크 없이 1탭 `tel:119`. 현재 최소 4탭. (UX)
- [ ] **ScrollTopFab footer 겹침 수정** — footer 있는 화면에서 FAB 위치 상향 또는 숨김. (개발·UX)
- [ ] **개인정보 동의 플로우 + 처리방침/약관 화면** — 온보딩 민감정보(기저질환·알레르기·복용약) 수집 별도 동의. Play Store 등록 필수 요건. (의료규제)
- [ ] **관리자 멀티유저 "최소 2계정 시연"** — 근로자1→관리자1 Firestore 1컬렉션 실동기화로 "관리자가 남의 사고보고를 실시간으로 본다" 장면 하나만 진짜로. (심사·백엔드 2a 일부)

## 🟡 P2 — 품질·실서비스 준비

- [ ] **민감정보 암호화 저장** — AsyncStorage → `expo-secure-store` 또는 서버 이전. 건강정보 평문 저장 해소. (보안 HIGH)
- [ ] **나머지 화면 전체 i18n** — 작업체크·복약·기록·관리자 등 잔여 화면 + `DOC_INFO` 등 데이터.
- [ ] **인라인 컴포넌트 모듈화** — `Row`/`Info`(RedFlag), `Question`(WorkCheck)를 모듈 스코프로. `LanguageContext` value `useMemo`/`useCallback` 안정화. (개발 성능)
- [ ] **`ImagePicker.MediaTypeOptions` → `mediaTypes:['images']`** (SDK56 deprecated). (개발)
- [ ] **HistoryScreen 날짜 정렬 표준화** — 비교 키를 통일된 ISO/Date로. (개발)
- [ ] **KIPRIS 상표 정밀검색 + 도메인 확보**(lifeline 계열). 사업화 특전 대비. (심사)
- [ ] **위급도/응급 화면에 출처 표기** — "119 신고요령/대한심폐소생협회 기준" 등. gray 레벨 "응급 아님 단정" 문구 완화. (의료규제)
- [ ] **사업성 1p에 디와이 실수치 1개** — 작년 특수건진 제출 횟수·현장 수 등. 일반론("중대재해=수억") 보강. (심사)

---

## 진행 메모
### 진행 현황 (2026-06-08 검증 + 외부테스트 3팀 반영)

**✅ 완료 (빌드·배포·커밋·push)**
- P0-1 구버전 격리(`_legacy`) · P0-3 검진공유 문구 · P1-6 홈119 · P1-7 FAB
- P0-2 다국어 7개 언어 9화면: 홈·온보딩·설정·응급신호·사고보고·진료요약(위급도/대처)·병원찾기·작업체크 + 데이터(redFlags/firstAid/careGuide) — 기능QA·다국어QA 모두 적용·완전성 확인

**🔴 외부 테스트 새 발견 (다음 우선)**
1. [즉시] `src/data/mockHospitals.ts` 고아 파일 → `tsc --noEmit` 8건 실패. `_legacy`로 이동 or 삭제 (격리 누락분, 활성앱엔 무해하나 CI 적신호)
2. [외국인 치명] **첫 진입 언어 선택 없음 + 언어 토글이 설정 깊숙이** → 한국어 못 읽는 외국인이 번역에 도달 못함. 첫 화면/홈 상단 언어 선택 필요
3. [핵심] `SymptomInputScreen` 다국어 미적용 → 입력→응급신호→진료요약 흐름의 입력 단계가 막힘. `options.ts` 칩 라벨 `Record<Lang>`화 필요
4. 사고보고 성공 Alert·공유 메시지·`HealthRecords/History/Manager`의 Alert·저장 enum이 한국어 잔존
5. 미적용 6화면: SymptomInput · MyMedicines · History · HealthRecords · ManagerDashboard · HealthRecordShare
6. 번역 경미: th `it_poison`(버튼 모호)·`it_choke`, vi 구어체 → 원어민 검수 권장 (치명 오역은 없음)
7. `_legacy` 내부 import 깨짐(재활성화 불가) — 보존 의도면 내부경로 `./`로 수정

**⏳ 남은 P2**: 개인정보 동의화면 · 인라인컴포넌트 · ImagePicker · History 날짜정렬 · 출처표기 · LanguageContext useMemo
**🔑 외부(형님)**: E-Gen키 · ~~AI프록시~~(2026-07-07 완료) · 멀티유저 · KIPRIS 상표·도메인

### 2026-07-07 | 진료과 상담 AI 연결 완료 (Claude Haiku, 자유문장 상담 라이브)
- Firebase Blaze 전환(형님) 완료 → Cloud Functions v2 `deptConsult`(asia-northeast3) 배포. Claude Haiku(claude-haiku-4-5)로 자유문장→진료과 안내
- 키는 DY ON functions/.env의 CLAUDE_API_KEY 재사용, lifeline functions/.env에만 저장(git 제외, 앱 미노출). 호스팅 rewrite /api/dept-consult(동일출처, CORS 불필요) + gcf-artifacts cleanup 정책(1일)
- 프롬프트: 진단·처방 금지·진료과 안내만, dept/alt는 한국 진료과 한글명, reason/tip은 사용자 언어로. 실테스트 ko/es/en 통과("발목 삠→정형외과", "용접 후 눈→안과" 정확)
- 프론트: 자유문장→AI 함수, 빠른칩→무료 규칙기반, 실패시 규칙기반 폴백. 화면 async+로딩. dc_ai_note 7개언어 "AI 작동"으로 갱신
- ⚠️ 비용: Haiku 상담 1건 ~1원, maxInstances:5로 폭주 방지. 결제 예산알림 권장

### 2026-07-07 | 외부 전문가 4인 장단점 검토 + AI 응급 안전망 강화(생명직결 P0)
- 외부 4인(응급의학·이주노동자·산업안전·AI규제) 검토 → `라이프라인_외부전문가4인_장단점_2026-07-07.md`. 치명발견 4: ①AI가 응급 안전망 우회(비전형 심근경색 놓침) ②7개언어가 홈까지만(결과·검진QR 한국어) ③증상 국외이전 무고지·무동의 ④부적합 자가체크→작업진행 로그(중처법 역효과)
- **[생명직결 즉시수정] AI 응급 안전망**: 함수 프롬프트 응급목록 대폭 확충(비전형 심근경색·후방순환 뇌졸중·대동맥박리·폐색전·고환염전·저혈당·패혈증·산업재해)+과대분류 원칙+프로필(나이·기저질환·복용약) 전달 / deptConsult.ts scanEmergency 백스톱(AI 과소평가시 강제 emergency 상향, 규칙폴백에도 적용) / DeptConsult 화면 응급시 원터치 119 / KB 흉통·가스흡입 → 응급의학과·emergency. 검증: "명치 답답·체한느낌"→응급의학과 emergency(전엔 놓침), 무릎시큰→normal(과잉경보 없음)
- 브리핑 자료: `라이프라인_콘테스트_브리핑요약_2026-07-07.md` + `라이프라인_브리핑_한장요약.html`(시장통계 법무부2026.4)
- 타임라인 정리: `라이프라인_타임라인_어디아파에서_현재까지.md`
- ⏳ 남은 P0: 결과화면·빠른칩·검진QR 다국어(KB 언어필드화) · 국외이전/민감정보 동의 · 부적합자가체크→작업진행 로그 재설계 · 특수건진 유효기간 유해인자별

### 2026-07-07 | 응급 표현집 "바로 말하기" 신규(3팀 회의 → MVP 배포)
- 기획·개발·테스터 3팀 회의 → `라이프라인_응급표현집_3팀회의_적용계획_2026-07-07.md`. 핵심=부위×양상 매트릭스 2탭, 사전mp3(오프라인)+SpeechSynthesis, "검수 안 된 문장 노출 금지"(오역=의료사고)
- 강위 결정: 의료통역 검수 불가 → 클로드 생성 번역 + 부정문/약/알레르기만 주의 + 신고버튼. 7개언어 다 넣고 웹 먼저
- MVP 구현·배포: emergencyPhrases.ts(부위×양상 ~48문장 × 7개언어, 응급/산재/부위8/과거력/요청/기본) + speak.ts(웹 SpeechSynthesis 한국어, 자막 병행) + PhrasebookScreen(부위 2탭→탭하면 한국어 음성+큰 자막, UI도 7개언어, 119버튼, 오역 신고) + 홈 타일 🗣️ + 네비/타입/번역
- ⚠️ 음성은 현재 브라우저 SpeechSynthesis(폰에 한국어 음성 없으면 어색→자막 병행 안전망). 업그레이드=사전생성 mp3(Google TTS, gcloud 필요). 네이티브는 expo-speech 필요
- 확장1: 문장 48→78 (부위×양상 심화 + 응급·산재·과거력 추가) + **역방향(의료진→환자) 12문항** 추가. speak.ts를 7개 언어 재생으로 일반화. 화면에 모드 토글(내가 말하기/의료진이 묻기). tsc·빌드·배포 완료
- 확장2: 문장 78→**101개**(귀·코·이·목·변혈·항응고제·건강보험 등 추가). 역방향 12문항 유지
- **[P0 완료] 국외이전 동의 고지**: DeptConsult 자유문장 AI 사용 전 7개언어 동의팝업(storage.getAiConsent) + 입력창 아래 상시 안내. 미동의 시 consultAI(allowAI=false)로 해외 전송 없이 규칙기반만. 개인정보보호법 제28조의8 대응
- ⏳ 다음: mp3 고품질 오프라인화(gcloud 필요) · E-9 주력국 언어(네팔·크메르 등) · [남은 P0] DeptConsult 결과화면 다국어(KB 언어필드화)·민감정보 동의·부적합자가체크 로그·특수건진 유효기간

### 2026-07-07 | 로그인 시스템(P1) + 현장그룹·긴급알림(P2-v1) + gcloud 백엔드 셋업
- **Firebase 백엔드 gcloud로 셋업**(콘솔 클릭 0): Auth 초기화·이메일/비번 활성화, Firestore Native(서울) 생성, TTS mp3 생성, 웹앱 등록. 인증=wiiInfo tmzkt2 캐시 재사용
- **P1 로그인**: 아이디+비번(가짜메일 매핑), 역할 general/worker/svisor(에스바이저)/ssvisor(떠블에스바이저,모든DB). 미승인=AI차단. LoginScreen(최초 언어선택)/SignupScreen(아이디·비번·이름·전화, 현장선택 제거=외국인금지). 홈에 로그인자 이름·역할 표시. 로그아웃(설정)
- **P2-v1 현장그룹·긴급(CF없이 작동)**: crew.ts+CrewScreen. 에스바이저가 오늘 그룹 생성(종료시각 직접설정=야간대응)→아이디로 워커 강제추가→워커 홈 "오늘 소속"배너+긴급버튼(위치포함 alert)→에스바이저 실시간 수신(onSnapshot+경고음+확인). 라우팅=notifyUid(생성 svisor에게만). 워커 자기이탈 가능. firestore.rules 역할기반(crews/crewMemberships/alerts)
- **3팀 결정 확정**: FCM도입O·생성자만+미응답확산·워커자기이탈·야간=svisor설정. 문서 라이프라인_현장그룹_긴급알림_3팀종합
- ⏳ P2 남은것: **Cloud Functions**(강제멤버십 하드닝·alert notifyUid 재확정·미응답3분 확산)·**FCM 웹푸시**(알림전용SW,안드탭닫힘)·ssvisor 엑셀 스프레드시트 대시보드·오프라인 큐잉. 도메인=wheresick-5617a.firebaseapp.com 단독(lifeline-safety 삭제). ★순수웹 유지(PWA/설치팝업 금지)
- ⚠️ 미검증: 2계정(svisor+worker) e2e는 브라우저 실테스트 필요(tsc·빌드·배포·규칙배포·사이트로드는 통과). 이성천(mmersum)=ssvisor·active로 설정됨

### 2026-07-07 | 표현집 고품질 한국어 음성(Google TTS Wavenet) 적용
- **gcloud 기존 인증 재사용**(wiiInfo에서 로그인한 tmzkt2 계정 캐시 살아있음 → 재로그인 불필요). tools/gen-ko-tts.js로 self 102문장 ko mp3 생성(ko-KR-Wavenet-A, rate 0.92). ⚠️ 로그인 토큰은 x-goog-user-project 헤더(wiigame-448c7) 필수
- speak.ts playPhraseAudio: /audio-ko/<id>.mp3 우선 재생, 실패 시 SpeechSynthesis 폴백. PhrasebookScreen self=mp3, staff=환자언어 TTS
- ⚠️ **배포 절차**: expo export 후 audio-ko\*.mp3 → dist\audio-ko\ 복사 필수(expo가 자동복사 안 함) → firebase deploy. mp3 102개 커밋됨
- 뒤로가기 단계별 수정 + DeptConsult 위급도 라벨 7개언어도 이 배치에 포함

### 2026-07-07 | 사업 3팀 검토 + 진료과 상담 기능 추가
- 외부 3팀(마케팅·원가·벤처) 검토 → `라이프라인_3팀검토_마케팅_원가_벤처_2026-07-07.md`. 공통 지적: "법적강제=구매" 비약, "마진200%" 지표오류, 데모 목업/허위 정직화, 숫자(BEP·TAM) 부재
- 사업성 1p 재작성 → `라이프라인_사업성_1페이지_재작성_2026-07-07.md`: "마진200%" 삭제→BEP(현금14/완전원가40 사업장)·티어가격표, 유동인력·다현장 페인포인트로 포지셔닝 재정의, "중대재해=수억" 삭제→행정비 절감 주력
- **진료과 상담 기능("어느 과 가야 하나요?") 신규**: departmentGuide.ts(헷갈리는 케이스 17종: 다래끼→안과 등 + 산업현장 특화) + deptConsult.ts(규칙기반, AI확장 자리 구조화) + DeptConsultScreen.tsx. 홈 진입점·네비·타입·번역 연결. 병원찾기에 진료과 필터 파라미터 추가 + 병원 데이터 진료과별 확장. 진단 아닌 '진료과 안내'로 의료법 준수. tsc 통과·빌드·배포 완료(lifeline-safety.web.app)

### 2026-07-07 | 디자인팀 검토 + P0 3건 적용
- 외부 디자인팀 검토(코드 정독+웹 벤치마킹): 토스/E-Gen/똑닥/WHO트리아지/SafetyCulture/안전신문고/KRDS. 진단=토큰은 양호하나 ①이모지 아이콘 싼티 ②브랜드색 블루+오렌지 충돌 ③현장 대비 부족 ④홈 119 위계 역전 ⑤물방울 로고 헬스케어 잔재
- **P0-① colors.ts**: primary #3182F6→#1B64DA(대비↑), emergency #F04452→#DA1E28(WHO 의료레드), warning→#F5850B, success→#0E9F6E, textMuted #8B95A1→#5B636E(야외가독 7:1 목표). work 오렌지는 배지 액센트로 강등 명시
- **P0-② 라인 아이콘 통일**: components/Icon.tsx 신규(react-native-svg 기반 19종, 새 의존성 없이 기존 svg 활용). 이모지→SVG 자동 매핑(resolveIcon)으로 ListTile/PrimaryButton 2개만 수정 → 전 화면 자동 반영. ListTile 화살표도 chevron 아이콘화
- **P0-③ 홈 119 위계**: 전체폭·최상단·64px로 승격(구: 보조버튼 flex1.6 > 119 flex1 역전 해소). 응급체크는 아래 보조로
- 미리보기 시트(아이콘+팔레트+홈목업) HTML 제작. tsc 통과·빌드·배포 완료

### 2026-07-07 | 디자인 P1/P2 적용 (다크모드 제외)
- **P1 Pretendard 폰트**: expo-font 설치 + Pretendard Regular/SemiBold/Bold 탑재(robot 브로슈어 자산 재활용), typography 전체 fontFamily 지정 + 숫자 tabular-nums(119·병상·거리). App.tsx useFonts 비차단 로드(실패 시 시스템폰트 폴백). dist 번들 확인
- **P1 로고 ECG 교체**: LogoMark.tsx 청록·보라 물방울 폐기 → 생명선(ECG 맥박선) 블루+레드 2색. 팔레트 정합·헬스케어 잔재 제거
- **P1 ListTile**: 최소높이 60px, 아이콘박스 44→48
- **P2 병원찾기**: 탭을 세그먼트 컨트롤로(필터 pill과 시각 분리), 응급실 병상 상태 이모지→컬러도트 배지
- **P2 진료과상담**: 결과카드 좌측 WHO 3색 바(빨강/주황/초록) 추가
- tsc 통과·빌드·배포·미리보기 갱신 완료
- ⏸️ **다크모드 보류(의도적)**: 정적 colors import 구조라 전 파일 테마 컨텍스트 전환 필요 = 큰 리팩터. 라이브 브라우저 검증 없이 blind 적용은 데모 훼손 위험 → 별도 검증가능 세션에서 전용 작업 권장. 앱아이콘(assets/icon.png) 재생성도 별도(genIcons.js)
