import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PrimaryButton, ProgressBar, SectionTitle, SecondaryButton, palette } from '@/components/ui';
import { useAppStore } from '@/lib/app-store';
import { pickDirectory, requestMediaAuthorization, scanMediaLibrary } from '@/lib/storage-service';
import { showUnityRewarded } from '@/lib/unity-ads';

export default function ScanScreen() {
  const router = useRouter();
  const { sources, settings, markSourceAuthorized, completeScan, replaceCandidates } = useAppStore();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<'basic' | 'deep'>('basic');
  const [notice, setNotice] = useState('Read-only by default. Nothing is deleted during a scan.');
  const selected = useMemo(() => sources.filter((source) => source.authorized), [sources]);

  async function authorize(sourceId: string) {
    if (sourceId === 'media-store') {
      const granted = await requestMediaAuthorization();
      await markSourceAuthorized(sourceId, granted);
      setNotice(granted ? 'MediaStore access granted for this scan.' : 'Media permission was not granted.');
      return;
    }
    if (sourceId === 'folder' || sourceId === 'sd-card' || sourceId === 'usb' || sourceId === 'downloads') {
      const picked = await pickDirectory();
      await markSourceAuthorized(sourceId, Boolean(picked));
      setNotice(picked ? `${picked.name} was added as a user-authorized source.` : 'No folder selected.');
    }
  }

  async function startScan() {
    if (running) return;
    setRunning(true);
    setProgress(0.08);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const timer = setInterval(() => setProgress((current) => Math.min(0.92, current + 0.12)), 260);
    setTimeout(async () => {
      clearInterval(timer);
      const discovered = await scanMediaLibrary(250);
      if (discovered.length) await replaceCandidates(discovered);
      const allowed = await completeScan(mode);
      setProgress(1);
      setRunning(false);
      if (!allowed) {
        setNotice('Your free deep-scan limit is used for today. Watch a rewarded Unity Ad or upgrade for unlimited scans.');
        Alert.alert('Daily limit reached', 'Watch a rewarded ad for one extra deep scan, or open Premium.', [
          { text: 'Watch ad', onPress: async () => { const result = await showUnityRewarded('scan_limit'); setNotice(result.rewarded ? 'Reward granted. Start the deep scan again.' : result.reason ?? 'Ad unavailable.'); } },
          { text: 'Premium', onPress: () => router.push('/premium') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        setNotice(`${mode === 'deep' ? 'Deep' : 'Basic'} scan complete. Candidates are ready for review.`);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/results');
      }
    }, 2300);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><Text style={styles.eyebrow}>INVESTIGATE</Text><Text style={styles.title}>Scan your storage</Text><Text style={styles.subtitle}>The scan stays on your device and reads only the sources you authorize.</Text></View>

    <Card style={styles.notice}><Text style={styles.noticeIcon}>◌</Text><View style={{ flex: 1, gap: 3 }}><Text style={styles.noticeTitle}>Privacy-first scan</Text><Text style={styles.noticeCopy}>{notice}</Text></View></Card>

    <SectionTitle title="Choose scan depth" subtitle="Deep analysis uses more battery and is limited on Free." />
    <View style={styles.modeRow}>
      <ModeCard active={mode === 'basic'} title="Basic" detail="Fast inventory and duplicates" onPress={() => setMode('basic')} />
      <ModeCard active={mode === 'deep'} title="Deep" detail={settings.isPremium ? 'Remnants and signatures' : '3 per day on Free'} premium={!settings.isPremium} onPress={() => setMode('deep')} />
    </View>

    <View style={styles.progressBlock}><View style={styles.progressHeader}><Text style={styles.progressTitle}>{running ? 'Scanning authorized sources' : 'Ready to scan'}</Text><Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text></View><ProgressBar value={progress} /><Text style={styles.progressMeta}>{selected.length} sources selected · estimated 2–5 minutes for a complete deep scan</Text></View>

    <SectionTitle title="Authorized sources" subtitle="Tap a source to grant or revoke access." />
    <View style={{ gap: 10 }}>{sources.map((source) => <Pressable key={source.id} onPress={() => authorize(source.id)} style={({ pressed }) => [styles.sourceRow, pressed && { opacity: 0.7 }]}><View style={styles.sourceIcon}><Text style={styles.sourceIconText}>{source.type === 'media-store' ? '▧' : source.type === 'downloads' ? '↓' : source.type === 'sd-card' ? '▤' : source.type === 'usb' ? '⌁' : '⌂'}</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={styles.sourceName}>{source.name}</Text><Text style={styles.sourceDescription}>{source.description}</Text></View><Pill tone={source.authorized ? 'success' : 'neutral'}>{source.authorized ? 'READY' : 'GRANT'}</Pill></Pressable>)}</View>

    <PrimaryButton disabled={running} onPress={startScan}>{running ? 'Scanning…' : `Start ${mode} scan`}</PrimaryButton>
    {!settings.isPremium ? <Link href="/premium" asChild><SecondaryButton><Text style={{ color: palette.text, fontWeight: '700' }}>Unlock unlimited deep scans</Text></SecondaryButton></Link> : null}
  </ScrollView>;
}

function ModeCard({ active, title, detail, premium, onPress }: { active: boolean; title: string; detail: string; premium?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.modeCard, active && styles.modeCardActive]}><View style={styles.modeTop}><Text style={[styles.modeTitle, active && { color: palette.primary }]}>{title}</Text>{premium ? <Pill tone="purple">PRO</Pill> : null}</View><Text style={styles.modeDetail}>{detail}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 40, gap: 20 },
  eyebrow: { color: palette.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  title: { color: palette.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  notice: { flexDirection: 'row', gap: 12, backgroundColor: '#102C34', borderColor: '#216A63' },
  noticeIcon: { color: palette.primary, fontSize: 26 },
  noticeTitle: { color: palette.text, fontWeight: '800' },
  noticeCopy: { color: '#B0DAD1', lineHeight: 18, fontSize: 12 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: { flex: 1, padding: 14, minHeight: 92, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 18, gap: 10 },
  modeCardActive: { borderColor: palette.primary, backgroundColor: '#102C34' },
  modeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modeTitle: { color: palette.text, fontSize: 16, fontWeight: '800' },
  modeDetail: { color: palette.muted, lineHeight: 18, fontSize: 12 },
  progressBlock: { gap: 11, paddingVertical: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { color: palette.text, fontWeight: '800' },
  progressPercent: { color: palette.primary, fontWeight: '900' },
  progressMeta: { color: palette.muted, fontSize: 11 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 18, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  sourceIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  sourceIconText: { color: palette.primary, fontSize: 20 },
  sourceName: { color: palette.text, fontSize: 13, fontWeight: '800' },
  sourceDescription: { color: palette.muted, fontSize: 11 },
});
