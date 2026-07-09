import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { LangSwitcher } from '../components/LangSwitcher';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { signup, isValidUsername } from '../services/auth';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const UI: Record<string, Record<Lang, string>> = {
  title: { ko: '회원가입', en: 'Sign up', zh: '注册', ja: '新規登録', vi: 'Đăng ký', th: 'สมัครสมาชิก', es: 'Registrarse' },
  id: { ko: '아이디 (영문/숫자 3~20자)', en: 'ID (letters/numbers, 3–20)', zh: '账号（字母/数字 3~20位）', ja: 'ID（英数字3〜20文字）', vi: 'Tên đăng nhập (chữ/số, 3–20)', th: 'ไอดี (ตัวอักษร/ตัวเลข 3–20)', es: 'Usuario (letras/números, 3–20)' },
  pw: { ko: '비밀번호 (6자 이상)', en: 'Password (6+ chars)', zh: '密码（6位以上）', ja: 'パスワード（6文字以上）', vi: 'Mật khẩu (từ 6 ký tự)', th: 'รหัสผ่าน (6 ตัวขึ้นไป)', es: 'Contraseña (6+ caracteres)' },
  name: { ko: '이름', en: 'Name', zh: '姓名', ja: '名前', vi: 'Họ tên', th: 'ชื่อ', es: 'Nombre' },
  phone: { ko: '전화번호', en: 'Phone number', zh: '电话号码', ja: '電話番号', vi: 'Số điện thoại', th: 'เบอร์โทร', es: 'Teléfono' },
  site: { ko: '현장 선택', en: 'Select site', zh: '选择工地', ja: '現場を選択', vi: 'Chọn công trường', th: 'เลือกไซต์งาน', es: 'Elegir obra' },
  submit: { ko: '가입하기', en: 'Create account', zh: '注册', ja: '登録する', vi: 'Tạo tài khoản', th: 'สมัคร', es: 'Crear cuenta' },
  err_id: { ko: '아이디는 영문/숫자 3~20자로 입력하세요.', en: 'ID must be 3–20 letters/numbers.', zh: '账号需为3~20位字母/数字。', ja: 'IDは英数字3〜20文字で入力してください。', vi: 'Tên đăng nhập phải 3–20 chữ/số.', th: 'ไอดีต้องเป็นตัวอักษร/ตัวเลข 3–20 ตัว', es: 'El usuario debe tener 3–20 letras/números.' },
  err_fields: { ko: '모든 항목을 입력하세요.', en: 'Please fill in all fields.', zh: '请填写所有项目。', ja: 'すべての項目を入力してください。', vi: 'Vui lòng điền đầy đủ.', th: 'กรุณากรอกให้ครบ', es: 'Complete todos los campos.' },
  err_taken: { ko: '이미 사용 중인 아이디입니다.', en: 'This ID is already taken.', zh: '该账号已被使用。', ja: 'このIDは既に使われています。', vi: 'Tên đăng nhập đã tồn tại.', th: 'ไอดีนี้ถูกใช้แล้ว', es: 'Este usuario ya existe.' },
  err_pw: { ko: '비밀번호는 6자 이상이어야 합니다.', en: 'Password must be at least 6 characters.', zh: '密码至少6位。', ja: 'パスワードは6文字以上。', vi: 'Mật khẩu ít nhất 6 ký tự.', th: 'รหัสผ่านอย่างน้อย 6 ตัว', es: 'La contraseña debe tener 6+ caracteres.' },
  pending_title: { ko: '가입 완료 (승인 대기)', en: 'Signed up (approval pending)', zh: '注册完成（等待审批）', ja: '登録完了（承認待ち）', vi: 'Đăng ký xong (chờ duyệt)', th: 'สมัครแล้ว (รออนุมัติ)', es: 'Registrado (pendiente de aprobación)' },
  pending_msg: { ko: '관리자 승인 전에는 기본 기능만 사용할 수 있어요. (AI 상담은 승인 후)', en: 'Until approved, only basic features are available. (AI after approval)', zh: '审批前只能使用基本功能。（AI需审批后）', ja: '承認までは基本機能のみ利用できます。（AIは承認後）', vi: 'Trước khi được duyệt chỉ dùng chức năng cơ bản. (AI sau khi duyệt)', th: 'ก่อนอนุมัติใช้ได้เฉพาะฟังก์ชันพื้นฐาน (AI หลังอนุมัติ)', es: 'Hasta la aprobación solo funciones básicas. (IA tras aprobación)' },
};

export function SignupScreen({ navigation }: Props) {
  const colors = useTheme();
  const { lang } = useLang();
  const t = (k: string) => UI[k][lang];
  const [f, setF] = useState({ username: '', pw: '', name: '', phone: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr('');
    if (!f.username || !f.pw || !f.name || !f.phone) return setErr(t('err_fields'));
    if (!isValidUsername(f.username)) return setErr(t('err_id'));
    if (f.pw.length < 6) return setErr(t('err_pw'));
    setBusy(true);
    try {
      await signup({ username: f.username, password: f.pw, name: f.name, phone: f.phone, lang });
      Alert.alert(t('pending_title'), t('pending_msg')); // 이후 AuthContext가 앱으로 자동 전환(general)
    } catch (e: any) {
      setErr(e?.code === 'auth/email-already-in-use' ? t('err_taken') : (e?.code === 'auth/weak-password' ? t('err_pw') : t('err_fields')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppBar title={t('title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <LangSwitcher style={{ marginBottom: spacing.md }} />
        <TextInput value={f.username} onChangeText={(v) => set('username', v)} placeholder={t('id')} placeholderTextColor={colors.g500} autoCapitalize="none" style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
        <TextInput value={f.pw} onChangeText={(v) => set('pw', v)} placeholder={t('pw')} placeholderTextColor={colors.g500} secureTextEntry style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
        <TextInput value={f.name} onChangeText={(v) => set('name', v)} placeholder={t('name')} placeholderTextColor={colors.g500} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
        <TextInput value={f.phone} onChangeText={(v) => set('phone', v)} placeholder={t('phone')} placeholderTextColor={colors.g500} keyboardType="phone-pad" style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />

        {err ? <Text style={[typography.caption, { color: colors.emergency, marginTop: spacing.md }]}>{err}</Text> : null}
        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title={t('submit')} size="lg" loading={busy} onPress={submit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.lg },
  input: { backgroundColor: _staticColors.card, borderWidth: 1, borderColor: _staticColors.border, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, ...typography.body, color: _staticColors.text },
});
