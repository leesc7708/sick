import { SymptomMemo } from '../types';
import { Lang } from '../i18n/translations';

export type Urgency = 'red' | 'yellow' | 'gray';

const RISK_WORK = ['밀폐공간', '화학물질 취급'];
const GAS_RE = /가스|질식|매캐|냄새|중독|연기/;

// 입력 기반 위급도 판단 (규칙 기반, 진단 아님). level만 반환 — 화면이 t()로 다국어 표시.
export function assessUrgency(m: SymptomMemo): Urgency {
  const acc = m.accompanying;
  const sev = m.severity ?? 0;
  const gasSuspect = GAS_RE.test(m.concern ?? '');

  const red =
    acc.includes('호흡곤란') ||
    (m.bodyParts.includes('가슴') && (acc.includes('호흡곤란') || acc.includes('어지럼') || sev >= 6)) ||
    (m.atWork && RISK_WORK.includes(m.workType ?? '') &&
      (acc.includes('어지럼') || acc.includes('메스꺼움') || acc.includes('구토') || acc.includes('호흡곤란') || gasSuspect)) ||
    gasSuspect ||
    sev >= 8 ||
    (m.bodyParts.includes('머리') && sev >= 7);

  if (red) return 'red';
  if (acc.length > 0 || sev >= 5) return 'yellow';
  return 'gray';
}

