import React, { useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { DEPT_GUIDES } from '../data/departmentGuide';
import { consultAI, ConsultResult } from '../services/deptConsult';
import { storage } from '../services/storage';
import { useAuth } from '../auth/AuthContext';
import { canUseAI } from '../services/auth';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'DeptConsult'>;

// 자주 헷갈리는 케이스를 빠른 선택칩으로 (id는 departmentGuide와 일치)
const QUICK = ['stye', 'hand_numb', 'dizzy', 'rash', 'weld_eye', 'burn', 'chem_eye', 'dust_breath'];

// 국외이전(자유 문장 → 해외 AI) 동의 문구. 7개 언어.
const CONSENT: Record<string, Record<Lang, string>> = {
  notice: {
    ko: '🔒 자유 문장으로 물으면, 안내 생성을 위해 문장이 해외 AI(Anthropic·미국)로 전송됩니다. 빠른 선택은 전송 없이 즉시 안내돼요.',
    en: '🔒 Free-text questions are sent to an overseas AI (Anthropic, USA) to generate guidance. Quick picks answer instantly with no transfer.',
    zh: '🔒 用自由文字提问时，句子会被发送到海外 AI（Anthropic·美国）以生成指引。快速选择不发送、即时给出。',
    ja: '🔒 自由入力で質問すると、案内生成のため文章が海外AI（Anthropic・米国）に送信されます。クイック選択は送信なしで即時。',
    vi: '🔒 Khi hỏi bằng câu chữ tự do, câu của bạn được gửi tới AI ở nước ngoài (Anthropic, Mỹ) để tạo hướng dẫn. Chọn nhanh trả lời ngay, không gửi đi.',
    th: '🔒 เมื่อพิมพ์ถามอิสระ ข้อความจะถูกส่งไปยัง AI ต่างประเทศ (Anthropic สหรัฐฯ) เพื่อสร้างคำแนะนำ การเลือกด่วนตอบทันทีโดยไม่ส่งข้อมูล',
    es: '🔒 Las preguntas de texto libre se envían a una IA en el extranjero (Anthropic, EE. UU.) para generar la guía. Las opciones rápidas responden al instante sin envío.',
  },
  title: { ko: '해외 AI 전송 동의', en: 'Overseas AI transfer', zh: '海外 AI 传输同意', ja: '海外AIへの送信の同意', vi: 'Đồng ý gửi ra AI nước ngoài', th: 'ยินยอมส่งไป AI ต่างประเทศ', es: 'Envío a IA en el extranjero' },
  body: {
    ko: '입력하신 증상 문구가 안내를 만들기 위해 해외 AI 서비스(Anthropic, 미국)로 전송됩니다. 동의하시겠어요? 동의하지 않으면 전송 없이 기본 안내만 제공됩니다.',
    en: 'Your symptom text will be sent to an overseas AI service (Anthropic, USA) to generate guidance. Do you agree? If not, only basic guidance is given with no transfer.',
    zh: '您输入的症状文字将被发送到海外 AI 服务（Anthropic·美国）以生成指引。是否同意？不同意则仅提供基本指引、不发送。',
    ja: '入力した症状の文章が、案内生成のため海外AIサービス（Anthropic・米国）に送信されます。同意しますか？同意しない場合は送信せず基本案内のみ提供します。',
    vi: 'Câu mô tả triệu chứng của bạn sẽ được gửi tới dịch vụ AI ở nước ngoài (Anthropic, Mỹ) để tạo hướng dẫn. Bạn có đồng ý không? Nếu không, chỉ cung cấp hướng dẫn cơ bản, không gửi đi.',
    th: 'ข้อความอาการของคุณจะถูกส่งไปยังบริการ AI ต่างประเทศ (Anthropic สหรัฐฯ) เพื่อสร้างคำแนะนำ คุณยินยอมไหม? หากไม่ จะให้เฉพาะคำแนะนำพื้นฐานโดยไม่ส่งข้อมูล',
    es: 'Su texto de síntomas se enviará a un servicio de IA en el extranjero (Anthropic, EE. UU.) para generar la guía. ¿Está de acuerdo? Si no, solo se da una guía básica sin envío.',
  },
  yes: { ko: '동의하고 AI 안내', en: 'Agree & use AI', zh: '同意并使用AI', ja: '同意してAI案内', vi: 'Đồng ý, dùng AI', th: 'ยินยอมและใช้ AI', es: 'Aceptar y usar IA' },
  no: { ko: '동의 안 함 (기본 안내)', en: 'No (basic only)', zh: '不同意（仅基本）', ja: '同意しない（基本のみ）', vi: 'Không (chỉ cơ bản)', th: 'ไม่ยินยอม (พื้นฐาน)', es: 'No (solo básico)' },
  need_approval: {
    ko: '⚠️ AI 자유상담은 관리자 승인 후 이용할 수 있어요. 지금은 기본 안내(빠른 선택)만 제공됩니다.',
    en: '⚠️ Free-text AI consultation is available after manager approval. For now, only basic guidance (quick picks).',
    zh: '⚠️ 自由文字AI咨询需管理员审批后使用。目前仅提供基本指引（快速选择）。',
    ja: '⚠️ 自由入力のAI相談は管理者の承認後に利用できます。今は基本案内（クイック選択）のみ。',
    vi: '⚠️ Tư vấn AI bằng văn bản tự do dùng được sau khi quản lý duyệt. Hiện chỉ có hướng dẫn cơ bản (chọn nhanh).',
    th: '⚠️ การปรึกษา AI แบบพิมพ์อิสระใช้ได้หลังผู้จัดการอนุมัติ ตอนนี้มีเฉพาะคำแนะนำพื้นฐาน (เลือกด่วน)',
    es: '⚠️ La consulta con IA de texto libre está disponible tras la aprobación del gestor. Por ahora, solo guía básica (opciones rápidas).',
  },
};

// [주석보존] 모듈 스코프 정적 색 → 테마 전환 위해 컴포넌트 내부(useTheme 기반)로 이전 (2026-07-09):
// const URGENCY_STYLE: Record<string, { bg: string; fg: string }> = {
//   emergency: { bg: '#FDECEC', fg: colors.emergency },
//   soon: { bg: '#FFF4E5', fg: colors.warning },
//   normal: { bg: '#EAF5EE', fg: colors.success },
// };

// 위급도 라벨 7개 언어 (모든 결과 카드가 자국어로)
const URGENCY_LABEL: Record<string, Record<Lang, string>> = {
  emergency: {
    ko: '🔴 응급 — 지체 말고 119/응급실', en: '🔴 Emergency — call 119 / go to ER now', zh: '🔴 紧急 — 立即拨打119/去急诊',
    ja: '🔴 緊急 — ためらわず119/救急外来へ', vi: '🔴 Khẩn cấp — gọi 119 / đến cấp cứu ngay', th: '🔴 ฉุกเฉิน — โทร 119 / ไปห้องฉุกเฉินทันที', es: '🔴 Emergencia — llame al 119 / vaya a urgencias ya',
  },
  soon: {
    ko: '🟠 되도록 빨리 진료', en: '🟠 See a doctor soon', zh: '🟠 尽快就医',
    ja: '🟠 できるだけ早く受診を', vi: '🟠 Nên đi khám sớm', th: '🟠 ควรพบแพทย์โดยเร็ว', es: '🟠 Consulte pronto a un médico',
  },
  normal: {
    ko: '🟢 서두르지 않아도 되나 진료 권장', en: '🟢 Not urgent, but a visit is advised', zh: '🟢 不急，但建议就诊',
    ja: '🟢 急ぎではないが受診推奨', vi: '🟢 Không gấp, nhưng nên đi khám', th: '🟢 ไม่เร่งด่วน แต่แนะนำให้พบแพทย์', es: '🟢 No urgente, pero se recomienda consultar',
  },
};

export function DeptConsultScreen({ navigation }: Props) {
  const { t, lang } = useLang();
  const colors = useTheme();
  // 위급도 색: 응급 빨강·주황·초록은 두 테마 모두 고대비 유지, 배경 틴트만 테마화
  const URGENCY_STYLE: Record<string, { bg: string; fg: string }> = {
    emergency: { bg: colors.emergencyLight, fg: colors.emergency },
    soon: { bg: colors.warningLight, fg: colors.warning },
    normal: { bg: colors.successLight, fg: colors.success },
  };
  const { account } = useAuth();
  const aiAllowed = canUseAI(account); // 미승인(general)은 AI 자유상담 불가
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [results, setResults] = useState<ConsultResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const C = (k: string) => CONSENT[k][lang];

  const execute = async (allowAI: boolean) => {
    setLoading(true);
    try {
      const p = await storage.getProfile();
      const profile = p
        ? { age: p.age, conditions: p.conditions, currentMedicines: p.currentMedicines }
        : undefined;
      setResults(await consultAI(text, picked, lang, profile, allowAI));
    } finally {
      setLoading(false);
    }
  };

  const run = async () => {
    // 빠른칩만 있거나 자유문장이 없으면 해외 전송 없음 → 바로 실행
    if (picked.length || !text.trim()) {
      execute(true);
      return;
    }
    // 미승인(general) 사용자는 AI 자유상담 불가 → 규칙기반만(해외 전송 없음)
    if (!aiAllowed) {
      execute(false);
      return;
    }
    // 자유문장(AI 경로) → 국외이전 동의 확인(1회)
    const consented = await storage.getAiConsent();
    if (consented) {
      execute(true);
      return;
    }
    // ⚠️ 웹에서는 RN Alert.alert가 동작 안 함 → window.confirm으로 처리(2026-07-09 버그픽스)
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm(`${C('title')}\n\n${C('body')}`);
      if (ok) { await storage.setAiConsent(true); execute(true); }
      else execute(false);
      return;
    }
    Alert.alert(C('title'), C('body'), [
      { text: C('no'), style: 'cancel', onPress: () => execute(false) },
      { text: C('yes'), onPress: async () => { await storage.setAiConsent(true); execute(true); } },
    ]);
  };

  const goHospital = (dept: string) =>
    navigation.navigate('HospitalFinder', { kind: 'hospital', department: dept });

  const quickGuides = QUICK.map((id) => DEPT_GUIDES.find((g) => g.id === id)).filter(Boolean) as typeof DEPT_GUIDES;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('dc_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t('dc_lead')}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('dc_input_label')}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('dc_input_ph')}
          placeholderTextColor={colors.g500}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }, { minHeight: 64 }]}
          multiline
        />
        <Text style={[typography.small, { color: aiAllowed ? colors.textMuted : colors.warning, marginTop: 6 }]}>{aiAllowed ? C('notice') : C('need_approval')}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('dc_quick_label')}</Text>
        <View style={styles.chips}>
          {quickGuides.map((g) => (
            <Chip key={g.id} label={g.symptom} tone={g.work ? 'work' : 'primary'} selected={picked.includes(g.id)} onPress={() => togglePick(g.id)} />
          ))}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title={t('dc_run')} icon="🔎" size="lg" loading={loading} onPress={run} />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <PrimaryButton title={t('phrasebook_title')} icon="🗣️" variant="ghost" size="sm" onPress={() => navigation.navigate('Phrasebook')} />
        </View>

        {results && results.length === 0 && (
          <View style={[styles.card, shadow.card, { backgroundColor: colors.card }, { marginTop: spacing.lg }]}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{t('dc_none_title')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>{t('dc_none_desc')}</Text>
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title={t('dc_open_hospital')} icon="🏥" variant="outline" size="sm" onPress={() => navigation.navigate('HospitalFinder')} />
            </View>
          </View>
        )}

        {results && results.length > 0 && (
          <>
            {results.some((r) => r.guide.urgency === 'emergency') && (
              <View style={{ marginTop: spacing.lg }}>
                <PrimaryButton title={t('ef_call119')} icon="📞" variant="emergency" size="lg" onPress={() => Linking.openURL('tel:119')} />
              </View>
            )}
            <Text style={[styles.label, { color: colors.textSecondary }, { marginTop: spacing.xl }]}>{t('dc_result_label')}</Text>
            {results.map(({ guide }, idx) => {
              const u = URGENCY_STYLE[guide.urgency];
              return (
                <View key={guide.id} style={[styles.card, shadow.card, { backgroundColor: colors.card }, { borderLeftWidth: 5, borderLeftColor: u.fg }]}>
                  {idx === 0 && <Text style={[typography.small, { color: colors.primary, marginBottom: 4 }]}>{t('dc_best')}</Text>}
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{guide.symptom}</Text>

                  <View style={styles.deptRow}>
                    <View style={[styles.deptBadge, { backgroundColor: colors.primary }]}><Text style={[styles.deptBadgeTxt, { color: colors.textInverse }]}>{guide.primaryDept}</Text></View>
                    {guide.altDept && (
                      <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 8 }]}>
                        {t('dc_or')} {guide.altDept}
                      </Text>
                    )}
                  </View>

                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>{guide.reason}</Text>
                  {guide.confuseNote && (
                    <View style={[styles.tipBox, { backgroundColor: colors.g100 }]}>
                      <Text style={[typography.caption, { color: colors.g800 }]}>💡 {guide.confuseNote}</Text>
                    </View>
                  )}

                  <View style={[styles.urgency, { backgroundColor: u.bg }]}>
                    <Text style={[typography.captionBold, { color: u.fg }]}>{URGENCY_LABEL[guide.urgency][lang]}</Text>
                    {guide.urgencyNote && <Text style={[typography.small, { color: u.fg, marginTop: 2 }]}>{guide.urgencyNote}</Text>}
                  </View>

                  <View style={{ marginTop: spacing.md }}>
                    <PrimaryButton title={`${guide.primaryDept} ${t('dc_find_dept')}`} icon="🏥" size="sm" onPress={() => goHospital(guide.primaryDept)} />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* 정직 고지: 지금은 규칙기반, AI 자유상담은 준비 중 */}
        <View style={[styles.aiNote, { backgroundColor: colors.g50 }]}>
          <Text style={[typography.small, { color: colors.textMuted }]}>{t('dc_ai_note')}</Text>
        </View>

        <Disclaimer text={t('dc_disclaimer')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { backgroundColor: _staticColors.card, borderWidth: 1, borderColor: _staticColors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: _staticColors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm },
  deptRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  deptBadge: { backgroundColor: _staticColors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  deptBadgeTxt: { ...typography.captionBold, color: _staticColors.textInverse },
  tipBox: { backgroundColor: _staticColors.g100, borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.sm },
  urgency: { borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.sm },
  aiNote: { backgroundColor: _staticColors.g50, borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.lg },
});
