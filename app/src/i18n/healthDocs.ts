// 검진·교육 분류 라벨 + 안내문의 다국어 맵.
//  - 저장값(키)은 한국어 canonical(data/options.ts의 HEALTH_CHECK_TYPES) 그대로 유지 →
//    Firestore·기존 기록 호환. 화면에는 사용자 언어 라벨로 표시.
//  - 안내문(DOC_INFO)은 법령 인용을 외국인이 이해할 평이한 요약으로 옮김(직역 아님).
import type { Lang } from './translations';

type L = Record<Lang, string>;

// 검진/교육 분류명 (칩·카드 표시용)
export const HEALTH_TYPE_LABEL: Record<string, L> = {
  '특수건강진단': { ko: '특수건강진단', en: 'Special health exam', zh: '特殊健康检查', ja: '特殊健康診断', vi: 'Khám sức khỏe đặc biệt', th: 'ตรวจสุขภาพพิเศษ', es: 'Examen de salud especial' },
  '일반건강검진': { ko: '일반건강검진', en: 'General health exam', zh: '一般健康检查', ja: '一般健康診断', vi: 'Khám sức khỏe tổng quát', th: 'ตรวจสุขภาพทั่วไป', es: 'Examen de salud general' },
  '채용시건강검진': { ko: '채용시건강검진', en: 'Pre-employment exam', zh: '入职健康检查', ja: '採用時健康診断', vi: 'Khám khi tuyển dụng', th: 'ตรวจก่อนเข้าทำงาน', es: 'Examen de preempleo' },
  '건설기초안전보건교육': { ko: '건설기초안전보건교육', en: 'Basic construction safety training', zh: '建筑基础安全卫生教育', ja: '建設基礎安全衛生教育', vi: 'Đào tạo an toàn xây dựng cơ bản', th: 'อบรมความปลอดภัยพื้นฐานงานก่อสร้าง', es: 'Formación básica de seguridad en construcción' },
  '화관법 안전교육': { ko: '화관법 안전교육', en: 'Chemicals safety training', zh: '化学品法安全教育', ja: '化管法 安全教育', vi: 'Đào tạo an toàn hóa chất', th: 'อบรมความปลอดภัยสารเคมี', es: 'Formación de seguridad química' },
  '안전보건교육': { ko: '안전보건교육', en: 'Safety & health training', zh: '安全卫生教育', ja: '安全衛生教育', vi: 'Đào tạo an toàn vệ sinh', th: 'อบรมความปลอดภัยและสุขภาพ', es: 'Formación de seguridad y salud' },
  '밀폐공간 교육': { ko: '밀폐공간 교육', en: 'Confined-space training', zh: '密闭空间教育', ja: '密閉空間教育', vi: 'Đào tạo không gian kín', th: 'อบรมพื้นที่อับอากาศ', es: 'Formación de espacios confinados' },
  '기타': { ko: '기타', en: 'Other', zh: '其他', ja: 'その他', vi: 'Khác', th: 'อื่น ๆ', es: 'Otro' },
};

