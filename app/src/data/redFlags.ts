import { Lang } from '../i18n/translations';
import { RedFlagItem, RedFlagResult } from '../types';

// 규칙 기반 응급 신호 체크리스트 (AI 단독판단 금지). label은 7개 언어.
export const RED_FLAGS: RedFlagItem[] = [
  // 일반
  { id: 'chest', group: 'general', critical: true, label: { ko: '가슴 통증 + 숨이 참', en: 'Chest pain + shortness of breath', zh: '胸痛 + 呼吸困难', ja: '胸の痛み + 息切れ', vi: 'Đau ngực + khó thở', th: 'เจ็บหน้าอก + หายใจลำบาก', es: 'Dolor de pecho + falta de aire' } },
  { id: 'headache', group: 'general', critical: true, label: { ko: '갑자기 생긴 매우 심한 두통', en: 'Sudden very severe headache', zh: '突然剧烈头痛', ja: '突然の激しい頭痛', vi: 'Đau đầu dữ dội đột ngột', th: 'ปวดหัวรุนแรงเฉียบพลัน', es: 'Dolor de cabeza súbito muy intenso' } },
  { id: 'consciousness', group: 'general', critical: true, label: { ko: '의식이 흐리거나 혼미함', en: 'Confusion or reduced consciousness', zh: '意识模糊或混乱', ja: '意識がもうろう・混濁', vi: 'Lú lẫn hoặc giảm ý thức', th: 'สับสนหรือหมดสติ', es: 'Confusión o conciencia reducida' } },
  { id: 'paralysis', group: 'general', critical: true, label: { ko: '한쪽 팔다리 마비·말이 어눌함', en: 'One-sided paralysis / slurred speech', zh: '单侧肢体麻痹·言语不清', ja: '片側のまひ・ろれつが回らない', vi: 'Liệt một bên · nói ngọng', th: 'อัมพาตซีกเดียว · พูดไม่ชัด', es: 'Parálisis de un lado · habla mal' } },
  { id: 'allergy', group: 'general', critical: true, label: { ko: '심한 알레르기 반응 + 호흡곤란', en: 'Severe allergic reaction + difficulty breathing', zh: '严重过敏反应 + 呼吸困难', ja: '重いアレルギー反応 + 呼吸困難', vi: 'Phản ứng dị ứng nặng + khó thở', th: 'แพ้รุนแรง + หายใจลำบาก', es: 'Reacción alérgica grave + dificultad para respirar' } },
  { id: 'bleeding', group: 'general', critical: true, label: { ko: '멈추지 않는 출혈', en: "Bleeding that won't stop", zh: '无法止住的出血', ja: '止まらない出血', vi: 'Chảy máu không cầm được', th: 'เลือดไหลไม่หยุด', es: 'Sangrado que no se detiene' } },
  { id: 'fever', group: 'general', critical: true, label: { ko: '고열과 함께 의식 저하', en: 'High fever with reduced consciousness', zh: '高烧伴意识下降', ja: '高熱と意識低下', vi: 'Sốt cao kèm giảm ý thức', th: 'ไข้สูงร่วมกับหมดสติ', es: 'Fiebre alta con conciencia reducida' } },
  { id: 'abdomen', group: 'general', critical: false, label: { ko: '참기 힘든 심한 복통', en: 'Unbearable severe abdominal pain', zh: '难忍的剧烈腹痛', ja: '耐えがたい激しい腹痛', vi: 'Đau bụng dữ dội khó chịu đựng', th: 'ปวดท้องรุนแรงทนไม่ไหว', es: 'Dolor abdominal intenso insoportable' } },
  // 산업현장
  { id: 'confined', group: 'work', critical: true, label: { ko: '밀폐공간에서 어지럼·메스꺼움', en: 'Dizziness/nausea in a confined space', zh: '密闭空间内头晕·恶心', ja: '密閉空間でめまい・吐き気', vi: 'Chóng mặt/buồn nôn trong không gian kín', th: 'เวียนหัว/คลื่นไส้ในที่อับอากาศ', es: 'Mareo/náusea en espacio confinado' } },
  { id: 'chemical', group: 'work', critical: true, label: { ko: '화학물질이 눈·피부에 닿음', en: 'Chemical contact with eyes/skin', zh: '化学品接触眼·皮肤', ja: '化学物質が目・皮膚に接触', vi: 'Hóa chất dính vào mắt/da', th: 'สารเคมีถูกตา/ผิวหนัง', es: 'Químico en contacto con ojos/piel' } },
  { id: 'heat', group: 'work', critical: false, label: { ko: '고온 작업 중 어지럼·탈진', en: 'Dizziness/exhaustion in heat', zh: '高温作业中头晕·虚脱', ja: '高温作業中のめまい・脱力', vi: 'Chóng mặt/kiệt sức khi làm việc nóng', th: 'เวียนหัว/อ่อนเพลียจากความร้อน', es: 'Mareo/agotamiento por calor' } },
  { id: 'fall', group: 'work', critical: true, label: { ko: '추락·협착 후 통증·움직임 곤란', en: 'Pain/immobility after a fall or crush', zh: '坠落·挤压后疼痛·难以活动', ja: '墜落・挟まれ後の痛み・動けない', vi: 'Đau/khó cử động sau ngã hoặc bị kẹt', th: 'เจ็บ/ขยับไม่ได้หลังตก·ถูกหนีบ', es: 'Dolor/inmovilidad tras caída o aplastamiento' } },
  { id: 'gas', group: 'work', critical: true, label: { ko: '가스·분진 흡입 후 호흡곤란', en: 'Difficulty breathing after gas/dust inhalation', zh: '吸入气体·粉尘后呼吸困难', ja: 'ガス・粉じん吸入後の呼吸困難', vi: 'Khó thở sau khi hít khí/bụi', th: 'หายใจลำบากหลังสูดแก๊ส/ฝุ่น', es: 'Dificultad para respirar tras inhalar gas/polvo' } },
  { id: 'shock', group: 'work', critical: true, label: { ko: '감전 후 이상 증상', en: 'Abnormal symptoms after electric shock', zh: '触电后异常症状', ja: '感電後の異常症状', vi: 'Triệu chứng bất thường sau điện giật', th: 'อาการผิดปกติหลังไฟดูด', es: 'Síntomas anormales tras descarga eléctrica' } },
];

// level만 판정. 화면이 level로 다국어 메시지를 t()로 표시한다.
export function evaluateRedFlags(ids: string[]): RedFlagResult {
  const items = RED_FLAGS.filter((f) => ids.includes(f.id));
  if (items.some((f) => f.critical)) {
    return { level: 'red', selectedIds: ids, title: '지금 응급 상황일 수 있어요', message: '즉시 119에 연락하거나 가까운 응급실로 가세요. 동료·관리자에게 알리고 혼자 있지 마세요.' };
  }
  if (items.length > 0) {
    return { level: 'yellow', selectedIds: ids, title: '빠른 진료가 필요해요', message: '증상이 지속되거나 심해지면 곧바로 의료기관에서 진료받으세요.' };
  }
  return { level: 'gray', selectedIds: ids, title: '경과를 지켜보세요', message: '증상이 심해지거나 새로 생기면 즉시 의료기관을 방문하세요.' };
}
