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
  '중요 규칙:',
  '- 절대 병명을 진단하거나 특정 약을 처방/추천하지 마세요.',
  '- 진료과 안내와 일반적 주의사항만 제공합니다.',
  '- 생명 위험 신호(의식저하, 심한 출혈, 호흡곤란, 흉통+식은땀, 마비 등)면 urgency를 emergency로 하고 즉시 119를 안내하세요.',
  '반드시 아래 JSON 객체 하나만 출력하세요(다른 말 금지):',
  '{"dept":"1순위 진료과(한국 진료과 한글명)","alt":"헷갈리는 대안 진료과 한글명 또는 빈 문자열","reason":"왜 그 과인지 한 문장","tip":"헷갈림 해소 또는 응급 주의 한 문장","urgency":"emergency|soon|normal"}',
  '- dept/alt는 항상 한국 진료과 한글명(예: 안과, 정형외과, 이비인후과, 내과, 피부과, 응급의학과, 비뇨의학과, 치과, 신경외과)으로 쓰세요. 번역하지 마세요.',
  '- reason/tip은 반드시 사용자 메시지에 지정된 "답변 언어"로 작성하세요(한국어 아님, 지정 언어).',
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
              `증상: ${text}\n\n` +
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
