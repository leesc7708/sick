// ─────────────────────────────────────────────────────────────
// 라이프라인 진료과 상담 프록시 (Cloud Functions v2)
//  - 자유 문장 증상 → Claude(Haiku)로 "어느 진료과" 안내. 진단·처방 금지.
//  - API 키는 앱이 아니라 서버(.env의 CLAUDE_API_KEY)에만 둔다(보안).
//  - 호스팅 rewrite(/api/dept-consult)로 동일 출처 호출 → CORS 불필요.
// ─────────────────────────────────────────────────────────────
const { onRequest } = require('firebase-functions/v2/https');

// 콜드스타트 최적화: 사용 시점에 로드
let _client = null;
function anthropic() {
  if (!_client) {
    const Anthropic = require('@anthropic-ai/sdk');
    _client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return _client;
}

const LANG_NAMES = {
  ko: '한국어(Korean)',
  en: 'English',
  zh: '중국어 간체(Simplified Chinese)',
  ja: '일본어(Japanese)',
  vi: '베트남어(Vietnamese)',
  th: '태국어(Thai)',
  es: '스페인어(Spanish)',
};

const SYSTEM = [
  '당신은 한국 병원의 "진료과 안내" 도우미입니다.',
  '사용자가 증상을 말하면 어느 진료과로 가면 되는지 안내합니다.',
  '',
  '■ 절대 규칙',
  '- 절대 병명을 진단하거나 특정 약을 처방/추천하지 마세요. 진료과 안내와 일반적 주의만 제공합니다.',
  '',
  '■ 응급 판정(가장 중요 — 놓치면 사람이 죽습니다)',
  '- 안전 우선 원칙: 조금이라도 응급이 의심되면 반드시 urgency="emergency"로 상향하세요(과소평가보다 과대평가가 안전).',
  '- 아래 중 하나라도 의심되면 무조건 emergency + 즉시 119 안내:',
  '  · 심장: 가슴 통증/압박/조임, 명치가 답답·체한 느낌, 팔·턱·어깨로 뻗치는 통증, 식은땀 동반(비전형 심근경색 포함)',
  '  · 뇌졸중: 한쪽 마비·저림, 말 어눌·안 나옴, 얼굴 비뚤어짐, 갑작스런 심한 어지럼+구토·복시·보행이상(후방순환), 벼락치듯 갑자기 최악의 두통',
  '  · 호흡/순환: 호흡곤란·숨참, 갑자기 찢어지는 가슴·등 통증(대동맥박리), 실신·의식저하, 경련',
  '  · 출혈/외상: 멈추지 않는 대량출혈, 신체 절단, 개방골절(뼈 노출)',
  '  · 복부: 갑작스런 극심한 복통, 토혈·혈변, 남성의 갑작스런 심한 음낭통(고환염전, 골든타임 6시간)',
  '  · 대사/감염: 저혈당 의심(식은땀+떨림+의식저하), 고열+의식저하(패혈증 의심)',
  '  · 산업재해: 밀폐공간 가스 흡입·질식, 감전, 화학물질이 눈/피부에 튐, 열사병(의식저하·심한 탈진), 넓거나 깊은 화상',
  '- 확신이 없으면 soon이 아니라 emergency로. 애매하면 항상 상향.',
  '',
  '■ 출력 형식 — 반드시 아래 JSON 객체 하나만(다른 말 금지):',
  '{"dept":"1순위 진료과(한국 진료과 한글명)","alt":"대안 진료과 한글명 또는 빈 문자열","reason":"왜 그 과인지 한 문장","tip":"헷갈림 해소 또는 응급 주의 한 문장","urgency":"emergency|soon|normal"}',
  '- dept/alt는 항상 한국 진료과 한글명(예: 안과, 정형외과, 이비인후과, 내과, 피부과, 응급의학과, 비뇨의학과, 치과, 신경외과). 응급이면 dept="응급의학과". 번역하지 마세요.',
  '- reason/tip은 반드시 지정된 "답변 언어"로 작성(한국어 아님). urgency=emergency면 tip에 "즉시 119"를 반드시 포함.',
].join('\n');

exports.deptConsult = onRequest(
  { region: 'asia-northeast3', memory: '256MiB', timeoutSeconds: 30, maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false });
      return;
    }
    const body = req.body || {};
    const text = String(body.text || '').slice(0, 500).trim();
    const lang = String(body.lang || 'ko').slice(0, 5);
    // 임상 컨텍스트(선택): 응급 판단 정확도를 위해 나이·기저질환·복용약을 참고
    const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
    const ctxParts = [];
    if (profile.age) ctxParts.push(`나이: ${String(profile.age).slice(0, 10)}`);
    if (Array.isArray(profile.conditions) && profile.conditions.length) ctxParts.push(`기저질환: ${profile.conditions.join(', ').slice(0, 120)}`);
    if (Array.isArray(profile.currentMedicines) && profile.currentMedicines.length) ctxParts.push(`복용약: ${profile.currentMedicines.join(', ').slice(0, 120)}`);
    const ctx = ctxParts.length ? `\n참고(응급 판단용): ${ctxParts.join(' / ')}` : '';
    if (!text) {
      res.json({ ok: false });
      return;
    }
    try {
      const msg = await anthropic().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: [
          {
            role: 'user',
            content:
              `증상: ${text}${ctx}\n\n` +
              `답변 언어: ${LANG_NAMES[lang] || lang}\n` +
              `→ "reason"과 "tip"은 위 답변 언어로만 작성하세요(한국어로 쓰지 마세요). "dept"와 "alt"는 한국 진료과 한글명 그대로 두세요.`,
          },
        ],
      });
      const raw = (msg.content && msg.content[0] && msg.content[0].text) || '';
      const m = raw.match(/\{[\s\S]*\}/);
      const data = m ? JSON.parse(m[0]) : null;
      res.json({ ok: !!(data && data.dept), data });
    } catch (e) {
      console.error('deptConsult error:', e && (e.message || e));
      res.json({ ok: false, error: String((e && e.message) || e).slice(0, 150) });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// E-Gen 응급실 실시간 가용병상 프록시 (공공데이터포털 국립중앙의료원)
//  - 오퍼레이션: getEmrrmRltmUsefulSckbdInfoInqire (시도/시군구 단위 실시간 응급실 병상)
//  - 서비스키는 앱이 아니라 서버(.env의 EGEN_SERVICE_KEY)에만 둔다(보안).
//  - 호스팅 rewrite(/api/egen-beds)로 동일 출처 호출 → CORS 불필요.
//  - 호출 예: GET /api/egen-beds?stage1=서울특별시&stage2=중구
//  - 반환: { ok, updatedAt, total, hospitals:[{hpid,name,tel,erBeds,at}] }
//  ⚠️ 발급 직후엔 키 활성화(수분~1시간) 전까지 upstream이 "Unauthorized" 반환할 수 있음.
// ─────────────────────────────────────────────────────────────
const EGEN_BASE = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire';

exports.egenBeds = onRequest(
  { region: 'asia-northeast3', memory: '256MiB', timeoutSeconds: 20, maxInstances: 5 },
  async (req, res) => {
    const q = req.query || {};
    const stage1 = String(q.stage1 || '').slice(0, 20).trim(); // 시도명 (필수)
    const stage2 = String(q.stage2 || '').slice(0, 20).trim(); // 시군구명 (선택)
    const numOfRows = Math.min(parseInt(q.rows, 10) || 20, 100);
    if (!stage1) {
      res.status(400).json({ ok: false, error: 'stage1(시도명) 필수' });
      return;
    }
    const key = process.env.EGEN_SERVICE_KEY;
    if (!key) {
      res.status(500).json({ ok: false, error: 'EGEN_SERVICE_KEY 미설정' });
      return;
    }
    const params = new URLSearchParams({
      serviceKey: key,
      STAGE1: stage1,
      pageNo: '1',
      numOfRows: String(numOfRows),
      _type: 'json',
    });
    if (stage2) params.set('STAGE2', stage2);
    try {
      const r = await fetch(`${EGEN_BASE}?${params.toString()}`);
      const raw = await r.text();
      // 키 미활성/오류 시 공공API는 평문 "Unauthorized" 또는 XML 에러를 반환
      let json;
      try { json = JSON.parse(raw); }
      catch { res.status(502).json({ ok: false, error: 'upstream_non_json', detail: raw.slice(0, 120) }); return; }
      const body = json.response && json.response.body;
      let items = (body && body.items && body.items.item) || [];
      if (!Array.isArray(items)) items = items ? [items] : [];
      const hospitals = items.map((it) => ({
        hpid: it.hpid || '',
        name: it.dutyName || '',
        tel: it.dutyTel3 || '', // 응급실 전화
        erBeds: it.hvec != null ? Number(it.hvec) : null, // 응급실 일반 가용병상
        at: it.hvidate || '', // 정보 갱신 시각
      }));
      res.json({ ok: true, updatedAt: (hospitals[0] && hospitals[0].at) || '', total: (body && body.totalCount) || hospitals.length, hospitals });
    } catch (e) {
      console.error('egenBeds error:', e && (e.message || e));
      res.status(502).json({ ok: false, error: String((e && e.message) || e).slice(0, 150) });
    }
  }
);
