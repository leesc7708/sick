# 라이프라인(Lifeline) TODO — 전문가 검증 반영

작성일: 2026-06-08 (5개 전문가 팀 검증 기반)
근거: `라이프라인_전문가검증_2026-06-08.md`

> 우선순위: **P0 = 콘테스트 제출/신뢰 직결(즉시)** · P1 = 완성도·차별점 · P2 = 품질·실서비스 준비

---

### 2026-08-26 | E-Gen·AI 상담 전면 중단(11일) — 원인: Blaze 결제 계정 해제

- **증상**: 병원·약국·응급실 어느 지역을 골라도 "조건에 맞는 곳이 없어요"만 표시. 사용자 신고로 발견.
- **진단 경로**(원인 계층을 위에서부터 하나씩 끊어냄):
  1. 라이브 `/api/egen-*` 6종 + `/api/dept-consult` → **전부 503**, 본문은 우리 JSON이 아니라 **구글 프런트엔드 HTML**. 함수 직접 URL도 동일 → Hosting rewrite 문제 아님.
  2. `firebase functions:list` → 7종 **등록은 살아 있음**(배포 누락 아님).
  3. `firebase functions:log` → **2026-08-15 09:43(KST) 이후 로그 0건**. 요청이 코드까지 도달조차 못 함.
  4. 코드에 `EGEN_SERVICE_KEY 미설정` 응답 분기가 5곳 있는데 **그 메시지가 안 나옴** → 우리 코드 미실행 확정.
  5. `.env`의 `EGEN_SERVICE_KEY`(64자)로 **로컬에서 E-Gen 직접 호출 → `resultCode:00` 정상 데이터 수신** → 키 문제 배제.
  6. Cloud Billing API → **`billingEnabled: false`**. 이후 구글 로그에도 그대로 찍힘: `The request failed because billing is disabled for this project.`
- **근본원인**: 프로젝트 `wheresick-5617a`의 **Blaze 결제 계정이 해제**됨. Functions 2세대는 Cloud Run 위에서 돌기 때문에 결제가 꺼지면 컨테이너가 아예 안 뜬다. 해제 시점은 **2026-08-15 오전**(마지막 정상 로그 09:43, 마지막 hosting 배포 09:59). 해제 사유(무료 크레딧 만료 / 카드 실패 / 수동)는 결제 콘솔에만 남아 있어 코드 쪽에서는 미확정. 재연결 직후 **12원이 정상 결제**된 것으로 보아 카드 실패보다는 크레딧 만료 쪽에 무게.
- **11일간 아무도 몰랐던 이유(진짜 문제)**: `src/data/egen.ts`의 모든 fetch가 실패를 `return []`로 삼켰다. 그래서 **총체적 장애가 "결과 0건"과 화면상 구분되지 않았다** — 사용자에겐 "그 지역엔 원래 없나 보다"로 보였다. 2026-08-14 항목의 "재발방지 규칙 6건"이 **TODO로만 남아 실제 구현이 없었던 결과**이기도 하다.
- **조치**:
  - 결제 재연결(사용자, 콘솔) → `billingAccounts/01ABF8-2332B1-2C2CCE`.
  - `firebase deploy --only functions` → 5종 update 성공 / egenBeds·egenTrauma는 "No changes detected" 스킵.
  - 재배포 직후 **egenTrauma 20건 정상 응답 1회 확인** → 함수 자체는 복구됨.
- ⏳ **미결(2026-08-26 기준)**: 이후 **전 함수 `HTTP 429 "Rate exceeded"`**(응답 200ms — 프런트엔드에서 즉시 반려). 로그: `The request was aborted because there was no available instance.` 결제가 11일 꺼져 있던 프로젝트의 **Cloud Run 인스턴스 할당량이 아직 복원되지 않은 상태**로 판단. 재배포·코드로 앞당길 수 없음. 확인처: `console.cloud.google.com/iam-admin/quotas?project=wheresick-5617a` → Cloud Run Admin API 항목.

**재발방지 — 이번엔 코드로 박았다 (①③ 구현 완료, ②④ 미구현)**

- ✅ **① 실패의 정직한 표시**(커밋 `0bfc25c`)
  - `egen.ts`: 전 fetch가 `EgenResult<T> = { status:'ok'|'fail', items }` 반환. 공용 `egenGet()`에서 `!res.ok`(503/500/4xx)·비JSON·`ok:false`·형식불일치를 모두 `'fail'`로 판정 — **"0건"과 절대 같은 값이 될 수 없다.**
  - `components/LoadError.tsx` 신설: 장애 안내 + **119 안내** + `[다시 시도]`(reload 카운터로 해당 조회만 재실행). 응급 앱이라 실패 시 119 경로를 반드시 같이 준다.
  - 적용 5지점: 중증수용 / 권역외상센터 / 응급실 실시간 병상 / 병원·약국 / AED.
  - `net_fail_title·desc·119`, `net_retry` **7개 언어** 추가.
