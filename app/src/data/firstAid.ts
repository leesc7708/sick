import { FirstAidCard } from '../types';

// 사고 유형별 응급처치 카드 (오프라인 로컬 데이터, 7개 언어)
export const FIRST_AID: FirstAidCard[] = [
  {
    type: '질식',
    title: { ko: '질식·산소결핍 의심', en: 'Suspected asphyxiation/oxygen deficiency', zh: '疑似窒息·缺氧', ja: '窒息・酸欠の疑い', vi: 'Nghi ngạt/thiếu oxy', th: 'สงสัยขาดอากาศ/ออกซิเจน', es: 'Sospecha de asfixia/falta de oxígeno' },
    steps: {
      ko: ['절대 혼자 구조하러 들어가지 마세요 (2차 사고 위험)', '즉시 119 신고 + 주변에 큰 소리로 알림', '안전 확보 후 환자를 신선한 공기가 있는 곳으로', '의식·호흡 확인, 필요 시 심폐소생술'],
      en: ['Never enter to rescue alone (secondary accident risk)', 'Call 119 immediately + alert others loudly', 'After securing safety, move the patient to fresh air', 'Check consciousness/breathing, CPR if needed'],
      zh: ['切勿独自进入施救（二次事故风险）', '立即报警119+大声告知周围', '确保安全后将患者移到有新鲜空气处', '检查意识·呼吸，必要时心肺复苏'],
      ja: ['絶対に一人で救助に入らない（二次事故の危険）', 'すぐ119通報+周囲に大声で知らせる', '安全確保後、患者を新鮮な空気のある場所へ', '意識・呼吸を確認、必要なら心肺蘇生'],
      vi: ['Không tự vào cứu một mình (nguy cơ tai nạn thứ cấp)', 'Gọi 119 ngay + hô lớn báo người xung quanh', 'Sau khi an toàn, đưa bệnh nhân ra nơi thoáng khí', 'Kiểm tra ý thức/hô hấp, CPR nếu cần'],
      th: ['อย่าเข้าไปช่วยคนเดียว (เสี่ยงอุบัติเหตุซ้ำ)', 'โทร 119 ทันที + ตะโกนบอกคนรอบข้าง', 'เมื่อปลอดภัยแล้ว ย้ายผู้ป่วยไปที่อากาศบริสุทธิ์', 'ตรวจสติ·การหายใจ ทำ CPR หากจำเป็น'],
      es: ['Nunca entre solo a rescatar (riesgo de accidente secundario)', 'Llame al 119 de inmediato + avise en voz alta', 'Tras asegurar la zona, lleve al paciente al aire fresco', 'Verifique conciencia/respiración, RCP si es necesario'],
    },
  },
  {
    type: '화상',
    title: { ko: '화학물질 화상', en: 'Chemical burn', zh: '化学品烧伤', ja: '化学物質によるやけど', vi: 'Bỏng hóa chất', th: 'แผลไหม้จากสารเคมี', es: 'Quemadura química' },
    steps: {
      ko: ['오염 부위를 흐르는 물로 15분 이상 세척', '오염된 옷·장신구 제거', '문지르지 말 것', '물질명(MSDS)을 확인해 병원에 전달'],
      en: ['Rinse the area with running water for 15+ minutes', 'Remove contaminated clothing/jewelry', 'Do not rub', 'Check the substance name (MSDS) and tell the hospital'],
      zh: ['用流动水冲洗患处15分钟以上', '脱去被污染的衣物·首饰', '切勿摩擦', '确认物质名称(MSDS)并告知医院'],
      ja: ['汚染部位を流水で15分以上洗浄', '汚染された衣服・装飾品を外す', 'こすらない', '物質名(MSDS)を確認し病院に伝える'],
      vi: ['Rửa vùng bị dính bằng nước chảy 15 phút trở lên', 'Cởi bỏ quần áo/trang sức bị nhiễm', 'Không chà xát', 'Xác định tên hóa chất (MSDS) và báo bệnh viện'],
      th: ['ล้างบริเวณที่โดนด้วยน้ำไหล 15 นาทีขึ้นไป', 'ถอดเสื้อผ้า·เครื่องประดับที่เปื้อน', 'อย่าถู', 'ตรวจชื่อสาร (MSDS) และแจ้งโรงพยาบาล'],
      es: ['Enjuague la zona con agua corriente 15+ minutos', 'Quite ropa/joyas contaminadas', 'No frote', 'Identifique la sustancia (MSDS) e informe al hospital'],
    },
  },
  {
    type: '추락',
    title: { ko: '추락·협착', en: 'Fall/crush injury', zh: '坠落·挤压', ja: '墜落・挟まれ', vi: 'Ngã/bị kẹp', th: 'ตก/ถูกหนีบ', es: 'Caída/aplastamiento' },
    steps: {
      ko: ['함부로 환자를 움직이지 마세요 (척추 손상 위험)', '119 신고', '의식·호흡 확인', '출혈이 있으면 압박 지혈, 보온 유지'],
      en: ['Do not move the patient carelessly (spinal injury risk)', 'Call 119', 'Check consciousness/breathing', 'If bleeding, apply pressure; keep them warm'],
      zh: ['不要随意移动患者（脊椎损伤风险）', '报警119', '检查意识·呼吸', '若出血则压迫止血，注意保暖'],
      ja: ['むやみに患者を動かさない（脊椎損傷の危険）', '119通報', '意識・呼吸を確認', '出血があれば圧迫止血、保温を維持'],
      vi: ['Không di chuyển bệnh nhân tùy tiện (nguy cơ tổn thương cột sống)', 'Gọi 119', 'Kiểm tra ý thức/hô hấp', 'Nếu chảy máu, ép cầm máu; giữ ấm'],
      th: ['อย่าเคลื่อนย้ายผู้ป่วยพร่ำเพรื่อ (เสี่ยงกระดูกสันหลัง)', 'โทร 119', 'ตรวจสติ·การหายใจ', 'หากมีเลือดออก ให้กดห้ามเลือดและให้ความอบอุ่น'],
      es: ['No mueva al paciente sin cuidado (riesgo de columna)', 'Llame al 119', 'Verifique conciencia/respiración', 'Si sangra, presione; manténgalo abrigado'],
    },
  },
  {
    type: '중독',
    title: { ko: '중독 (흡입·접촉)', en: 'Poisoning (inhalation/contact)', zh: '中毒（吸入·接触）', ja: '中毒（吸入・接触）', vi: 'Ngộ độc (hít/tiếp xúc)', th: 'พิษ (สูดดม/สัมผัส)', es: 'Intoxicación (inhalación/contacto)' },
    steps: {
      ko: ['오염원에서 멀리 이동 (구조자 안전 우선)', '119 신고 + 물질명 확인', '호흡 곤란 시 기도 확보', '함부로 구토를 유발하지 말 것'],
      en: ['Move away from the source (rescuer safety first)', 'Call 119 + identify the substance', 'If breathing is hard, secure the airway', 'Do not induce vomiting carelessly'],
      zh: ['远离污染源（救援者安全优先）', '报警119+确认物质名称', '呼吸困难时确保气道通畅', '不要随意催吐'],
      ja: ['汚染源から離れる（救助者の安全優先）', '119通報+物質名を確認', '呼吸困難なら気道確保', 'むやみに嘔吐させない'],
      vi: ['Rời xa nguồn ô nhiễm (an toàn người cứu trước)', 'Gọi 119 + xác định hóa chất', 'Nếu khó thở, khai thông đường thở', 'Không gây nôn tùy tiện'],
      th: ['ออกห่างจากแหล่งสาร (ความปลอดภัยผู้ช่วยมาก่อน)', 'โทร 119 + ตรวจชื่อสาร', 'หากหายใจลำบาก เปิดทางเดินหายใจ', 'อย่าทำให้อาเจียนพร่ำเพรื่อ'],
      es: ['Aléjese de la fuente (seguridad del rescatista primero)', 'Llame al 119 + identifique la sustancia', 'Si cuesta respirar, asegure la vía aérea', 'No provoque el vómito sin indicación'],
    },
  },
  {
    type: '감전',
    title: { ko: '감전', en: 'Electric shock', zh: '触电', ja: '感電', vi: 'Điện giật', th: 'ไฟดูด', es: 'Descarga eléctrica' },
    steps: {
      ko: ['전원 차단 먼저 (맨손으로 환자 접촉 금지)', '119 신고', '의식·호흡 확인, 필요 시 심폐소생술', '화상 부위 확인, 2차 감전 주의'],
      en: ['Cut the power first (do not touch with bare hands)', 'Call 119', 'Check consciousness/breathing, CPR if needed', 'Check burns; beware of secondary shock'],
      zh: ['先切断电源（禁止赤手接触患者）', '报警119', '检查意识·呼吸，必要时心肺复苏', '检查烧伤部位，注意二次触电'],
      ja: ['まず電源を切る（素手で患者に触れない）', '119通報', '意識・呼吸を確認、必要なら心肺蘇生', 'やけど部位を確認、二次感電に注意'],
      vi: ['Ngắt điện trước (không chạm tay trần)', 'Gọi 119', 'Kiểm tra ý thức/hô hấp, CPR nếu cần', 'Kiểm tra bỏng; coi chừng điện giật thứ cấp'],
      th: ['ตัดไฟก่อน (ห้ามแตะผู้ป่วยด้วยมือเปล่า)', 'โทร 119', 'ตรวจสติ·การหายใจ ทำ CPR หากจำเป็น', 'ตรวจแผลไหม้ ระวังไฟดูดซ้ำ'],
      es: ['Corte la corriente primero (no toque con manos desnudas)', 'Llame al 119', 'Verifique conciencia/respiración, RCP si es necesario', 'Revise quemaduras; cuidado con descarga secundaria'],
    },
  },
  {
    type: '기타',
    title: { ko: '기타 사고', en: 'Other accident', zh: '其他事故', ja: 'その他の事故', vi: 'Tai nạn khác', th: 'อุบัติเหตุอื่น', es: 'Otro accidente' },
    steps: {
      ko: ['주변 안전 확보', '119 신고', '의식·호흡·출혈 확인', '환자 보온, 전문 구조 대기'],
      en: ['Secure the surroundings', 'Call 119', 'Check consciousness/breathing/bleeding', 'Keep the patient warm; await responders'],
      zh: ['确保周围安全', '报警119', '检查意识·呼吸·出血', '注意保暖，等待专业救援'],
      ja: ['周囲の安全確保', '119通報', '意識・呼吸・出血を確認', '患者を保温し、専門救助を待つ'],
      vi: ['Đảm bảo an toàn xung quanh', 'Gọi 119', 'Kiểm tra ý thức/hô hấp/chảy máu', 'Giữ ấm bệnh nhân; chờ đội cứu hộ'],
      th: ['ทำให้บริเวณปลอดภัย', 'โทร 119', 'ตรวจสติ·การหายใจ·เลือดออก', 'ให้ความอบอุ่นผู้ป่วย รอหน่วยกู้ภัย'],
      es: ['Asegure el entorno', 'Llame al 119', 'Verifique conciencia/respiración/sangrado', 'Mantenga al paciente abrigado; espere a los rescatistas'],
    },
  },
];

export function firstAidFor(type: string): FirstAidCard {
  return FIRST_AID.find((c) => c.type === type) ?? FIRST_AID[FIRST_AID.length - 1];
}
