import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, EmptyState, IconButton, Pill, PrimaryButton, SectionTitle, SecondaryButton, palette } from '@/components/ui';
import { useAppStore } from '@/lib/app-store';
import { copyToAppRecoveryFolder } from '@/lib/storage-service';
import { FileCandidate } from '@/lib/types';

const filters = ['All', 'Restorable', 'Trash', 'Duplicates', 'Documents'] as const;

function formatBytes(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} KB`;
  return `${value} B`;
}

export default function ResultsScreen() {
  const router = useRouter();
  const { candidates, toggleCandidate, toggleFavorite, moveToBin } = useAppStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const selected = candidates.filter((item) => item.selected);
  const filtered = useMemo(() => candidates.filter((item) => {
    if (filter === 'Restorable') return item.canRestore;
    if (filter === 'Trash') return item.candidateKind === 'trashed';
    if (filter === 'Duplicates') return item.isDuplicate || item.candidateKind === 'duplicate';
    if (filter === 'Documents') return item.kind === 'document' || item.kind === 'archive';
    return true;
  }), [candidates, filter]);

  async function restoreOne(item: FileCandidate) {
    try {
      if (item.uri.startsWith('content://')) {
        Alert.alert('Restore candidate ready', `${item.name} is exposed through Android's content provider. Choose a destination in the production native restore flow.`);
        return;
      }
      await copyToAppRecoveryFolder(item);
      Alert.alert('Restored', `${item.name} was copied into the app recovery folder.`);
    } catch (error) {
      Alert.alert('Restore unavailable', error instanceof Error ? error.message : 'The source could not be copied.');
    }
  }

  async function cleanupSelected() {
    if (!selected.length) return;
    Alert.alert('Move selected items to bin?', 'This is reversible from the RecoverScope bin. The original provider file is not overwritten.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move to bin', style: 'destructive', onPress: () => moveToBin(selected.map((item) => item.id)) },
    ]);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>EVIDENCE REVIEW</Text><Text style={styles.title}>Candidates</Text><Text style={styles.subtitle}>{candidates.length} local records · select before acting</Text></View><IconButton label="Refresh candidates" icon="↻" onPress={() => {}} /></View>
    <View style={styles.filterRow}>{filters.map((option) => <Pressable key={option} onPress={() => setFilter(option)} style={[styles.filter, filter === option && styles.filterActive]}><Text style={[styles.filterText, filter === option && { color: '#092018' }]}>{option}</Text></Pressable>)}</View>
    {selected.length ? <Card style={styles.actionBar}><View><Text style={styles.actionTitle}>{selected.length} selected</Text><Text style={styles.actionMeta}>Review the source before changing anything.</Text></View><Pressable onPress={cleanupSelected}><Text style={styles.actionLink}>Move to bin</Text></Pressable></Card> : null}
    <SectionTitle title={`${filtered.length} results`} subtitle="Confidence is based on readable local evidence." />
    {!filtered.length ? <EmptyState title="No matching candidates" message="Try another filter or run a scan from the Scan tab." /> : <View style={{ gap: 10 }}>{filtered.map((item) => <CandidateCard key={item.id} item={item} onToggle={() => toggleCandidate(item.id)} onFavorite={() => toggleFavorite(item.id)} onRestore={() => restoreOne(item)} />)}</View>}
    <SecondaryButton onPress={() => router.push('/premium')}><Text style={{ color: palette.text, fontWeight: '700' }}>Unlock advanced analysis</Text></SecondaryButton>
  </ScrollView>;
}

function CandidateCard({ item, onToggle, onFavorite, onRestore }: { item: FileCandidate; onToggle: () => void; onFavorite: () => void; onRestore: () => void }) {
  const tone = item.candidateKind === 'trashed' ? 'warning' : item.candidateKind === 'duplicate' ? 'purple' : item.confidence === 'confirmed' ? 'success' : 'neutral';
  return <Card style={[styles.candidate, item.selected && styles.selected]}><View style={styles.rowTop}><Pressable onPress={onToggle} style={[styles.checkbox, item.selected && styles.checkboxActive]}><Text style={styles.check}>{item.selected ? '✓' : ''}</Text></Pressable><View style={styles.fileGlyph}><Text style={styles.fileGlyphText}>{item.kind === 'image' ? '▧' : item.kind === 'video' ? '▶' : item.kind === 'audio' ? '♪' : item.kind === 'document' ? '□' : '◫'}</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={styles.meta}>{formatBytes(item.sizeBytes)} · {new Date(item.modifiedAt).toLocaleDateString()}</Text></View><Pressable onPress={onFavorite}><Text style={[styles.favorite, item.isFavorite && { color: palette.warning }]}>{item.isFavorite ? '★' : '☆'}</Text></Pressable></View><View style={styles.badgeRow}><Pill tone={tone}>{item.candidateKind}</Pill><Pill tone={item.confidence === 'confirmed' || item.confidence === 'high' ? 'success' : 'neutral'}>{item.confidence}</Pill><Text style={styles.source}>{item.sourceId}</Text></View><Text style={styles.explanation}>{explanation(item)}</Text><View style={styles.cardActions}><SecondaryButton style={{ flex: 1 }} onPress={onRestore}>Restore</SecondaryButton><PrimaryButton style={{ flex: 1 }} onPress={onToggle}>{item.selected ? 'Selected' : 'Select'}</PrimaryButton></View></Card>;
}

function explanation(item: FileCandidate) {
  if (item.candidateKind === 'trashed') return 'A storage provider reports this item as trashed. Restore it before provider expiration.';
  if (item.candidateKind === 'duplicate') return 'This content matches another readable file. Keep one copy before cleanup.';
  if (item.candidateKind === 'unindexed') return 'The bytes are readable in an authorized source but may not appear in a normal gallery index.';
  return 'Readable through an authorized Android source and ready for review.';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 40, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: palette.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  title: { color: palette.text, fontSize: 29, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 13, marginTop: 6 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  filterActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  filterText: { color: palette.muted, fontWeight: '800', fontSize: 12 },
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#102C34', borderColor: '#216A63' },
  actionTitle: { color: palette.text, fontWeight: '900' },
  actionMeta: { color: '#B0DAD1', fontSize: 11, marginTop: 4 },
  actionLink: { color: palette.primary, fontWeight: '900' },
  candidate: { gap: 12 },
  selected: { borderColor: palette.primary, backgroundColor: '#102C34' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  check: { color: '#092018', fontWeight: '900' },
  fileGlyph: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  fileGlyphText: { color: palette.primary, fontSize: 19 },
  name: { color: palette.text, fontWeight: '900', fontSize: 13 },
  meta: { color: palette.muted, fontSize: 11 },
  favorite: { color: palette.muted, fontSize: 23 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  source: { color: palette.muted, fontSize: 11, marginLeft: 'auto' },
  explanation: { color: palette.muted, lineHeight: 18, fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 9 },
});
