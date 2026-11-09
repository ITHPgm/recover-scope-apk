import { Link, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PrimaryButton, SectionTitle, palette } from '@/components/ui';
import { useAppStore } from '@/lib/app-store';
import { FileCandidate } from '@/lib/types';

function formatBytes(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} KB`;
  return `${value} B`;
}

const toneFor = (item: FileCandidate) => item.candidateKind === 'trashed' ? 'warning' : item.candidateKind === 'duplicate' ? 'purple' : item.confidence === 'confirmed' ? 'success' : 'neutral';

export default function OverviewScreen() {
  const router = useRouter();
  const { candidates, bin, sources, settings, ready } = useAppStore();
  const reclaimable = useMemo(() => candidates.filter((item) => item.isDuplicate || item.candidateKind === 'duplicate').reduce((total, item) => total + item.sizeBytes, 0), [candidates]);
  const recoverable = candidates.filter((item) => item.canRestore).length;
  const authorized = sources.filter((source) => source.authorized).length;
  const recent = candidates.slice(0, 3);

  if (!ready) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>OFFLINE STORAGE INTELLIGENCE</Text>
          <Text style={styles.title}>RecoverScope</Text>
          <Text style={styles.subtitle}>Find what is still recoverable.</Text>
        </View>
        <View style={styles.statusDot}><Text style={styles.statusText}>LOCAL</Text></View>
      </View>

      <Card style={styles.hero}>
        <View style={styles.heroTop}><View><Text style={styles.heroLabel}>Storage health</Text><Text style={styles.heroValue}>{formatBytes(reclaimable)} reclaimable</Text></View><Text style={styles.heroMark}>◉</Text></View>
        <Text style={styles.heroCopy}>Your index knows {candidates.length} candidates across {authorized} authorized sources. No cloud upload. No hidden network scan.</Text>
        <View style={styles.heroButtons}><PrimaryButton onPress={() => router.push('/scan')} style={{ flex: 1 }}>Start scan</PrimaryButton><Link href="/modal" asChild><PrimaryButton style={styles.infoButton}>i</PrimaryButton></Link></View>
      </Card>

      <View style={styles.metricsRow}>
        <Metric value={String(recoverable)} label="Recoverable" accent={palette.primary} />
        <Metric value={String(bin.length)} label="In your bin" accent={palette.warning} />
        <Metric value={formatBytes(reclaimable)} label="Can reclaim" accent={palette.purple} />
      </View>

      <SectionTitle title="Investigation areas" subtitle="Each area uses only the access you authorize." />
      <View style={styles.grid}>
        <AreaCard icon="▧" title="Media library" detail="Images, videos, audio" color={palette.primary} onPress={() => router.push('/scan')} />
        <AreaCard icon="⌂" title="Downloads" detail="Documents and archives" color={palette.purple} onPress={() => router.push('/scan')} />
        <AreaCard icon="♧" title="Recycle bin" detail={`${bin.length} app-managed items`} color={palette.warning} onPress={() => router.push('/bin')} />
        <AreaCard icon="✦" title="Deep analysis" detail={settings.isPremium ? 'Unlocked' : 'Premium feature'} color={palette.danger} onPress={() => router.push('/premium')} />
      </View>

      <View style={styles.sectionRow}><SectionTitle title="Latest candidates" subtitle="Review before restore or cleanup." /><Link href="/results"><Text style={styles.link}>View all</Text></Link></View>
      <View style={{ gap: 10 }}>{recent.map((item) => <CandidateMini key={item.id} item={item} tone={toneFor(item)} />)}</View>

      {!settings.isPremium ? <Card style={styles.adCard}><View style={styles.adLabel}><Pill tone="neutral">UNITY ADS</Pill><Text style={styles.adTitle}>Keep basic scans free</Text></View><Text style={styles.adCopy}>Watch a rewarded ad to unlock one extra deep scan, or upgrade to remove ads and lift limits.</Text><Link href="/premium" asChild><Text style={styles.adLink}>See premium plans →</Text></Link></Card> : null}
    </ScrollView>
  );
}

function Metric({ value, label, accent }: { value: string; label: string; accent: string }) {
  return <Card style={styles.metric}><Text style={[styles.metricValue, { color: accent }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>;
}

function AreaCard({ icon, title, detail, color, onPress }: { icon: string; title: string; detail: string; color: string; onPress: () => void }) {
  return <View style={styles.areaWrap}><Text style={[styles.areaIcon, { color }]}>{icon}</Text><Text style={styles.areaTitle}>{title}</Text><Text style={styles.areaDetail}>{detail}</Text></View>;
}

function CandidateMini({ item, tone }: { item: FileCandidate; tone: 'neutral' | 'success' | 'warning' | 'danger' | 'purple' }) {
  return <Card style={styles.candidateMini}><View style={styles.fileIcon}><Text style={styles.fileIconText}>{item.kind === 'image' ? '▧' : item.kind === 'video' ? '▶' : item.kind === 'audio' ? '♪' : '□'}</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={styles.itemName} numberOfLines={1}>{item.name}</Text><Text style={styles.itemMeta}>{formatBytes(item.sizeBytes)} · {item.confidence}</Text></View><Pill tone={tone}>{item.candidateKind}</Pill></Card>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 40, gap: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: palette.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 7 },
  title: { color: palette.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: palette.muted, marginTop: 5, fontSize: 14 },
  statusDot: { backgroundColor: '#16372F', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { color: palette.primary, fontSize: 10, fontWeight: '900' },
  hero: { backgroundColor: '#102C34', borderColor: '#216A63', gap: 14 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: '#B0DAD1', fontSize: 13, fontWeight: '700' },
  heroValue: { color: palette.text, fontSize: 25, fontWeight: '900', marginTop: 4 },
  heroMark: { color: palette.primary, fontSize: 38 },
  heroCopy: { color: '#B0DAD1', lineHeight: 20, fontSize: 13 },
  heroButtons: { flexDirection: 'row', gap: 10 },
  infoButton: { width: 48, backgroundColor: '#1C5960' },
  metricsRow: { flexDirection: 'row', gap: 9 },
  metric: { flex: 1, padding: 13, minHeight: 80, justifyContent: 'center' },
  metricValue: { fontSize: 20, fontWeight: '900' },
  metricLabel: { color: palette.muted, fontSize: 11, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  areaWrap: { width: '48%', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 20, padding: 15, minHeight: 116 },
  areaIcon: { fontSize: 24, marginBottom: 13 },
  areaTitle: { color: palette.text, fontSize: 14, fontWeight: '800' },
  areaDetail: { color: palette.muted, fontSize: 12, marginTop: 5, lineHeight: 17 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  link: { color: palette.primary, fontWeight: '800', fontSize: 13, marginBottom: 12 },
  candidateMini: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  fileIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  fileIconText: { color: palette.primary, fontSize: 20 },
  itemName: { color: palette.text, fontWeight: '800', fontSize: 13 },
  itemMeta: { color: palette.muted, fontSize: 11 },
  adCard: { backgroundColor: '#171E31', borderColor: '#3A3B60', gap: 9 },
  adLabel: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  adTitle: { color: palette.text, fontWeight: '800' },
  adCopy: { color: palette.muted, lineHeight: 19, fontSize: 12 },
  adLink: { color: palette.purple, fontWeight: '800', marginTop: 2 },
});
