import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Pill, PrimaryButton, SectionTitle, SecondaryButton, palette } from '@/components/ui';
import { useAppStore } from '@/lib/app-store';

function formatBytes(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(value / 1000)} KB`;
}

export default function BinScreen() {
  const { bin, restoreFromBin, emptyBin } = useAppStore();
  const [selected, setSelected] = useState<string[]>([]);
  const totalBytes = bin.reduce((sum, item) => sum + item.sizeBytes, 0);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function restore() {
    const ids = selected.length ? selected : bin.map((item) => item.id);
    Alert.alert('Restore from bin?', `${ids.length} item${ids.length === 1 ? '' : 's'} will return to your local results index.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => { void restoreFromBin(ids); setSelected([]); } },
    ]);
  }

  function clear() {
    Alert.alert('Empty RecoverScope bin?', 'This removes items from the app-managed bin index. It does not guarantee physical flash sanitization.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty bin', style: 'destructive', onPress: () => { void emptyBin(); setSelected([]); } },
    ]);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><Text style={styles.eyebrow}>SAFE CLEANUP</Text><Text style={styles.title}>Recycle bin</Text><Text style={styles.subtitle}>RecoverScope keeps its own reversible review queue before destructive actions.</Text></View>
    <Card style={styles.summary}><View><Text style={styles.summaryLabel}>App-managed bin</Text><Text style={styles.summaryValue}>{formatBytes(totalBytes)}</Text><Text style={styles.summaryMeta}>{bin.length} item{bin.length === 1 ? '' : 's'} awaiting review</Text></View><Text style={styles.summaryIcon}>♧</Text></Card>
    <Card style={styles.warning}><Pill tone="warning">IMPORTANT</Pill><Text style={styles.warningText}>The app bin is not the same as Android provider trash. Emptying this index cannot promise physical deletion from flash storage.</Text></Card>
    <View style={styles.actions}><PrimaryButton style={{ flex: 1 }} disabled={!bin.length} onPress={restore}>Restore {selected.length ? 'selected' : 'all'}</PrimaryButton><SecondaryButton style={{ flex: 1 }} disabled={!bin.length} onPress={clear}>Empty bin</SecondaryButton></View>
    <SectionTitle title="Items in review" subtitle="Tap an item to select it for restore." />
    {!bin.length ? <EmptyState title="Your bin is empty" message="Files you move to the RecoverScope bin will appear here before you permanently clear the app index." /> : <View style={{ gap: 10 }}>{bin.map((item) => <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.item, selected.includes(item.id) && styles.selected]}><View style={[styles.checkbox, selected.includes(item.id) && styles.checkboxSelected]}><Text style={styles.checkboxText}>{selected.includes(item.id) ? '✓' : ''}</Text></View><View style={styles.fileIcon}><Text style={styles.fileIconText}>□</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={styles.itemName} numberOfLines={1}>{item.name}</Text><Text style={styles.itemMeta}>{formatBytes(item.sizeBytes)} · {item.candidateKind}</Text></View><Pill tone="warning">BIN</Pill></Pressable>)}</View>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 40, gap: 18 },
  eyebrow: { color: palette.warning, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  title: { color: palette.text, fontSize: 29, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3A301B', borderColor: '#725A26' },
  summaryLabel: { color: '#F5D896', fontSize: 12, fontWeight: '800' },
  summaryValue: { color: palette.text, fontSize: 28, fontWeight: '900', marginTop: 3 },
  summaryMeta: { color: '#F5D896', fontSize: 12, marginTop: 3 },
  summaryIcon: { color: palette.warning, fontSize: 42 },
  warning: { gap: 10, backgroundColor: '#201C18', borderColor: '#5C4523' },
  warningText: { color: '#E9D7AB', fontSize: 12, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 18 },
  selected: { borderColor: palette.warning },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: palette.warning, borderColor: palette.warning },
  checkboxText: { color: '#251C09', fontWeight: '900' },
  fileIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: palette.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  fileIconText: { color: palette.warning, fontSize: 19 },
  itemName: { color: palette.text, fontWeight: '800', fontSize: 13 },
  itemMeta: { color: palette.muted, fontSize: 11 },
});