- ✅ **③ `app/tools/api-smoke.js` 신설** — 배포 전후·장애 의심 시 1분 검증.
  - 결제 상태(`billingEnabled`) + 엔드포인트 7종 상태·건수, 실패 시 **종료코드 1**(CI·cron에 그대로 물릴 수 있음).
  - 503이면 결제/미배포, 500이면 `.env` 키 유실로 **원인 계층까지 안내**. `--direct`(함수 직접호출)로 Hosting/함수 문제를 가른다.
  - ⚠️ 알려진 한계: 7종을 동시에 때려 콜드스타트에서 429가 나올 수 있다. 순차 호출 + 429 재시도로 개선 필요.
- ❌ **② 외부 감시(미구현)** — GitHub Actions cron으로 매일 `api-smoke`를 돌려 실패 시 이슈+메일. **Firebase 밖에서 돌아야 한다**(결제가 꺼지면 Firebase 안의 감시는 같이 죽는다). 이번 사고를 실제로 "11일"이 아니라 "1일"로 줄이는 건 이 항목이다.
- ❌ **④ 결제 이탈 경보(미구현, 콘솔 작업)** — 예산 ₩10,000 + 50/90/100% 알림. 단 **예산 알림은 "요금 폭증"만 잡고 "결제 끊김"은 못 잡는다**(안 쓰면 알림이 안 온다). 결제 계정 관리자에 `mmersum1977`·`tmzkt2` **둘 다** 등록 — 한쪽에만 있으면 이번처럼 만료 메일을 놓친다.

- **검증**: `tsc --noEmit` 통과 / `check-i18n` **379키 × 7개 언어 전부 일치**, `t()` 325키 전부 정의.
- ✅ **배포 완료**(2026-08-26 17:35경, **hosting만**). Functions는 이번 변경에 없어 미배포 — 규칙 #1(`.env` 없이 functions 배포 금지) 회피.
  - 빌드: `expo export --platform web` 성공, 번들 2.5MB. `dist/audio-ko` mp3 **102개 유지**.
  - 번들 실물 검증: 신규 문구 **7개 언어 전부 포함** 확인. ⚠️ 번들러가 한글·태국어·일본어를 `\uXXXX` 형태로 이스케이프하므로 **원문 grep만 하면 "없음"으로 오판한다**(08-15 항목과 같은 함정 — 이스케이프 형태도 같이 검사해야 한다. `tools/`에 넣지 않고 일회성으로 돌렸다).
  - 라이브 검증(wheresick-5617a.web.app): `index.html`이 새 번들 참조 / 번들 200·2.46MB에 "실시간 정보를 불러오지 못했어요"·"급하면 기다리지 말고 119로 바로 전화하세요"·"다시 시도" 실물 확인 / 오디오 회귀 없음(`/audio-ko/a1.mp3` 200 audio/mpeg).
  - ⇒ **이제 429/503 상황에서도 사용자에게 "조건에 맞는 곳이 없어요"라고 거짓말하지 않는다.**

**429 정체 규명(2026-08-26 17:25경) — 할당량 아님**

- 콘솔에서 확인한 Cloud Run 할당량은 **전부 여유**: Services per region 7/1,000 · Active Revisions 7/4,000 · Total CPU 500/200,000 milli vCPU. ⇒ **할당량 상향 요청 불필요.**
- 429 응답 헤더가 `Server: Google Frontend`, 본문 `Rate exceeded.` — 우리 함수도 Cloud Run도 아닌 **구글 관문의 요청 속도 제한**.
- 결정적 근거: **같은 엔드포인트가 초 단위로 성공/실패를 오간다.** 17:19 외상센터 200 → 17:21 6종 전부 429 → 17:22 중증 200(54건)·병의원 200(30건) → 17:23 재시도 전부 429. 할당량이 막는 거면 이런 패턴이 안 나온다.
- 결제 복구 직후 프로젝트에 걸리는 **일시적 속도 제한**으로 판단. 시간에 따라 실제로 완화 중(한 시간 전 0/6 → 이후 간헐적 2/6).
- ⚠️ **감시가 한도를 갉아먹는다**: 5분마다 6종을 연속 호출하던 감시를 **5분에 1종(약국)만** 확인하도록 축소했다. 장애 조사 중 과도한 폴링은 그 자체가 복구를 방해한다. 감시 로그는 저장소 밖 취급(`.gitignore`의 `복구감시_*.log`).
- ⚠️ **승인 대기 2명 적체**: 최경식(`poxer`) 16:33, 박재원(`jmsamo20`) 16:47 — 장애 기간 중 가입해 조회가 하나도 안 됐을 것.

