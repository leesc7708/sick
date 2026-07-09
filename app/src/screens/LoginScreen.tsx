import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LogoMark } from '../components/LogoMark';
import { LangSwitcher } from '../components/LangSwitcher';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { login } from '../services/auth';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const UI: Record<string, Record<Lang, string>> = {
  pick_lang: { ko: '먼저 언어를 선택하세요', en: 'Choose your language first', zh: '请先选择语言', ja: 'まず言語を選んでください', vi: 'Chọn ngôn ngữ của bạn trước', th: 'เลือกภาษาของคุณก่อน', es: 'Primero elige tu idioma' },
  id: { ko: '아이디', en: 'ID', zh: '账号', ja: 'ID', vi: 'Tên đăng nhập', th: 'ไอดี', es: 'Usuario' },
  pw: { ko: '비밀번호', en: 'Password', zh: '密码', ja: 'パスワード', vi: 'Mật khẩu', th: 'รหัสผ่าน', es: 'Contraseña' },
  login: { ko: '로그인', en: 'Log in', zh: '登录', ja: 'ログイン', vi: 'Đăng nhập', th: 'เข้าสู่ระบบ', es: 'Iniciar sesión' },
  signup: { ko: '계정이 없어요 · 회원가입', en: 'No account · Sign up', zh: '没有账号 · 注册', ja: 'アカウントがない · 新規登録', vi: 'Chưa có tài khoản · Đăng ký', th: 'ยังไม่มีบัญชี · สมัคร', es: 'Sin cuenta · Registrarse' },
  err: { ko: '아이디 또는 비밀번호가 올바르지 않습니다.', en: 'Incorrect ID or password.', zh: '账号或密码不正确。', ja: 'IDまたはパスワードが正しくありません。', vi: 'Sai tên đăng nhập hoặc mật khẩu.', th: 'ไอดีหรือรหัสผ่านไม่ถูกต้อง', es: 'Usuario o contraseña incorrectos.' },
};

export function LoginScreen({ navigation }: Props) {
  const colors = useTheme(); // JSX colors.* 를 활성 테마로 (StyleSheet 색은 사용처에서 덮음)
  const { lang } = useLang();
  const t = (k: string) => UI[k][lang];
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(''); setBusy(true);
    try { await login(username, pw); } // 성공 시 AuthContext가 자동 전환
    catch { setErr(t('err')); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <LogoMark size={44} />
          <Text style={[typography.h1, { color: colors.text, marginLeft: 10 }]}>라이프라인 <Text style={{ color: colors.work }}>@work</Text></Text>
        </View>

        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>🌏 {t('pick_lang')}</Text>
        <LangSwitcher style={{ marginBottom: spacing.lg }} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('id')}</Text>
        <TextInput value={username} onChangeText={setUsername} placeholder={t('id')} placeholderTextColor={colors.g500} autoCapitalize="none" style={[styles.input, { backgroundColor: colors.card, borderColor: colors.g300, color: colors.text }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('pw')}</Text>
        <TextInput value={pw} onChangeText={setPw} placeholder={t('pw')} placeholderTextColor={colors.g500} secureTextEntry style={[styles.input, { backgroundColor: colors.card, borderColor: colors.g300, color: colors.text }]} />
        {err ? <Text style={[typography.caption, { color: colors.emergency, marginTop: 6 }]}>{err}</Text> : null}

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title={t('login')} size="lg" loading={busy} onPress={submit} />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <PrimaryButton title={t('signup')} variant="ghost" onPress={() => navigation.navigate('Signup')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }, // 세로 중앙 정렬 → 하단 대공백 해소
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  label: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.md, marginBottom: 6 },
  input: { backgroundColor: _staticColors.card, borderWidth: 1, borderColor: _staticColors.g300, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: _staticColors.text },
});
