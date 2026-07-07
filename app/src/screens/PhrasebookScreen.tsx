import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { PHRASE_GROUPS, PHRASES, STAFF_QUESTIONS, Phrase, StaffQuestion, PhraseGroupId } from '../data/emergencyPhrases';
import { speak, stopSpeaking } from '../services/speak';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Phrasebook'>;

const UI: Record<string, Record<Lang, string>> = {
  title: { ko: '바로 말하기', en: 'Speak for me', zh: '替我说', ja: '代わりに話す', vi: 'Nói giúp tôi', th: 'พูดแทนฉัน', es: 'Hablar por mí' },
  lead: { ko: '아플 때 누르면 한국어로 말해 줍니다. (번역기 아님 · 인터넷 없어도 됨)', en: 'Tap when you are hurt — it speaks Korean for you. (Not a translator · works offline)', zh: '受伤时点一下，会用韩语替你说。（不是翻译器·可离线）', ja: '痛いときに押すと、韓国語で話してくれます。（翻訳機ではありません・オフライン可）', vi: 'Khi bị đau hãy chạm — nó sẽ nói tiếng Hàn giúp bạn. (Không phải app dịch · dùng offline)', th: 'เมื่อเจ็บให้กดปุ่ม แล้วจะพูดภาษาเกาหลีแทนคุณ (ไม่ใช่แอปแปลภาษา · ใช้ออฟไลน์ได้)', es: 'Toca cuando te duela: habla coreano por ti. (No es un traductor · funciona sin internet)' },
  mode_self: { ko: '내가 말하기', en: 'I speak', zh: '我来说', ja: '自分が話す', vi: 'Tôi nói', th: 'ฉันพูด', es: 'Yo hablo' },
  mode_staff: { ko: '의료진이 묻기', en: 'Staff asks', zh: '医护提问', ja: '医療者が聞く', vi: 'Nhân viên hỏi', th: 'เจ้าหน้าที่ถาม', es: 'El personal pregunta' },
  staff_lead: { ko: '한국어 질문을 누르면 환자 언어로 들려줍니다.', en: 'Tap a Korean question → it plays in the patient’s language.', zh: '点韩语问题 → 用患者的语言播放。', ja: '韓国語の質問を押すと、患者の言語で流れます。', vi: 'Chạm câu hỏi tiếng Hàn → phát bằng ngôn ngữ của bệnh nhân.', th: 'แตะคำถามภาษาเกาหลี → เล่นเป็นภาษาของผู้ป่วย', es: 'Toque una pregunta en coreano → suena en el idioma del paciente.' },
  where: { ko: '어디가 아파요?', en: 'Where does it hurt?', zh: '哪里不舒服？', ja: 'どこが痛いですか？', vi: 'Bạn đau ở đâu?', th: 'เจ็บตรงไหน?', es: '¿Dónde te duele?' },
  back: { ko: '← 목록', en: '← Back', zh: '← 返回', ja: '← 一覧', vi: '← Quay lại', th: '← กลับ', es: '← Volver' },
  showThis: { ko: '이 화면을 의료진에게 보여주세요', en: 'Show this screen to the medical staff', zh: '请把这个画面给医护人员看', ja: 'この画面を医療スタッフに見せてください', vi: 'Hãy đưa màn hình này cho nhân viên y tế', th: 'แสดงหน้าจอนี้ให้เจ้าหน้าที่ทางการแพทย์', es: 'Muestre esta pantalla al personal médico' },
  replay: { ko: '다시 듣기', en: 'Play again', zh: '再播放', ja: 'もう一度', vi: 'Nghe lại', th: 'ฟังอีกครั้ง', es: 'Reproducir otra vez' },
  report: { ko: '번역이 이상해요', en: 'Translation looks wrong', zh: '翻译有问题', ja: '翻訳がおかしい', vi: 'Bản dịch có vẻ sai', th: 'คำแปลดูผิด', es: 'La traducción parece incorrecta' },
  reported: { ko: '신고가 접수됐어요. 감사합니다.', en: 'Report received. Thank you.', zh: '已收到反馈，谢谢。', ja: '報告を受け付けました。ありがとうございます。', vi: 'Đã nhận phản hồi. Cảm ơn bạn.', th: 'รับเรื่องแล้ว ขอบคุณค่ะ', es: 'Reporte recibido. Gracias.' },
  disclaimer: { ko: '진단이 아니라 의사 전달을 돕는 문장입니다. 위급하면 즉시 119.', en: 'These sentences help you communicate, not a diagnosis. In an emergency, call 119.', zh: '这些句子用于沟通，不是诊断。紧急时请拨打119。', ja: '診断ではなく意思疎通を助ける文です。緊急時は119へ。', vi: 'Đây là câu để giao tiếp, không phải chẩn đoán. Khi khẩn cấp gọi 119.', th: 'ประโยคนี้ช่วยสื่อสาร ไม่ใช่การวินิจฉัย หากฉุกเฉินโทร 119', es: 'Estas frases ayudan a comunicarse, no son un diagnóstico. En emergencia, llame al 119.' },
  call119: { ko: '119 전화', en: 'Call 119', zh: '拨打119', ja: '119に電話', vi: 'Gọi 119', th: 'โทร 119', es: 'Llamar al 119' },
  soundOff: { ko: '소리가 안 나면 위 글자를 보여주세요.', en: 'If there is no sound, show the text above.', zh: '如果没有声音，请出示上面的文字。', ja: '音が出ない場合は、上の文字を見せてください。', vi: 'Nếu không có âm thanh, hãy đưa chữ ở trên.', th: 'ถ้าไม่มีเสียง ให้แสดงข้อความด้านบน', es: 'Si no hay sonido, muestre el texto de arriba.' },
};