**배운 것 — 다음에도 그대로 쓸 것**

1. **실패를 빈 결과로 폴백하지 마라.** "없음"과 "못 가져옴"이 같은 화면이면 장애는 영원히 안 보인다. 폴백은 UX가 아니라 **은폐**다.
2. **응답 주체를 먼저 봐라.** 우리 코드가 만들지 않는 형식(HTML)이 오면 그 시점에 이미 "우리 코드 미실행"이 확정된다. 키·로직을 뒤질 시간이 없다.
3. **서로 다른 키를 쓰는 기능이 동시에 죽으면 키 문제가 아니다.** 공통 인프라를 봐라.
4. **재발방지는 TODO에 적는 순간 안 지켜진다.** 코드·스크립트로 박아야 한다(08-14 규칙 6건이 미구현으로 남아 이번에 그대로 당했다).

---

### 2026-08-15 | 근로자용 미번역 화면 3종 다국어화 + TODO 정합성 정정

- **먼저 발견: 아래 "🔴 P0" 체크리스트가 낡아 실제 코드와 어긋나 있었다.** 체크박스만 보고 착수하면 이미 끝난 일을 다시 하게 된다. 코드 확인 결과:
  - P0 "구버전 위반 화면 격리" → **완료**. `src/_legacy/`로 이동 + `tsconfig.json` `exclude`에 등록 + `RootNavigation.tsx`에서 import 주석 처리(번들 미포함).
  - P0 "검진기록 공유 허위 보안 문구" → **완료**(2026-06-08 진행 메모에 기록됨).
  - P1 "unfit 자가체크 관리자 즉시 보고가 로컬저장만" → **완료**. `crew.ts`의 `reportUnfit`/`watchUnfitReports`/`ackUnfitReport` + `firestore.rules`의 `workCheckReports` 규칙 + WorkCheck(전송)·Crew(수신 카드) 양쪽 UI까지 연결돼 있다.
  - ⇒ 남아 있던 진짜 구멍은 **다국어 미적용 화면**이었다. 한국어를 못 읽는 외국인 근로자가 핵심 사용자인데 자기 기록·복약·진료요약 화면이 한국어 전용이었다.
- **대상 3종 다국어화(7개 언어)**:
  - `MyMedicinesScreen` — 복약 기록·알레르기 메모·알림 문구·Alert 전부 `t()`화(의료 안전 직결인데 전량 한국어였음).
  - `HistoryScreen` — 목록 라벨 `t()`화. 저장된 한국어 원본(부위·작업종류·사고유형)도 표시 시 번역. **원본을 state에 두고 렌더 시 번역**하도록 바꿔 언어 전환이 목록에 즉시 반영된다(이전 구조는 포커스 시 문자열을 확정해 언어를 바꿔도 안 바뀌었을 것).
  - `SymptomSummaryScreen` — **모국어+한국어 병기**(TODO의 "보여주기 카드" 원칙 적용). 이 화면은 의료진에게 제시하는 용도라 사용자 언어로만 번역하면 오히려 의료진이 못 읽는다. 라벨·값·응급도 배지를 `모국어 / 한국어`로 병기하고, 공유 텍스트·PDF에도 동일 적용. 한국어 사용자에겐 중복 없이 한 번만 표기.