// 대처 문장 7개 언어
const CARE: Record<string, Record<Lang, string>> = {
  air: { ko: '즉시 신선한 공기가 있는 곳으로 이동하세요. (무리하지 말고 주변에 도움을 요청)', en: 'Move to fresh air immediately (don’t overexert; ask others for help)', zh: '立即移到有新鲜空气处（不要勉强，向周围求助）', ja: 'すぐ新鮮な空気のある場所へ移動（無理せず周囲に助けを）', vi: 'Di chuyển ra nơi thoáng khí ngay (đừng gắng sức; nhờ giúp đỡ)', th: 'ย้ายไปที่อากาศบริสุทธิ์ทันที (อย่าฝืน ขอความช่วยเหลือ)', es: 'Vaya al aire fresco de inmediato (no se esfuerce; pida ayuda)' },
  loosen: { ko: '보호구·조이는 옷을 느슨하게 하고 의식·호흡을 확인하세요.', en: 'Loosen protective gear/tight clothing and check consciousness/breathing', zh: '松开防护具·紧身衣物，检查意识·呼吸', ja: '保護具・締め付ける服を緩め、意識・呼吸を確認', vi: 'Nới lỏng đồ bảo hộ/quần áo chật, kiểm tra ý thức/hô hấp', th: 'คลายอุปกรณ์ป้องกัน·เสื้อผ้าที่รัด ตรวจสติ·การหายใจ', es: 'Afloje el equipo/ropa ajustada y verifique conciencia/respiración' },
  wash: { ko: '피부·눈에 닿았다면 흐르는 물로 15분 이상 충분히 씻으세요.', en: 'If on skin/eyes, rinse with running water for 15+ minutes', zh: '若接触皮肤·眼睛，用流动水冲洗15分钟以上', ja: '皮膚・目に触れたら流水で15分以上洗浄', vi: 'Nếu dính da/mắt, rửa bằng nước chảy 15 phút trở lên', th: 'หากโดนผิว·ตา ล้างด้วยน้ำไหล 15 นาทีขึ้นไป', es: 'Si tocó piel/ojos, enjuague con agua corriente 15+ minutos' },
  breathe: { ko: '상체를 세워 편하게 앉고, 즉시 119에 연락하세요.', en: 'Sit upright comfortably and call 119 immediately', zh: '上身坐直放松，立即拨打119', ja: '上体を起こして楽に座り、すぐ119へ', vi: 'Ngồi thẳng thoải mái và gọi 119 ngay', th: 'นั่งตัวตรงสบายๆ และโทร 119 ทันที', es: 'Siéntese erguido y llame al 119 de inmediato' },
  chest: { ko: '편한 자세로 안정을 취하고, 몸을 조이는 것을 푸세요.', en: 'Rest in a comfortable position and loosen anything tight', zh: '以舒适姿势休息，松开紧束物', ja: '楽な姿勢で安静にし、締め付けを緩める', vi: 'Nghỉ ở tư thế thoải mái, nới lỏng đồ bó sát', th: 'พักในท่าสบาย คลายสิ่งที่รัดตัว', es: 'Descanse en posición cómoda y afloje lo apretado' },
  fever: { ko: '시원한 곳에서 휴식하고 수분을 충분히 드세요.', en: 'Rest in a cool place and drink enough water', zh: '在凉爽处休息，多补充水分', ja: '涼しい場所で休み、水分を十分に', vi: 'Nghỉ nơi mát và uống đủ nước', th: 'พักในที่เย็นและดื่มน้ำให้เพียงพอ', es: 'Descanse en un lugar fresco y beba suficiente agua' },
  dizzy: { ko: '그 자리에 앉거나 누워 안정을 취하고, 갑자기 일어나지 마세요.', en: 'Sit or lie down to rest; don’t stand up suddenly', zh: '就地坐下或躺下休息，勿突然起身', ja: 'その場で座るか横になり、急に立たない', vi: 'Ngồi hoặc nằm nghỉ; đừng đứng dậy đột ngột', th: 'นั่งหรือนอนพัก อย่าลุกขึ้นเร็ว', es: 'Siéntese o acuéstese; no se levante de golpe' },
  vomit: { ko: '옆으로 눕혀 기도를 확보하고, 수분을 소량씩 드세요.', en: 'Lay them on their side to keep the airway clear; sip water', zh: '侧卧保持气道通畅，少量饮水', ja: '横向きに寝かせ気道確保、水分を少量ずつ', vi: 'Đặt nằm nghiêng để thông đường thở; uống nước từng ngụm', th: 'ให้นอนตะแคงเปิดทางเดินหายใจ จิบน้ำทีละน้อย', es: 'Acuéstelo de lado para la vía aérea; beba a sorbos' },
  diarrhea: { ko: '수분·전해질을 자주 보충하세요.', en: 'Replenish fluids/electrolytes frequently', zh: '经常补充水分·电解质', ja: '水分・電解質をこまめに補給', vi: 'Bổ sung nước/điện giải thường xuyên', th: 'เติมน้ำ·เกลือแร่บ่อยๆ', es: 'Reponga líquidos/electrolitos con frecuencia' },
  bleeding: { ko: '깨끗한 천으로 출혈 부위를 직접 눌러 지혈하세요.', en: 'Press the wound directly with a clean cloth to stop bleeding', zh: '用干净布直接按压伤口止血', ja: '清潔な布で出血部位を直接圧迫止血', vi: 'Ép trực tiếp vết thương bằng vải sạch để cầm máu', th: 'กดแผลโดยตรงด้วยผ้าสะอาดเพื่อห้ามเลือด', es: 'Presione la herida con un paño limpio para detener el sangrado' },
  rest: { ko: '무리한 작업을 멈추고 안정을 취하세요.', en: 'Stop strenuous work and rest', zh: '停止勉强作业，好好休息', ja: '無理な作業をやめて安静に', vi: 'Ngừng làm việc gắng sức và nghỉ ngơi', th: 'หยุดงานหนักและพักผ่อน', es: 'Deje el trabajo extenuante y descanse' },
  doctor: { ko: '증상이 심하거나 나아지지 않으면 병원 진료 또는 119에 문의하세요.', en: 'If severe or not improving, see a doctor or call 119', zh: '若严重或未好转，请就医或拨打119', ja: '重い・改善しない場合は受診か119へ', vi: 'Nếu nặng hoặc không đỡ, đi khám hoặc gọi 119', th: 'หากรุนแรงหรือไม่ดีขึ้น พบแพทย์หรือโทร 119', es: 'Si es grave o no mejora, vea a un médico o llame al 119' },
};

// 지금 할 수 있는 대처 (일반 응급조치 안내, 처방 아님)
export function careActions(m: SymptomMemo, lang: Lang): string[] {
  const keys: string[] = [];
  const acc = m.accompanying;
  const gasSuspect = GAS_RE.test(m.concern ?? '');

  if (m.atWork && (m.workType === '밀폐공간' || gasSuspect)) keys.push('air', 'loosen');
  if (m.workType === '화학물질 취급' || gasSuspect) keys.push('wash');
  if (acc.includes('호흡곤란')) keys.push('breathe');
  if (m.bodyParts.includes('가슴')) keys.push('chest');
  if (acc.includes('열') || acc.includes('오한')) keys.push('fever');
  if (acc.includes('어지럼')) keys.push('dizzy');
  if (acc.includes('구토')) keys.push('vomit');
  if (acc.includes('설사')) keys.push('diarrhea');
  if (acc.includes('출혈')) keys.push('bleeding');
  if (keys.length === 0) keys.push('rest');
  keys.push('doctor');
  return keys.map((k) => CARE[k][lang]);
}
