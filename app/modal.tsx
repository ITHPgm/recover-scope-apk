import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, palette } from '@/components/ui';

export default function CapabilityModal() {
  return <View style={styles.screen}><View style={styles.header}><Text style={styles.title}>How RecoverScope works</Text><Pressable onPress={() => router.back()}><Text style={styles.close}>Close</Text></Pressable></View><ScrollView contentContainerStyle={styles.content}><Card style={styles.hero}><Pill tone="success">OFFLINE BY DEFAULT</Pill><Text style={styles.heroTitle}>Local investigation, honest results.</Text><Text style={styles.heroCopy}>RecoverScope reads files through Android-approved sources and keeps its index on this device.</Text></Card><Info title="What it can find">Readable media, provider trash, unindexed files in folders you grant, duplicates, large files, and basic corruption indicators.</Info><Info title="What it cannot do">It cannot bypass Android encryption, enter another app's private sandbox, or read raw internal NAND/UFS/eMMC blocks from a normal APK.</Info><Info title="Why confidence matters">A readable existing file is different from a carved fragment. Every result is labelled with its source and confidence so you can make an informed decision.</Info><Info title="Before cleanup">Review every item. The app-managed bin is reversible, but emptying it only clears the app index and cannot guarantee physical flash sanitization.</Info></ScrollView></View>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.info}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoCopy}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background, paddingTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { color: palette.text, fontSize: 20, fontWeight: '900' },
  close: { color: palette.primary, fontWeight: '800' },
  content: { padding: 20, paddingTop: 8, gap: 14 },
  hero: { backgroundColor: '#102C34', borderColor: '#216A63', gap: 10 },
  heroTitle: { color: palette.text, fontSize: 22, fontWeight: '900' },
  heroCopy: { color: '#B0DAD1', lineHeight: 20 },
  info: { gap: 5, paddingVertical: 6 },
  infoTitle: { color: palette.text, fontWeight: '900', fontSize: 15 },
  infoCopy: { color: palette.muted, lineHeight: 20, fontSize: 13 },
});
