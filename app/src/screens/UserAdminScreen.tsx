import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { useAuth } from '../auth/AuthContext';
import {
  Role, AccountStatus, UserAccount, isSsvisor, listUsers, setUserRoleStatus,
} from '../services/auth';
import { RootStackParamList } from '../types';
import { fill, useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'UserAdmin'>;

const ROLE_KEY: Record<Role, string> = {
  general: 'ua_role_general', worker: 'ua_role_worker', svisor: 'ua_role_svisor', ssvisor: 'ua_role_ssvisor',
};
const STATUS_KEY: Record<AccountStatus, string> = {
  pending: 'ua_st_pending', active: 'ua_st_active', rejected: 'ua_st_rejected',
};
// 부여 가능한 역할(일반=미승인 상태로 강등용 제외, 승격 대상만)
const ASSIGNABLE: Role[] = ['worker', 'svisor', 'ssvisor'];

export function UserAdminScreen({ navigation }: Props) {
  const colors = useTheme();
  const { t } = useLang();
  const { account } = useAuth();
  const roleLabel = (r: Role) => t(ROLE_KEY[r]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [busy, setBusy] = useState<string | null>(null); // 처리 중 uid
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try { setUsers(await listUsers()); setMsg(''); }
    catch (e: any) { setMsg(`${t('ua_err_load')}: ` + (e?.message || e)); }
  }, [t]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 총괄(ssvisor)만 접근 가능
  if (!isSsvisor(account)) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
        <AppBar title={t('ua_title_short')} onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={[typography.body, { color: colors.textMuted }]}>{t('ua_denied')}</Text>
        </View>
      </View>
    );
  }

  const apply = async (u: UserAccount, role: Role, status: AccountStatus) => {
    if (u.uid === account!.uid && (role !== 'ssvisor' || status !== 'active')) {
      return RNAlert.alert(t('ua_self_t'), t('ua_self_m'));
    }
    setBusy(u.uid); setMsg('');
    try {
      await setUserRoleStatus(u.uid, role, status);
      await load();
    } catch (e: any) {
      setMsg(`${t('ua_err_apply')}: ` + (e?.message || e));
    } finally { setBusy(null); }
  };

  // 이름은 문장 중간에 들어가므로 t()에 이어붙이지 않고 {who} 자리에 채운다(언어별 어순)
  const who = (u: UserAccount) => `${u.name}(${u.username})`;

  const reject = (u: UserAccount) =>
    RNAlert.alert(t('ua_reject'), fill(t('ua_reject_m'), { who: who(u) }), [
      { text: t('ua_cancel'), style: 'cancel' },
      { text: t('ua_reject'), style: 'destructive', onPress: () => apply(u, 'general', 'rejected') },
    ]);

  // 역할 부여 전 확인 게이트 — 오조작(1탭 승격/강등) 방지
  const confirmApply = (u: UserAccount, r: Role) => {
    const doApply = () => apply(u, r, 'active');
    // 총괄(떠블에스바이저) 부여: 최고권한 → 2단계 확인
    if (r === 'ssvisor') {
      return RNAlert.alert(t('ua_grant_t'), fill(t('ua_grant_m'), { who: who(u) }), [
        { text: t('ua_cancel'), style: 'cancel' },
        { text: t('ua_continue'), onPress: () => RNAlert.alert(t('ua_final_t'), t('ua_final_m'), [
          { text: t('ua_cancel'), style: 'cancel' },
          { text: t('ua_grant'), style: 'destructive', onPress: doApply },
        ]) },
      ]);
    }
    // 이미 활성 유저의 역할 변경·강등: 1단계 확인(총괄 강등은 문구 강조)
    if (u.status === 'active' && u.role !== r) {
      const demoting = u.role === 'ssvisor';
      return RNAlert.alert(
        demoting ? t('ua_demote_t') : t('ua_change_t'),
        fill(t('ua_change_m'), { who: u.name, from: roleLabel(u.role), to: roleLabel(r) }),
        [
          { text: t('ua_cancel'), style: 'cancel' },
          { text: t('ua_change'), style: 'destructive', onPress: doApply },
        ],
      );
    }
    // 신규 승인 대기자의 첫 활성화: 마찰 최소화 위해 무확인
    doApply();
  };

  const pending = users.filter((u) => u.status === 'pending');
  const others = users.filter((u) => u.status !== 'pending');

  const Card = ({ u }: { u: UserAccount }) => (
    <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>
            {u.name} <Text style={[typography.small, { color: colors.textMuted }]}>@{u.username}</Text>
          </Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
            {u.phone || t('ua_no_phone')} · {roleLabel(u.role)} · {t(STATUS_KEY[u.status])}
          </Text>
        </View>
        {busy === u.uid && <Text style={[typography.small, { color: colors.primary }]}>{t('ua_busy')}</Text>}
      </View>

      {/* 역할 부여(=승인) 버튼 */}
      <View style={styles.btnRow}>
        {ASSIGNABLE.map((r) => {
          const activeNow = u.status === 'active' && u.role === r;
          return (
            <Pressable
              key={r}
              disabled={!!busy || activeNow}
              onPress={() => confirmApply(u, r)}
              accessibilityRole="button"
              accessibilityLabel={fill(t('ua_a11y_approve'), { who: u.name, role: roleLabel(r) })}
              accessibilityState={{ disabled: !!busy || activeNow, selected: activeNow }}
              style={[styles.roleBtn, { backgroundColor: colors.bg, borderColor: colors.border }, activeNow && [styles.roleBtnOn, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
            >
              <Text style={[styles.roleTxt, { color: colors.textSecondary }, activeNow && styles.roleTxtOn]}>
                {activeNow ? '✓ ' : ''}{roleLabel(r)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {u.status !== 'rejected' && (
        <Pressable disabled={!!busy} onPress={() => reject(u)} hitSlop={6} style={styles.rejectBtn}>
          <Text style={{ color: colors.emergency, ...typography.small }}>{t('ua_reject')}</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('ua_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.h, { color: colors.textSecondary }]}>{t('ua_pending')} ({pending.length})</Text>
        {pending.length === 0
          ? <Text style={[typography.caption, { color: colors.textMuted }]}>{t('ua_pending_none')}</Text>
          : pending.map((u) => <Card key={u.uid} u={u} />)}

        <Text style={[styles.h, { color: colors.textSecondary }]}>{t('ua_all')} ({others.length})</Text>
        {others.map((u) => <Card key={u.uid} u={u} />)}

        {msg ? <Text style={[typography.caption, { color: colors.emergency, marginTop: spacing.md }]}>{msg}</Text> : null}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.lg }]}>{t('ua_foot')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  h: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 8 },
  roleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: _staticColors.border, backgroundColor: _staticColors.bg },
  roleBtnOn: { backgroundColor: _staticColors.primary, borderColor: _staticColors.primary },
  roleTxt: { ...typography.captionBold, color: _staticColors.textSecondary },
  roleTxtOn: { color: '#fff' },
  rejectBtn: { alignSelf: 'flex-end', marginTop: spacing.sm, paddingHorizontal: 6, paddingVertical: 2 },
});