// 분류별 안내(법적 근거 요약)
export const DOC_INFO_LABEL: Record<string, L> = {
  '특수건강진단': {
    ko: '밀폐공간·화학물질·분진 등 유해작업 종사자 의무. 주기적 재검진 필요(산업안전보건법).',
    en: 'Mandatory for workers in confined spaces, chemicals, or dust. Periodic re-exam required (Occupational Safety & Health Act).',
    zh: '从事密闭空间、化学品、粉尘等有害作业者必检，需定期复检（产业安全保健法）。',
    ja: '密閉空間・化学物質・粉じん等の有害作業者に義務。定期的な再検診が必要(産業安全保健法)。',
    vi: 'Bắt buộc với người làm trong không gian kín, hóa chất, bụi. Phải tái khám định kỳ (Luật ATVSLĐ).',
    th: 'บังคับสำหรับผู้ทำงานในที่อับอากาศ สารเคมี ฝุ่น ต้องตรวจซ้ำเป็นระยะ (กม.ความปลอดภัยฯ)',
    es: 'Obligatorio para trabajos en espacios confinados, químicos o polvo. Reexamen periódico (Ley de Seguridad Laboral).',
  },
  '일반건강검진': {
    ko: '일반 건강검진 결과.', en: 'General health checkup result.', zh: '一般健康检查结果。', ja: '一般健康診断の結果。', vi: 'Kết quả khám sức khỏe tổng quát.', th: 'ผลตรวจสุขภาพทั่วไป', es: 'Resultado del examen de salud general.',
  },
  '채용시건강검진': {
    ko: '채용 시 건강검진 결과.', en: 'Pre-employment health checkup result.', zh: '入职时健康检查结果。', ja: '採用時の健康診断の結果。', vi: 'Kết quả khám sức khỏe khi tuyển dụng.', th: 'ผลตรวจสุขภาพก่อนเข้าทำงาน', es: 'Resultado del examen de preempleo.',
  },
  '건설기초안전보건교육': {
    ko: '건설 일용근로자 채용 시 필수(4시간). 이수증을 현장 입장 시 제시(산업안전보건법).',
    en: 'Required for daily construction workers (4h). Show the certificate to enter the site (OSH Act).',
    zh: '建筑日工入职必修（4小时），进场时出示结业证（产业安全保健法）。',
    ja: '建設日雇い労働者の採用時に必須(4時間)。入場時に修了証を提示(産業安全保健法)。',
    vi: 'Bắt buộc cho lao động xây dựng theo ngày (4 giờ). Xuất trình chứng chỉ khi vào công trường (Luật ATVSLĐ).',
    th: 'บังคับสำหรับคนงานก่อสร้างรายวัน (4 ชม.) แสดงใบรับรองเมื่อเข้าไซต์ (กม.ความปลอดภัยฯ)',
    es: 'Obligatorio para jornaleros de construcción (4 h). Muestre el certificado al entrar a la obra (Ley OSH).',
  },
  '화관법 안전교육': {
    ko: '유해화학물질 취급자 안전교육(취급담당자 16시간) + 종사자 정기 매년 2시간(화학물질관리법).',
    en: 'Safety training for hazardous-chemical handlers (16h for handlers) + 2h/year for workers (Chemicals Control Act).',
    zh: '有害化学品操作者安全教育（负责人16小时）+ 从业者每年定期2小时（化学物质管理法）。',
    ja: '有害化学物質取扱者の安全教育(担当者16時間)+従事者は毎年2時間(化学物質管理法)。',
    vi: 'Đào tạo an toàn cho người xử lý hóa chất độc hại (16 giờ) + 2 giờ/năm cho người lao động (Luật Quản lý hóa chất).',
    th: 'อบรมความปลอดภัยผู้จัดการสารเคมีอันตราย (ผู้รับผิดชอบ 16 ชม.) + พนักงานปีละ 2 ชม. (กม.จัดการสารเคมี)',
    es: 'Formación para manipuladores de químicos peligrosos (16 h) + 2 h/año para trabajadores (Ley de Control de Químicos).',
  },
  '안전보건교육': {
    ko: '근로자 정기 안전보건교육 이수 기록.', en: 'Record of regular worker safety & health training.', zh: '劳动者定期安全卫生教育记录。', ja: '労働者の定期安全衛生教育の修了記録。', vi: 'Hồ sơ đào tạo an toàn vệ sinh định kỳ.', th: 'บันทึกการอบรมความปลอดภัยตามระยะ', es: 'Registro de formación periódica de seguridad y salud.',
  },
  '밀폐공간 교육': {
    ko: '밀폐공간 작업 특별안전보건교육 이수 기록.', en: 'Record of special confined-space safety training.', zh: '密闭空间作业特别安全教育记录。', ja: '密閉空間作業の特別安全衛生教育の修了記録。', vi: 'Hồ sơ đào tạo an toàn đặc biệt cho không gian kín.', th: 'บันทึกการอบรมพิเศษงานพื้นที่อับอากาศ', es: 'Registro de formación especial de espacios confinados.',
  },
  '기타': {
    ko: '현장 입장·작업에 필요한 기타 서류.', en: 'Other documents needed to enter the site or work.', zh: '进场或作业所需的其他文件。', ja: '入場・作業に必要なその他の書類。', vi: 'Giấy tờ khác cần để vào công trường hoặc làm việc.', th: 'เอกสารอื่นที่ต้องใช้เข้าไซต์หรือทำงาน', es: 'Otros documentos para entrar a la obra o trabajar.',
  },
};

// 검진 결과 라벨
export const RESULT_LABEL: Record<string, L> = {
  '적합': { ko: '적합', en: 'Fit', zh: '合格', ja: '適合', vi: 'Đạt', th: 'ผ่าน', es: 'Apto' },
  '부적합': { ko: '부적합', en: 'Unfit', zh: '不合格', ja: '不適合', vi: 'Không đạt', th: 'ไม่ผ่าน', es: 'No apto' },
};

export function healthTypeLabel(type: string, lang: Lang): string {
  return HEALTH_TYPE_LABEL[type]?.[lang] ?? type;
}
export function docInfoLabel(type: string, lang: Lang): string {
  return DOC_INFO_LABEL[type]?.[lang] ?? '';
}
export function resultLabel(result: string, lang: Lang): string {
  return RESULT_LABEL[result]?.[lang] ?? result;
}
