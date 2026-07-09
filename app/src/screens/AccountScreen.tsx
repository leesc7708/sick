import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { useAuth } from '../auth/AuthContext';
import { logout, Role, AccountStatus } from '../services/auth';
import { getMyMembership, Membership } from '../services/crew';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

// 화면 문구 (self-contained 다국어)
const L: Record<string, Record<Lang, string>> = {
  title: { ko: '내 계정', en: 'My Account', zh: '我的账户', ja: 'マイアカウント', vi: 'Tài khoản', th: 'บัญชีของฉัน', es: 'Mi cuenta' },
  id: { ko: '아이디', en: 'ID', zh: '账号', ja: 'ID', vi: 'Tài khoản', th: 'ไอดี', es: 'Usuario' },
  role: { ko: '역할', en: 'Role', zh: '角色', ja: '役割', vi: 'Vai trò', th: 'บทบาท', es: 'Rol' },
  status: { ko: '상태', en: 'Status', zh: '状态', ja: '状態', vi: 'Trạng thái', th: 'สถานะ', es: 'Estado' },
  site: { ko: '오늘 소속 현장', en: "Today's site", zh: '今日现场', ja: '本日の現場', vi: 'Công trường hôm nay', th: 'หน้างานวันนี้', es: 'Obra de hoy' },
  noSite: { ko: '배정된 현장이 없어요', en: 'No site assigned', zh: '暂无分配现场', ja: '割当現場なし', vi: 'Chưa được phân công', th: 'ยังไม่มีหน้างาน', es: 'Sin obra asignada' },
  logout: { ko: '로그아웃', en: 'Log out', zh: '退出登录', ja: 'ログアウト', vi: 'Đăng xuất', th: 'ออกจากระบบ', es: 'Cerrar sesión' },
  pending: { ko: '관리자 승인 후 긴급 알림 등 현장 기능을 쓸 수 있어요.', en: 'After manager approval, you can use on-site features like emergency alerts.', zh: '经管理员批准后，可使用紧急报警等现场功能。', ja: '管理者の承認後、緊急通報など現場機能が使えます。', vi: 'Sau khi quản lý duyệt, bạn có thể dùng các chức năng tại hiện trường như báo động khẩn.', th: 'หลังผู้จัดการอนุมัติ จะใช้ฟังก์ชันหน้างาน เช่น แจ้งเหตุฉุกเฉินได้', es: 'Tras la aprobación del gestor, podrá usar funciones de obra como alertas de emergencia.' },
};
const tr = (k: string, lang: Lang) => L[k][lang] || L[k].ko;

const ROLE: Record<Role, Record<Lang, string>> = {
  general: { ko: '일반(미승인)', en: 'General (pending)', zh: '普通(待批)', ja: '一般(未承認)', vi: 'Thường (chờ duyệt)', th: 'ทั่วไป (รออนุมัติ)', es: 'General (pendiente)' },
  worker: { ko: '근로자', en: 'Worker', zh: '劳动者', ja: '労働者', vi: 'Công nhân', th: 'คนงาน', es: 'Trabajador' },
  svisor: { ko: '현장 관리자', en: 'Site manager', zh: '现场管理者', ja: '現場管理者', vi: 'Quản lý hiện trường', th: 'ผู้จัดการหน้างาน', es: 'Jefe de obra' },
  ssvisor: { ko: '총괄 관리자', en: 'General manager', zh: '总管', ja: '総括管理者', vi: 'Tổng quản lý', th: 'ผู้จัดการรวม', es: 'Gerente general' },
};
const STATUS: Record<AccountStatus, { label: Record<Lang, string>; color: string }> = {
  active: { color: colors.success, label: { ko: '승인됨', en: 'Approved', zh: '已批准', ja: '承認済み', vi: 'Đã duyệt', th: 'อนุมัติแล้ว', es: 'Aprobado' } },
  pending: { color: colors.warning, label: { ko: '승인 대기', en: 'Pending', zh: '待批准', ja: '承認待ち', vi: 'Chờ duyệt', th: 'รออนุมัติ', es: 'Pendiente' } },
  rejected: { color: colors.emergency, label: { ko: '거부됨', en: 'Rejected', zh: '已拒绝', ja: '拒否', vi: 'Bị từ chối', th: 'ถูกปฏิเสธ', es: 'Rechazado' } },
};

export function AccountScreen({ navigation }: Props) {
  const { account } = useAuth();
  const { lang } = useLang();
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    let alive = true;
    if (account && account.role === 'worker') {
      getMyMembership(account.uid).then((m) => { if (alive) setMembership(m); }).catch(() => {});
    }
    return () => { alive = false; };
  }, [account]);

  if (!account) {
    return (
      <View style={styles.wrap}>
        <AppBar title={tr('title', lang)} onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const st = STATUS[account.status];

  return (
    <View style={styles.wrap}>
      <AppBar title={tr('title', lang)} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 이름 + 역할/상태 배지 */}
        <View style={[styles.card, shadow.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}><Icon name="user" size={24} color={colors.primary} /></View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[typography.h3, { color: colors.text }]}>{account.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{tr('id', lang)}: {account.username}</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.g100 }]}>
              <Text style={[styles.badgeTxt, { color: colors.textSecondary }]}>{tr('role', lang)}: {ROLE[account.role][lang]}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: st.color }]}>
              <Text style={[styles.badgeTxt, { color: '#fff' }]}>{st.label[lang]}</Text>
            </View>
          </View>
        </View>

        {/* 미승인 안내 배너 */}
        {account.status === 'pending' && (
          <View style={styles.pendingBanner}>
            <Icon name="user" size={16} color={colors.warning} />
            <Text style={[typography.small, { color: colors.text, marginLeft: 8, flex: 1 }]}>{tr('pending', lang)}</Text>
          </View>
        )}

        {/* 소속 현장(근로자) */}
        {account.role === 'worker' && (
          <View style={[styles.card, shadow.card]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>{tr('site', lang)}</Text>
            {membership ? (
              <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{membership.label} · {membership.ownerName}</Text>
            ) : (
              <Text style={[typography.body, { color: colors.textMuted, marginTop: 4 }]}>{tr('noSite', lang)}</Text>
            )}
          </View>
        )}

        <PrimaryButton title={tr('logout', lang)} variant="outline" onPress={() => logout()} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.g100, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', marginTop: spacing.md, gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  badgeTxt: { ...typography.captionBold },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFAEC',
    borderRadius: radius.md, borderLeftWidth: 4, borderLeftColor: colors.warning,
    padding: spacing.md, marginTop: spacing.sm,
  },
});
