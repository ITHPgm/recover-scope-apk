import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, Pill, SectionTitle, palette } from '@/components/ui';
import { clearLocalIndex, useAppStore } from '@/lib/app-store';
import { UNITY_AD_CONFIG, isUnityAdsReady } from '@/lib/unity-ads';

export default function SettingsScreen() {
  const { settings, sources, refresh } = useAppStore();
  const [readOnly, setReadOnly] = useState(true);
  const [thumbnails, setThumbnails] = useState(true);
  const [batterySaver, setBatterySaver] = useState(true);

  function resetIndex() {
    Alert.alert('Clear local index?', 'This removes scan metadata, favorites, bin entries, and operation history from this device. It does not delete source files.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear index', style: 'destructive', onPress: async () => { await clearLocalIndex(); await refresh(); } },
    ]);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><Text style={styles.eyebrow}>CONTROL CENTER</Text><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Keep the app local, explainable, and safe.</Text></View>
    <Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={styles.profileTitle}>{settings.isPremium ? `${settings.planId.toUpperCase()} member` : 'Free member'}</Text><Text style={styles.profileCopy}>{settings.isPremium ? 'Ads disabled for this device.' : 'Basic offline scans are available.'}</Text></View><Pill tone={settings.isPremium ? 'success' : 'neutral'}>{settings.isPremium ? 'PREMIUM' : 'FREE'}</Pill></Card>
    <SectionTitle title="Scan behavior" subtitle="These settings apply to future scans." />
    <View style={{ gap: 10 }}><SettingRow title="Read-only by default" detail="Never modify source files during an investigation." value={readOnly} onChange={setReadOnly} /><SettingRow title="Generate thumbnails" detail="Helpful for previews and near-duplicate review." value={thumbnails} onChange={setThumbnails} /><SettingRow title="Battery-aware scans" detail="Pause deep work when power is low." value={batterySaver} onChange={setBatterySaver} /></View>
    <SectionTitle title="Authorized scopes" subtitle="Android access remains limited to sources you grant." />
    <Card style={{ gap: 11 }}>{sources.map((source) => <View key={source.id} style={styles.scopeRow}><Text style={styles.scopeName}>{source.name}</Text><Pill tone={source.authorized ? 'success' : 'neutral'}>{source.authorized ? 'AUTHORIZED' : 'NOT GRANTED'}</Pill></View>)}</Card>
    <SectionTitle title="Integrations" subtitle="Native build configuration status." />
    <Card style={{ gap: 10 }}><IntegrationRow label="Offline mode" value="Enabled" tone="success" /><IntegrationRow label="Unity Ads bridge" value={isUnityAdsReady() ? 'Ready' : 'Development build required'} tone={isUnityAdsReady() ? 'success' : 'warning'} /><IntegrationRow label="Unity app key" value={UNITY_AD_CONFIG.appKey ? 'Configured' : 'Missing env value'} tone={UNITY_AD_CONFIG.appKey ? 'success' : 'warning'} /><IntegrationRow label="Payment verification" value="Server webhook required" tone="warning" /></Card>
    <Pressable onPress={resetIndex} style={styles.dangerButton}><Text style={styles.dangerText}>Clear local index</Text></Pressable>
    <Text style={styles.footer}>RecoverScope is an offline utility. It cannot bypass Android encryption, access private app sandboxes, or guarantee physical flash sanitization.</Text>
  </ScrollView>;
}

function SettingRow({ title, detail, value, onChange }: { title: string; detail: string; value: boolean; onChange: (value: boolean) => void }) {
  return <Card style={styles.settingRow}><View style={{ flex: 1, gap: 3 }}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDetail}>{detail}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: '#27384B', true: '#2D7A61' }} thumbColor={value ? palette.primary : '#9CB1C3'} /></Card>;
}

function IntegrationRow({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' }) {
  return <View style={styles.scopeRow}><Text style={styles.scopeName}>{label}</Text><Pill tone={tone}>{value}</Pill></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 45, gap: 18 },
  eyebrow: { color: palette.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  title: { color: palette.text, fontSize: 29, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 14, marginTop: 7 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#102C34', borderColor: '#216A63' },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#092018', fontWeight: '900', fontSize: 21 },
  profileTitle: { color: palette.text, fontWeight: '900' },
  profileCopy: { color: '#B0DAD1', fontSize: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14 },
  settingTitle: { color: palette.text, fontWeight: '800', fontSize: 13 },
  settingDetail: { color: palette.muted, fontSize: 11, lineHeight: 17 },
  scopeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  scopeName: { color: palette.text, fontWeight: '700', fontSize: 12, flex: 1 },
  dangerButton: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: '#63313A', backgroundColor: '#321D27', justifyContent: 'center', alignItems: 'center' },
  dangerText: { color: palette.danger, fontWeight: '800' },
  footer: { color: '#748CA0', fontSize: 11, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
});
