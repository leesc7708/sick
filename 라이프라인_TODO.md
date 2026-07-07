# 라이프라인(Lifeline) TODO — 전문가 검증 반영

작성일: 2026-06-08 (5개 전문가 팀 검증 기반)
근거: `라이프라인_전문가검증_2026-06-08.md`

> 우선순위: **P0 = 콘테스트 제출/신뢰 직결(즉시)** · P1 = 완성도·차별점 · P2 = 품질·실서비스 준비

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
- ⏳ 다음: mp3 고품질 오프라인화 · 문장 100개로 확장 · 역방향(의료진→환자) Phase2 · E-9 주력국 언어(네팔·크메르 등)

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