interface Active { big: string; sub: string; noVoice: boolean; id: string; speakText: string; speakLang: Lang; showHint: boolean; }

export function PhrasebookScreen({ navigation }: Props) {
  const { lang } = useLang();
  const t = (k: string) => UI[k][lang];
  const [mode, setMode] = useState<'self' | 'staff'>('self');
  const [group, setGroup] = useState<PhraseGroupId | null>(null);
  const [active, setActive] = useState<Active | null>(null);

  const playSelf = (p: Phrase) => {
    const r = speak(p.ko, 'ko');
    setActive({ big: p.ko, sub: p.text[lang], noVoice: r !== 'ok', id: p.id, speakText: p.ko, speakLang: 'ko', showHint: true });
  };
  const playStaff = (q: StaffQuestion) => {
    const r = speak(q.text[lang], lang);
    setActive({ big: q.text[lang], sub: q.ko, noVoice: r !== 'ok', id: q.id, speakText: q.text[lang], speakLang: lang, showHint: false });
  };
  const replay = () => active && speak(active.speakText, active.speakLang);

  const report = (label: string) => Alert.alert(t('report'), `"${label}"`, [{ text: 'OK', onPress: () => Alert.alert(t('reported')) }]);

  const urgent = PHRASE_GROUPS.filter((g) => g.kind === 'urgent');
  const parts = PHRASE_GROUPS.filter((g) => g.kind === 'part');
  const info = PHRASE_GROUPS.filter((g) => g.kind === 'info');
  const groupObj = PHRASE_GROUPS.find((g) => g.id === group);
  const list = group ? PHRASES.filter((p) => p.group === group) : [];

  const switchMode = (m: 'self' | 'staff') => { setMode(m); setGroup(null); setActive(null); stopSpeaking(); };

  return (
    <View style={styles.wrap}>
      <AppBar title={t('title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeRow}>
          <Chip label={t('mode_self')} tone="primary" selected={mode === 'self'} onPress={() => switchMode('self')} />
          <Chip label={t('mode_staff')} tone="work" selected={mode === 'staff'} onPress={() => switchMode('staff')} />
        </View>

        {active && (
          <View style={[styles.activeCard, shadow.card]}>
            {active.showHint && <Text style={[typography.small, { color: colors.primary, marginBottom: 4 }]}>{t('showThis')}</Text>}
            {!active.showHint && active.sub ? <Text style={[typography.small, { color: colors.textMuted, marginBottom: 4 }]}>{active.sub}</Text> : null}
            <Text style={styles.activeBig}>{active.big}</Text>
            {active.showHint && active.sub ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>{active.sub}</Text> : null}
            {active.noVoice && <Text style={[typography.small, { color: colors.warning, marginTop: 6 }]}>🔇 {t('soundOff')}</Text>}
            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <PrimaryButton title={t('replay')} icon="🔎" variant="primary" size="sm" onPress={replay} />
            </View>
          </View>
        )}

        {/* ── 역방향: 의료진이 묻기 ── */}
        {mode === 'staff' && (
          <>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>{t('staff_lead')}</Text>
            {STAFF_QUESTIONS.map((q) => (
              <Pressable key={q.id} onPress={() => playStaff(q)} style={[styles.phrase, shadow.card, active?.id === q.id && { borderColor: colors.work, borderWidth: 1.5 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phraseText}>{q.ko}</Text>
                  <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{q.text[lang]}</Text>
                </View>
                <Text style={styles.playIcon}>🔊</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* ── 정방향: 내가 말하기 ── */}
        {mode === 'self' && !group && (
          <>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>{t('lead')}</Text>
            {urgent.map((g) => (
              <Pressable key={g.id} onPress={() => { setGroup(g.id); stopSpeaking(); }}
                style={[styles.urgentBtn, { backgroundColor: g.id === 'emergency' ? colors.emergency : colors.work }]}>
                <Text style={styles.urgentTxt}>{g.icon}  {g.label[lang]}</Text>
              </Pressable>
            ))}
            <Text style={styles.section}>{t('where')}</Text>
            <View style={styles.grid}>
              {parts.map((g) => (
                <Pressable key={g.id} onPress={() => { setGroup(g.id); stopSpeaking(); }} style={[styles.cell, shadow.card]}>
                  <Text style={styles.cellIcon}>{g.icon}</Text>
                  <Text style={styles.cellLabel}>{g.label[lang]}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.grid, { marginTop: spacing.sm }]}>
              {info.map((g) => (
                <Pressable key={g.id} onPress={() => { setGroup(g.id); stopSpeaking(); }} style={[styles.cell, shadow.card]}>
                  <Text style={styles.cellIcon}>{g.icon}</Text>
                  <Text style={styles.cellLabel}>{g.label[lang]}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {mode === 'self' && group && groupObj && (
          <>
            <Pressable onPress={() => { setGroup(null); setActive(null); }} style={styles.backBtn}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>{t('back')}</Text>
            </Pressable>
            <Text style={styles.groupTitle}>{groupObj.icon}  {groupObj.label[lang]}</Text>
            {(group === 'emergency' || group === 'work') && (
              <View style={{ marginBottom: spacing.sm }}>
                <PrimaryButton title={t('call119')} icon="📞" variant="emergency" size="lg" onPress={() => Linking.openURL('tel:119')} />
              </View>
            )}
            {list.map((p) => (
              <Pressable key={p.id} onPress={() => playSelf(p)} style={[styles.phrase, shadow.card, active?.id === p.id && { borderColor: colors.primary, borderWidth: 1.5 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phraseText}>{p.text[lang]}</Text>
                  {lang !== 'ko' && <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{p.ko}</Text>}
                  <Pressable onPress={() => report(p.text[lang])} hitSlop={8}><Text style={styles.reportTxt}>{UI.report[lang]}</Text></Pressable>
                </View>
                <Text style={styles.playIcon}>🔊</Text>
              </Pressable>
            ))}
          </>
        )}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' }]}>{t('disclaimer')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  modeRow: { flexDirection: 'row', marginBottom: spacing.md },
  section: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  urgentBtn: { borderRadius: radius.xl, paddingVertical: 18, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, alignItems: 'center' },
  urgentTxt: { ...typography.button, color: '#fff', fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '31.5%', backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  cellIcon: { fontSize: 30 },
  cellLabel: { ...typography.captionBold, color: colors.text, marginTop: 6, textAlign: 'center' },
  backBtn: { paddingVertical: spacing.sm },
  groupTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  phrase: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderColor: 'transparent', borderWidth: 1.5 },
  phraseText: { ...typography.bodyBold, color: colors.text, fontSize: 17 },
  reportTxt: { ...typography.small, color: colors.g400, marginTop: 8, textDecorationLine: 'underline' },
  playIcon: { fontSize: 30, marginLeft: spacing.sm },
  activeCard: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  activeBig: { fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 34 },
});
