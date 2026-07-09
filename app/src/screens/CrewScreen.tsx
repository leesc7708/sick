import React, { useEffect, useRef, useState } from 'react';
import { Alert as RNAlert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { useAuth } from '../auth/AuthContext';
import {
  Crew, Membership, Alert as CrewAlert, createCrew, closeCrew, findWorkerByUsername,
  addWorker, removeWorker, watchMyCrews, watchMembers, watchMyAlerts, ackAlert,
  UnfitReport, watchUnfitReports, ackUnfitReport,
} from '../services/crew';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Crew'>;

// 간단 경고음 (Web Audio)
function beep() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
    g.gain.value = 0.15; o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 500);
    if ((navigator as any).vibrate) (navigator as any).vibrate([200, 100, 200]);
  } catch {}
}

export function CrewScreen({ navigation }: Props) {
  const colors = useTheme();
  const { account } = useAuth();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [sel, setSel] = useState<Crew | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [alerts, setAlerts] = useState<CrewAlert[]>([]);
  const [unfit, setUnfit] = useState<UnfitReport[]>([]);
  const [label, setLabel] = useState('');
  const [endTime, setEndTime] = useState('');
  const [uname, setUname] = useState('');
  const [msg, setMsg] = useState('');
  const prevAlertCount = useRef(0);

  useEffect(() => {
    if (!account) return;
    const un = watchMyCrews(account.uid, setCrews);
    const ua = watchMyAlerts(account.uid, (a) => {
      if (a.filter((x) => x.status === 'new').length > prevAlertCount.current) beep();
      prevAlertCount.current = a.filter((x) => x.status === 'new').length;
      setAlerts(a);
    });
    const uu = watchUnfitReports(account.uid, setUnfit);
    return () => { un(); ua(); uu(); };
  }, [account]);

  useEffect(() => {
    if (!sel) { setMembers([]); return; }
    const u = watchMembers(sel.id, sel.ownerUid, setMembers);
    return u;
  }, [sel]);

  if (!account) return null;

  const make = async () => {
    if (!label.trim()) return setMsg('작업 그룹 이름을 입력하세요.');
    setMsg('');
    try { await createCrew(account, label.trim(), endTime.trim()); setLabel(''); setEndTime(''); }
    catch (e: any) { setMsg('생성 실패: ' + (e?.message || e)); }
  };
  const add = async () => {
    if (!sel || !uname.trim()) return;
    setMsg('');
    try {
      const w = await findWorkerByUsername(uname);
      if (!w) return setMsg('해당 아이디의 워커를 찾을 수 없습니다.');
      await addWorker(sel, w);
      setUname('');
    } catch (e: any) { setMsg('추가 실패: ' + (e?.message || e)); }
  };
  const ack = (a: CrewAlert) => ackAlert(a.id, account.uid);

  const newAlerts = alerts.filter((a) => a.status === 'new');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title="현장 그룹 · 긴급 관리" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 긴급 알림 (최상단) */}
        {newAlerts.length > 0 && (
          <View style={[styles.emCard, { backgroundColor: colors.emergency }]}>
            <Text style={[typography.h3, { color: '#fff' }]}>🔴 긴급 {newAlerts.length}건</Text>
            {newAlerts.map((a) => (
              <View key={a.id} style={styles.emRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: '#fff' }]}>{a.workerName} · {a.label || ''}</Text>
                  {a.lat != null && <Text style={[typography.small, { color: '#ffe' }]}>위치 {a.lat.toFixed(4)}, {a.lng?.toFixed(4)}</Text>}
                </View>
                {a.lat != null && (
                  <Pressable onPress={() => (window as any).open?.(`https://map.kakao.com/?q=${a.lat},${a.lng}`)}><Text style={styles.mapBtn}>🗺️</Text></Pressable>
                )}
                <Pressable onPress={() => ack(a)} style={styles.ackBtn}><Text style={styles.ackTxt}>확인</Text></Pressable>
              </View>
            ))}
          </View>
        )}

        {/* 작업 부적합 보고 (워커의 작업 전 건강체크 unfit) */}
        {unfit.filter((u) => u.status === 'new').length > 0 && (
          <View style={[styles.unfitCard, { backgroundColor: colors.warningLight, borderColor: colors.work }]}>
            <Text style={[typography.h3, { color: colors.workDark }]}>⚠ 작업 부적합 보고 {unfit.filter((u) => u.status === 'new').length}건</Text>
            {unfit.filter((u) => u.status === 'new').map((u) => (
              <View key={u.id} style={[styles.unfitRow, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{u.workerName} · {u.workType}</Text>
                  <Text style={[typography.small, { color: colors.textMuted }]}>작업 전 건강체크 부적합 — 작업 보류 권고됨</Text>
                </View>
                <Pressable onPress={() => ackUnfitReport(u.id, account.uid)} style={[styles.ackBtn2, { backgroundColor: colors.work }]}><Text style={styles.ackTxt2}>확인</Text></Pressable>
              </View>
            ))}
          </View>
        )}

        {/* 오늘 그룹 만들기 */}
        <Text style={[styles.h, { color: colors.textSecondary }]}>오늘 그룹 만들기</Text>
        <TextInput value={label} onChangeText={setLabel} placeholder="작업 그룹 이름 (예: A현장 3층 배관)" placeholderTextColor={colors.textMuted} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
        <TextInput value={endTime} onChangeText={setEndTime} placeholder="작업 종료 예정 시각 (예: 오늘 22:00 / 내일 06:00)" placeholderTextColor={colors.textMuted} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
        <View style={{ marginTop: spacing.sm }}><PrimaryButton title="그룹 만들기" icon="＋" onPress={make} /></View>

        {/* 오늘 내 그룹 */}
        <Text style={[styles.h, { color: colors.textSecondary }]}>오늘 내 그룹 ({crews.length})</Text>
        {crews.length === 0 && <Text style={[typography.caption, { color: colors.textMuted }]}>아직 없음</Text>}
        {crews.map((c) => (
          <Pressable key={c.id} onPress={() => setSel(c)} style={[styles.crewCard, shadow.card, { backgroundColor: colors.card }, sel?.id === c.id && { borderColor: colors.primary, borderWidth: 1.5 }]}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{c.label}</Text>
            <Text style={[typography.small, { color: colors.textMuted }]}>{c.workDate}{c.endTime ? ` · 종료예정 ${c.endTime}` : ''}</Text>
          </Pressable>
        ))}

        {/* 선택 그룹: 워커 추가/명단 */}
        {sel && (
          <>
            <Text style={[styles.h, { color: colors.textSecondary }]}>[{sel.label}] 워커 추가</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput value={uname} onChangeText={setUname} placeholder="워커 아이디" placeholderTextColor={colors.textMuted} autoCapitalize="none" style={[styles.input, { flex: 1, marginTop: 0, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
              <View style={{ width: 8 }} />
              <PrimaryButton title="추가" size="sm" onPress={add} style={{ width: 80 }} />
            </View>
            <Text style={[styles.h, { fontSize: 14, color: colors.textSecondary }]}>멤버 {members.length}명</Text>
            {members.map((m) => (
              <View key={m.workerUid} style={[styles.memberRow, shadow.card, { backgroundColor: colors.card }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{m.name}</Text>
                  {m.phone ? <Text style={[typography.small, { color: colors.textMuted }]}>{m.phone}</Text> : null}
                </View>
                <Pressable onPress={() => removeWorker(m.workerUid)} hitSlop={8}><Text style={{ color: colors.emergency, fontSize: 13 }}>제외</Text></Pressable>
              </View>
            ))}
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title="작업 종료 (그룹 닫기)" variant="outline" size="sm" onPress={() => { closeCrew(sel.id); setSel(null); }} />
            </View>
          </>
        )}

        {msg ? <Text style={[typography.caption, { color: colors.emergency, marginTop: spacing.md }]}>{msg}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  h: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { backgroundColor: _staticColors.card, borderWidth: 1, borderColor: _staticColors.border, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, ...typography.body, color: _staticColors.text },
  crewCard: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderColor: 'transparent', borderWidth: 1.5 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  emCard: { backgroundColor: _staticColors.emergency, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md },
  unfitCard: { backgroundColor: _staticColors.warningLight, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: _staticColors.work },
  unfitRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: spacing.sm },
  ackBtn2: { backgroundColor: _staticColors.work, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 },
  ackTxt2: { ...typography.captionBold, color: '#fff' },
  emRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: spacing.sm },
  ackBtn: { backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 },
  ackTxt: { ...typography.captionBold, color: _staticColors.emergency },
  mapBtn: { fontSize: 22, marginLeft: 6 },
});
