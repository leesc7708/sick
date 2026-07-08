import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../auth/AuthContext';
import {
  Role, AccountStatus, UserAccount, isSsvisor, listUsers, setUserRoleStatus,
} from '../services/auth';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserAdmin'>;

const ROLE_LABEL: Record<Role, string> = {
  general: '일반', worker: '근로자', svisor: '에스바이저', ssvisor: '떠블에스바이저',
};
const STATUS_LABEL: Record<AccountStatus, string> = {
  pending: '승인대기', active: '승인됨', rejected: '거부됨',
};
// 부여 가능한 역할(일반=미승인 상태로 강등용 제외, 승격 대상만)
const ASSIGNABLE: Role[] = ['worker', 'svisor', 'ssvisor'];

export function UserAdminScreen({ navigation }: Props) {
  const { account } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [busy, setBusy] = useState<string | null>(null); // 처리 중 uid
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try { setUsers(await listUsers()); setMsg(''); }
    catch (e: any) { setMsg('목록 로드 실패: ' + (e?.message || e)); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 총괄(ssvisor)만 접근 가능
  if (!isSsvisor(account)) {
    return (
      <View style={styles.wrap}>
        <AppBar title="회원 관리" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            총괄 관리자(떠블에스바이저)만 접근할 수 있습니다.
          </Text>
        </View>
      </View>
    );
  }

  const apply = async (u: UserAccount, role: Role, status: AccountStatus, verb: string) => {
    if (u.uid === account!.uid && (role !== 'ssvisor' || status !== 'active')) {
      return RNAlert.alert('불가', '본인 계정의 총괄 권한은 해제할 수 없습니다.');
    }
    setBusy(u.uid); setMsg('');
    try {
      await setUserRoleStatus(u.uid, role, status);
      await load();
    } catch (e: any) {
      setMsg(`${verb} 실패: ` + (e?.message || e));
    } finally { setBusy(null); }
  };

  const reject = (u: UserAccount) =>
    RNAlert.alert('거부', `${u.name}(${u.username})님을 거부하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '거부', style: 'destructive', onPress: () => apply(u, 'general', 'rejected', '거부') },
    ]);

  const pending = users.filter((u) => u.status === 'pending');
  const others = users.filter((u) => u.status !== 'pending');

  const Card = ({ u }: { u: UserAccount }) => (
    <View style={[styles.card, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>
            {u.name} <Text style={[typography.small, { color: colors.textMuted }]}>@{u.username}</Text>
          </Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
            {u.phone || '연락처 없음'} · {ROLE_LABEL[u.role]} · {STATUS_LABEL[u.status]}
          </Text>
        </View>
        {busy === u.uid && <Text style={[typography.small, { color: colors.primary }]}>처리중…</Text>}
      </View>

      {/* 역할 부여(=승인) 버튼 */}
      <View style={styles.btnRow}>
        {ASSIGNABLE.map((r) => {
          const activeNow = u.status === 'active' && u.role === r;
          return (
            <Pressable
              key={r}
              disabled={!!busy || activeNow}
              onPress={() => apply(u, r, 'active', '변경')}
              style={[styles.roleBtn, activeNow && styles.roleBtnOn]}
            >
              <Text style={[styles.roleTxt, activeNow && styles.roleTxtOn]}>
                {activeNow ? '✓ ' : ''}{ROLE_LABEL[r]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {u.status !== 'rejected' && (
        <Pressable disabled={!!busy} onPress={() => reject(u)} hitSlop={6} style={styles.rejectBtn}>
          <Text style={{ color: colors.emergency, ...typography.small }}>거부</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <AppBar title="회원 승인 · 역할 관리" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h}>승인 대기 ({pending.length})</Text>
        {pending.length === 0
          ? <Text style={[typography.caption, { color: colors.textMuted }]}>대기 중인 가입자가 없습니다.</Text>
          : pending.map((u) => <Card key={u.uid} u={u} />)}

        <Text style={styles.h}>전체 회원 ({others.length})</Text>
        {others.map((u) => <Card key={u.uid} u={u} />)}

        {msg ? <Text style={[typography.caption, { color: colors.emergency, marginTop: spacing.md }]}>{msg}</Text> : null}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.lg }]}>
          ※ 역할 버튼을 누르면 해당 역할로 즉시 승인(활성)됩니다. 근로자=긴급알림·AI 사용, 에스바이저=현장그룹 관리, 떠블에스바이저=전체 관리.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  h: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 8 },
  roleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  roleBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleTxt: { ...typography.captionBold, color: colors.textSecondary },
  roleTxtOn: { color: '#fff' },
  rejectBtn: { alignSelf: 'flex-end', marginTop: spacing.sm, paddingHorizontal: 6, paddingVertical: 2 },
});