- **공용 맵 추출**: `src/i18n/optionKeys.ts` 신설(`BP_KEY`/`AC_KEY`/`WT_KEY`/`IT_KEY` + `label()`/`labelList()`). SymptomInput·IncidentReport에 중복 정의돼 있던 것을 합쳐, 저장값(한국어 canonical)↔표시 라벨이 화면마다 어긋나지 않게 했다. 저장 포맷은 그대로라 **기존 기록 호환**.
- **검사기 신설 `app/tools/check-i18n.js`**: 7개 언어 키 완전 일치 + 코드의 `t('키')` 정의 여부 검사. 언어 한 곳에만 키를 빠뜨리면 `t()`가 조용히 ko로 폴백해 "번역된 줄 알았는데 한국어"가 되는데, 이건 tsc·빌드로 안 잡힌다.
- **검증**: `tsc --noEmit` 통과 / `npm run build` 성공(643 모듈) / `check-i18n` 302키 × 7개 언어 전부 일치·t() 255키 전부 정의 / **번들 실물에서 7개 언어 새 문자열 표본 확인**(번들러가 한글·태국어는 `\uXXXX`, é·ú 등 Latin-1은 `\xXX`로 이스케이프하므로 원문 grep만 하면 "없음"으로 오판한다) / `dist/audio-ko` mp3 102개 유지.
- **배포 완료**(2026-08-15, hosting만). Functions는 이번 변경에 없어 미배포 — 규칙 #1(`.env` 없이 functions 배포 금지)을 피하는 가장 확실한 방법이기도 하다. firestore.rules도 변경 없음.
- **라이브 검증**(wheresick-5617a.web.app): 번들 200·2.31MB에 7개 언어 새 문자열 표본 12건 전부 확인 / 오프라인 음성 회귀 없음(`/audio-ko/a1.mp3`·`e10.mp3` 200 `audio/mpeg`) / 호스팅 rewrite 회귀 없음(`/api/egen-beds` **3/3 성공 383~443ms 실데이터**, 규칙 #4대로 1회로 끝내지 않음).
- ⏳ **남은 확인(사용자)**: 브라우저에서 언어를 바꿔가며 실화면 확인. 특히 진료 요약 카드의 **병기로 줄이 길어져 레이아웃이 밀리는지**는 코드·번들 검증으로 잡히지 않는다.
- ⚠️ **번역 품질**: 클로드 생성 번역(기존 방침과 동일). 응급·투약 지시문이 아니라 화면 라벨·안내 문구라 위험도는 낮으나 th/vi는 데모 전 원어민 검수 권장.
- ✅ **관리자 화면도 완료**(같은 날 후속, 아래 항목 참고) — 앱 전체 화면 다국어화 종결.

---

### 2026-08-15 | 관리자 화면 3종 7개 언어화 — 앱 전체 다국어 종결

- 대상: `ManagerDashboardScreen`·`CrewScreen`·`UserAdminScreen` 전량 `t()`화(73키 × 7개 언어, 누계 375키).
- **개수 표기 규칙 변경**: `긴급 3건` → **`긴급 (3)`**. "N건/N명"은 조사·어순이 언어마다 달라 문자열 이어붙이기로는 자연스러운 문장이 안 나온다. 괄호 표기는 전 언어 공통으로 안전.
- **치환자 도입**: 이름이 문장 중간에 오는 확인 다이얼로그(거부·총괄권한 부여·역할 변경·접근성 라벨)는 `{who}`/`{from}`/`{to}`/`{role}` + `LanguageContext`의 `fill()`. 영어 "Reject {who}?"처럼 어순이 뒤집히는 언어는 이어붙이기로 해결 불가.
- `UserAdmin`의 `ROLE_LABEL`/`STATUS_LABEL` 상수 → 키 맵으로 교체. 역할명은 `AccountScreen`의 기존 번역(Site manager/General manager 등)과 같은 표현으로 통일.
- `Crew`의 `workType`, `ManagerDashboard`의 사고유형은 한국어 canonical 저장값이라 `optionKeys`의 `label()`로 표시할 때만 번역(저장 포맷 불변).
- **검사기 보강 `tools/check-i18n.js`**: **치환자 일치 검사** 추가. 한 언어에서 `{who}`가 빠지면 이름이 조용히 사라지는데 화면엔 멀쩡한 문장이 나와 **tsc·빌드로 절대 안 잡힌다.** 일부러 깨뜨려 검출·exit 1까지 확인함.
- ⚠️ **작업 중 사고(기록용)**: 검사기 테스트로 `translations.ts`를 sed로 깨뜨린 뒤 `git checkout -- <file>`로 되돌렸더니 **같은 파일의 미커밋 작업 73키가 통째로 HEAD로 되돌아갔다.** 새 검사기가 즉시 잡아내 전량 재적용. → **규칙: 미커밋 변경이 있는 파일에 `git checkout --`을 쓰지 말 것.** 실험은 커밋 후에 하거나 사본으로 할 것.
- **배포 완료**(hosting만). functions·rules 변경 없음.
- **라이브 검증**: 번들 `index-333d4590…js` 200·2.34MB, 7개 언어 표본 17건 확인(치환자 `{who}`·`{role}`도 원문 유지) / `audio-ko` mp3 200 회귀 없음 / `/api/egen-beds` 3/3 성공(2006ms·421ms·360ms — 첫 호출은 콜드스타트).
- ⏳ 남은 것: 화면 다국어는 종결. 데이터 계열(`options.ts`의 `DOC_INFO` 등)은 미적용으로 남음.

---

### 2026-08-14 | [P0] 응급실 실시간 병상 먹통 수정 — 07-09 "키 활성화 대기" 항목 종결

- **증상**: 웹에서 **응급실 검색 → 빈 화면**. `/api/egen-beds`·`/api/egen-trauma`가 **5/5 결정적 실패**, 매번 정확히 **10.6초** 후 `{"ok":false,"error":"fetch failed"}`. 나머지 E-Gen 4개(severe/aed/hospitals/pharmacy)는 정상.
- **진단 경로**(같은 증상 재발 시 이 순서로):
  1. `firebase functions:log --only egenBeds` → 실패까지 걸린 **시간**을 본다. **10초대면 undici(Node fetch)의 기본 connect 타임아웃** = 연결 자체가 안 맺어진 것. DNS 실패면 즉시(`ENOTFOUND`) 떨어지므로 구분된다.
  2. 로컬에서 **동일 upstream URL을 직접 호출**해 키·API를 분리 검증 → 68ms `resultCode=00`(정상). ⇒ 키·URL·코드 문제 아님.
  3. 성공하는 함수와 코드 비교 → 동일 구조. ⇒ **함수별로 Cloud Run 서비스가 분리돼 외부 IP가 다르다**는 점이 남는 차이. 해당 IP가 data.go.kr 쪽에서 막힌 것으로 추정.
- **조치**: `fetchUpstream()` 공통 헬퍼(8초 명시 타임아웃 + 1회 재시도) / **`e.cause` 로깅**(기존엔 `fetch failed`만 남아 원인 확인 불가였던 게 진단을 막은 핵심) / 실패 응답에 `code`·사유 포함(`upstreamErrorPayload`) / `timeoutSeconds` 20→30. `egenBeds`·`egenTrauma`만 재배포(정상 4개 미변경).
- **결과**: 6/6 성공, 210~521ms. 병상 55건·외상센터 20건 실데이터. 커밋 `f2679e6`.
- ⚠️ **근본원인 미확정**: 재배포(새 리비전→인스턴스 교체)로 증상이 사라졌을 뿐, IP 차단이라는 확증은 없다. 이번에 넣은 `e.cause` 로깅으로 **재발 시에는 정확한 오류코드가 남는다**.

#### 🚫 같은 실수 반복 금지 — 운영 규칙
1. **`.env` 없이 `deploy --only functions` 절대 금지.** `app/functions/.env`(`CLAUDE_API_KEY`·`EGEN_SERVICE_KEY`)는 gitignore라 **새로 클론하면 없다.** 이 상태로 배포하면 AI 상담·E-Gen 실데이터가 **전부** 죽는다. 배포 전 `Test-Path app/functions/.env` 확인.
2. **새 프록시 함수에서 맨 `fetch()` 쓰지 말 것.** 반드시 `fetchUpstream()` 사용 — 타임아웃 없는 fetch는 10초를 그냥 버리고, `e.cause`를 안 남기면 원인 추적이 불가능해진다.
3. **`catch (e)`에서 `e.message`만 로깅 금지.** `fetch failed`는 undici의 껍데기 메시지다. 진짜 원인은 항상 `e.cause.code`에 있다.
4. **라이브 검증은 1회로 끝내지 말 것.** 이번 건은 5회 반복해서야 "간헐적 아님, 결정적 실패"가 확정됐다. 성공/실패 횟수와 응답시간을 같이 기록한다.
5. **UI는 빈 화면으로 두지 말 것.** API 실패 시 사유를 노출한다. 심사 시연 중 빈 화면은 "정직화"라는 이 프로젝트 성격 자체를 무너뜨린다.
6. **작업 시작 전 반드시 `git pull`.** 로컬이 80커밋 뒤처진 채로 작업해 중복 구현을 만든 사고가 실제로 있었다(2026-08-14).

- ✅ **07-09 잔여항목 ④ "E-Gen 키 활성화 후 egenBeds 배포·연동" 종결.** 키는 활성 상태이며(24개월, ~2028-07), 6개 엔드포인트 전부 실데이터 수신 중.

---

### 2026-07-10 | 심사위원단 지적 P0 4건 처리 (모의심사 2026-07-09 후속)
- **P0-2 오디오 배포 영구화**: `app/audio-ko`(102개) → `app/public/audio-ko`로 이전 → `expo export`가 dist에 자동복사(수동복사 의존 제거). 라이브 mp3 audio/mpeg 200 검증(a1/b1/e10/w12/y5/s5). "오프라인 음성 미배포" 해소.
- **P0-1 AI 진료과 상담 한국어 복구**: 근본원인=프롬프트가 lang=ko에도 "reason/tip 한국어 금지" 하드코딩 → "답변언어=한국어인데 한국어 쓰지마" 자기모순으로 `data:null`. 한국어 상담이면 한국어로 작성하도록 조건분기 + 파싱 강건화(코드펜스 제거)+1회 재시도 + max_tokens 400→700. deptConsult 배포. **라이브 UTF-8 검증 정상**(눈아파요→안과 normal, 아랫배+열→응급의학과 emergency). ⚠️ Windows Git Bash curl은 한글을 CP949로 깨뜨리니 UTF-8 파일본문(`--data-binary @`)으로 테스트할 것.
- **P0-1 정직화 배지**: 프론트가 AI 실패 시 조용히 규칙폴백하던 것 → `ConsultResult.source('ai'|'rule')` + DeptConsultScreen 첫 결과에 "🤖 AI 안내 / 📋 간이(규칙) 안내" 배지(7개언어 dc_src_*). "AI가 이해한 것" 오인 방지.
- **P0-3 검진 QR·서류함 7개 언어화**: HealthRecordShareScreen(QR공유)·HealthRecordsScreen(목록/업로드) 전체 t()화. `i18n/healthDocs.ts` 신설=검진분류8종·법령안내(DOC_INFO)·결과(적합) 7개언어 라벨맵(저장값은 한국어 canonical 유지=기존기록 호환). translations에 hrs_*/hr_* 키. 번들 신규문자열 포함 확인. ⚠️ th/vi UI문구는 클로드 번역=데모 전 원어민 검수 권장(응급/투약 아님, 위험 낮음).
- **P1 관리자 대시보드 정직화**: `TOTAL_WORKERS=12` 하드코딩에 "예시" Tag 부착 + 작업전체크에 "실집계" 표기 → 표본값 오인 방지(심사 red flag).
- **P1 사업성 정량화**(문서): `라이프라인_사업성_정량화_워크시트_2026-07-10.md` — 실수치([[ ]]) 넣으면 행정비 절감액 원화·SOM 자동산출(P=30%·침투율20% 보수 고정). "절감액 미산출·TAM/SAM/SOM 없음" 지적 대응.
- **P0-4 시연 대본**(문서): `라이프라인_2계정_긴급알림_시연대본_2026-07-10.md` — 워커 🆘→관리자 실시간 수신 머니샷, 순서대로 녹화만 하면 됨.
- 🔑 **잔여(사용자)**: ① 2계정 긴급알림 실클릭 녹화(대본대로) ② 사업성 워크시트 [[ ]] 디와이 실수치 입력 ③ th/vi 원어민 검수(선택) ④ E-Gen 키 활성화 후 egenBeds 배포·연동(별건) ⑤ KIPRIS 상표·도메인
- 검증: 매 변경 tsc·빌드·배포·라이브 확인. 자산 wheresick-5617a.web.app

---

### 2026-07-09 | E-Gen 실시간 응급실 API 프록시 작성 (키 발급됨, 활성화 대기)
- **키 발급 완료**: 공공데이터포털 국립중앙의료원 "전국 응급의료기관 정보 조회 서비스" 자동승인. 일반인증키(Decoding)를 `app/functions/.env`의 `EGEN_SERVICE_KEY`에 저장(git 제외). 승인일로부터 24개월.
- **프록시 함수 작성**: `functions/index.js`에 `egenBeds`(onRequest, asia-northeast3) 추가 — `getEmrrmRltmUsefulSckbdInfoInqire`(시도/시군구 실시간 응급실 가용병상) 호출, 키는 서버에서만. 반환 `{ok,updatedAt,total,hospitals:[{hpid,name,tel,erBeds,at}]}`. `firebase.json` rewrite `/api/egen-beds` 추가. node 문법·JSON 검증 통과.
- ⚠️ **키 활성화 대기**: 발급 직후라 upstream이 `Unauthorized` 반환(http·https 동일). 공공데이터포털 키는 발급 후 수분~1시간 뒤 활성화되는 게 일반적 → **코드/키 문제 아님, 시간 경과 후 정상화 예상**.
- 🔜 **다음(키 활성화 후, 순서대로)**:
  1. `curl` 재테스트로 키 활성화 확인 + 실응답 필드 검증(hvec=응급실 가용병상 등 실제 값·이름 매핑 확인)
  2. `firebase deploy --only functions:egenBeds,hosting`(Blaze, 기존 deptConsult와 동일 리전)
  3. **앱 연동**: `src/data/egen.ts`(클라이언트 헬퍼: `/api/egen-beds?stage1=&stage2=` 호출) + HospitalFinder에 실시간 가용병상 배지 연결(기존 색배지 UI에 실데이터). 사용자 지역→시도/시군구 매핑 필요(GPS 또는 선택)
  4. 실브라우저 검증(병원찾기 → 실시간 병상 표시) + 실패 시 "데모 데이터" 정직 라벨 폴백 유지
- ⚠️ 미검증: 프록시는 작성·문법검증만 됨. **키 활성화 전이라 end-to-end 미확인** — 배포·연동은 활성화 확인 후 진행(추측 배포 금지).

### 2026-07-08 | P0 2건: 부적합 자가체크 로그 재설계 + 민감정보 동의·개인정보 처리방침
- **[P0] 부적합 자가체크→작업진행 로그 재설계**(중처법 역효과 해소): 기존엔 음주·수면부족·어지럼이어도 무조건 "체크 완료"로 저장 → '사업주가 부적합 알고도 투입' 증거화 위험. WorkHealthCheck에 result('ok'/'caution'/'unfit')·advisedStop 추가. **위험작업(밀폐·화학·고소)+부적합=unfit**→"작업 보류·관리자 즉시 보고" 강경 배너+빨강 버튼, 일반작업+부적합=caution(주의), 그 외 ok. 부적합도 정직하게 result로 기록(감사추적). 판정 로직 6케이스 검증 통과
- **[P0] 민감정보 수집·이용 동의**(Play Store 필수/개인정보보호법): 온보딩에서 기저질환·알레르기·복용약을 무동의 수집하던 것 → 체크박스 동의 신설. 미동의+민감정보 입력 시 저장 차단·안내, 미동의 시 해당 필드 저장 안 함(빈 배열). storage.get/setHealthConsent(동의 시각 ISO 기록). 게이팅 로직 4케이스 검증 통과
- **개인정보 처리방침 화면 신설**: PrivacyPolicyScreen + data/privacyPolicy.ts(ko/en 정식 7절: 수집항목·목적·저장위치·국외이전·보유파기·이용자권리·문의, 나머지 5개 언어 en 폴백). 실제 구조 정직 고지(민감정보=기기 로컬, 계정=Firebase 서울, AI상담 시만 국외이전). 온보딩 동의카드+설정에서 진입
- 신규 t() 키 9개 7개 언어 전체 번역(wc_unfit_*·consent_*·privacy_*). tsc 통과·빌드·audio 복사·배포 완료
- ⏳ 남은 P0: DeptConsult 결과화면 다국어(KB 언어필드화)·특수건진 유효기간 유해인자별 / P2: Cloud Functions·FCM·오프라인큐잉 / E-Gen키·KIPRIS(외부)

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
- ⏳ 남은것 그대로: P2 Cloud Functions(멤버십 하드닝·미응답3분 확산)·FCM 웹푸시·오프라인큐잉 / 남은 P0(DeptConsult 결과 다국어·민감정보 동의·부적합자가체크 로그·특수건진 유효기간) / E-Gen키·KIPRIS(외부). ⚠️브라우저 UI 픽셀 실테스트는 별도(로직·규칙 e2e는 통과)

---

## 🔴 P0 — 제출 전 반드시 (말과 실물 일치 회복)

> ⚠️ 이 목록은 2026-06-08 최초 작성본이다. **아래 날짜별 기록이 최신이며, 체크박스보다 우선한다.**
> 2026-08-15 코드 대조로 3건 모두 완료 확인함.

- [x] **구버전 위반 화면 격리/제거** — `SymptomResultScreen`(병명·확률 배지), `ai.ts`의 `realAnalyze`/`SYSTEM_PROMPT`/`MOCK_PATTERNS`, `MedicineSearch`/`MedicineDetail`/`InteractionCheck`, `mockMedicines.ts`, `redFlagKeywords.ts`, `storage.getApiKey/setApiKey/KEYS.apiKey`, 미사용 `FloatingSOS`.
      → **완료**: `src/_legacy/` 격리 + `tsconfig.json` exclude + `RootNavigation.tsx` import 주석 처리(번들 미포함). (개발·의료·보안·심사 4팀 공통)
- [x] **응급 경로 다국어화** — `redFlags.ts` 증상 14종 + 판정 메시지 + `firstAid`/`FIRST_STEPS` + `careGuide`를 `{ko,en,zh,ja,vi,th,es}` 구조로, `RedFlag`/`IncidentReport`/`SymptomSummary`/`HospitalFinder`에 `t()` 적용.
      → **완료**: 데이터·화면은 2026-06-08 배치에서, "보여주기 카드"의 **모국어+한국어 병기**는 2026-08-15 `SymptomSummaryScreen`에서 적용. (개발·UX 2팀)
- [x] **검진기록 공유 허위 보안 문구 수정** — "30분 만료·다운로드 차단"을 데모 표기로 정정. (2026-06-08 완료, UX·의료·보안 3팀)

## 🟠 P1 — 완성도·차별점·발표 신뢰

- [ ] **E-Gen 실시간 응급실 API 1건 실연동** — 공공데이터포털 무료 키 발급 → 1개 지역 실시간 가용병상. 차별점 2번을 "사실"로. 못 붙이면 전 화면 "데모 데이터" 정직 라벨링. (심사)
- [ ] **AI 키 Cloud Functions 프록시 이전** — 회사 기존 Firebase Functions 재활용. 보안 + "기존 인프라 재활용" 주장 동시 실현. (심사·보안)
- [ ] **홈 상시 119 직통 버튼** — 응급신호 체크 없이 1탭 `tel:119`. 현재 최소 4탭. (UX)
- [ ] **ScrollTopFab footer 겹침 수정** — footer 있는 화면에서 FAB 위치 상향 또는 숨김. (개발·UX)
- [ ] **개인정보 동의 플로우 + 처리방침/약관 화면** — 온보딩 민감정보(기저질환·알레르기·복용약) 수집 별도 동의. Play Store 등록 필수 요건. (의료규제)
- [ ] **관리자 멀티유저 "최소 2계정 시연"** — 근로자1→관리자1 Firestore 1컬렉션 실동기화로 "관리자가 남의 사고보고를 실시간으로 본다" 장면 하나만 진짜로. (심사·백엔드 2a 일부)

## 🟡 P2 — 품질·실서비스 준비

- [ ] **민감정보 암호화 저장** — AsyncStorage → `expo-secure-store` 또는 서버 이전. 건강정보 평문 저장 해소. (보안 HIGH)
- [x] **나머지 화면 전체 i18n** — 2026-08-15 **종결**. 근로자용(복약·기록·진료요약)에 이어 관리자용(`ManagerDashboard`·`Crew`·`UserAdmin`)까지 7개 언어 적용. 잔여는 화면이 아닌 **데이터**(`options.ts`의 `DOC_INFO` 등)뿐.
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
3. ~~[핵심] `SymptomInputScreen` 다국어 미적용~~ → **해결**. 칩 라벨은 `Record<Lang>`화 대신 **저장은 한국어 canonical 유지 + 표시만 키 매핑**(`i18n/optionKeys.ts`)으로 처리해 기존 기록 호환을 지켰다
4. ~~사고보고 성공 Alert·공유 메시지·`HealthRecords/History/Manager`의 Alert·저장 enum이 한국어 잔존~~ → **전부 해결**(Manager 계열 포함, 2026-08-15)
5. ~~미적용 6화면~~ → **전부 완료**. 화면 단위 다국어 미적용은 더 이상 없음
6. 번역 경미: th `it_poison`(버튼 모호)·`it_choke`, vi 구어체 → 원어민 검수 권장 (치명 오역은 없음)
7. `_legacy` 내부 import 깨짐(재활성화 불가) — 보존 의도면 내부경로 `./`로 수정

**⏳ 남은 P2**: 개인정보 동의화면 · 인라인컴포넌트 · ImagePicker · History 날짜정렬 · 출처표기 · LanguageContext useMemo
**🔑 외부(사용자)**: E-Gen키 · ~~AI프록시~~(2026-07-07 완료) · 멀티유저 · KIPRIS 상표·도메인

### 2026-07-07 | 진료과 상담 AI 연결 완료 (Claude Haiku, 자유문장 상담 라이브)
- Firebase Blaze 전환(사용자) 완료 → Cloud Functions v2 `deptConsult`(asia-northeast3) 배포. Claude Haiku(claude-haiku-4-5)로 자유문장→진료과 안내
- AI 키는 서버 functions/.env에만 저장(git 제외, 앱 미노출). 호스팅 rewrite /api/dept-consult(동일출처, CORS 불필요) + gcf-artifacts cleanup 정책(1일)
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
