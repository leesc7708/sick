// 응급 표현집 한국어 mp3 생성 (Google Cloud TTS, Wavenet)
//  - emergencyPhrases.ts의 self 문장(group 있는 것) id+ko를 뽑아 <id>.mp3 생성
//  - 인증: gcloud 액세스 토큰(GCLOUD_TOKEN env로 전달). wiiInfo와 동일 계정/프로젝트.
//  - 출력: app/audio-ko/<id>.mp3  (배포 시 dist/audio-ko/로 복사됨)
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GCLOUD_TOKEN;
if (!TOKEN) { console.error('GCLOUD_TOKEN env 필요'); process.exit(1); }
const VOICE = process.env.KO_VOICE || 'ko-KR-Wavenet-A';
const RATE = parseFloat(process.env.KO_RATE || '0.92');

const src = fs.readFileSync(path.resolve(__dirname, '../src/data/emergencyPhrases.ts'), 'utf8');
// self 문장: { id: 'e1', group: 'emergency', ko: '...' , text: {...
const re = /id:\s*'([^']+)',\s*group:\s*'[^']+',\s*ko:\s*'([^']*)'/g;
const items = [];
let m;
while ((m = re.exec(src)) !== null) items.push({ id: m[1], ko: m[2] });
console.log(`대상 문장: ${items.length}개`);

const outDir = path.resolve(__dirname, '../audio-ko');
fs.mkdirSync(outDir, { recursive: true });

function synth(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      input: { text },
      voice: { languageCode: 'ko-KR', name: VOICE },
      audioConfig: { audioEncoding: 'MP3', speakingRate: RATE },
    });
    const req = https.request({
      hostname: 'texttospeech.googleapis.com',
      path: '/v1/text:synthesize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${TOKEN}`,
        'x-goog-user-project': process.env.GCLOUD_PROJECT || 'wiigame-448c7',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`${res.statusCode}: ${data.slice(0, 200)}`));
        try { resolve(JSON.parse(data).audioContent); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  let ok = 0, skip = 0, fail = 0;
  const overwrite = process.env.OVERWRITE === 'true';
  for (const it of items) {
    const out = path.join(outDir, `${it.id}.mp3`);
    if (!overwrite && fs.existsSync(out)) { skip++; continue; }
    try {
      const b64 = await synth(it.ko);
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      ok++;
      if (ok % 20 === 0) console.log(`  ${ok} 생성...`);
    } catch (e) {
      fail++;
      console.error(`실패 ${it.id} (${it.ko}): ${e.message}`);
    }
  }
  console.log(`완료: 생성 ${ok} · 스킵 ${skip} · 실패 ${fail} → ${outDir}`);
})();
