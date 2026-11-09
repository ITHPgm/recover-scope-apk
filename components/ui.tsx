import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';

export const palette = {
  background: '#08111F',
  surface: '#101D2F',
  surfaceRaised: '#15263B',
  primary: '#7BE7C4',
  primaryStrong: '#35C89B',
  text: '#F3F7FA',
  muted: '#9CB1C3',
  border: '#243B52',
  warning: '#F5C76B',
  danger: '#F47C7C',
  success: '#7BE7C4',
  purple: '#B8A5FF',
};

export function Card({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]}>{children}</View>;
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'purple' }) {
  const colors = {
    neutral: { bg: '#1A2A3D', fg: palette.muted },
    success: { bg: '#16372F', fg: palette.success },
    warning: { bg: '#3A301B', fg: palette.warning },
    danger: { bg: '#3D2028', fg: palette.danger },
    purple: { bg: '#2C244B', fg: palette.purple },
  }[tone];
  return <View style={[styles.pill, { backgroundColor: colors.bg }]}><Text style={[styles.pillText, { color: colors.fg }]}>{children}</Text></View>;
}

type ActionButtonProps = Omit<PressableProps, 'style'> & { children: React.ReactNode; style?: StyleProp<ViewStyle> };

export function PrimaryButton({ children, style, ...props }: ActionButtonProps) {
  return <Pressable {...props} style={({ pressed }) => [styles.primaryButton, style, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{children}</Text></Pressable>;
}

export function SecondaryButton({ children, style, ...props }: ActionButtonProps) {
  return <Pressable {...props} style={({ pressed }) => [styles.secondaryButton, style, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{children}</Text></Pressable>;
}

export function IconButton({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Text style={styles.iconText}>{icon}</Text></Pressable>;
}

export function ProgressBar({ value }: { value: number }) {
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value * 100))}%` }]} /></View>;
}

export function LoadingState({ label = 'Loading local index…' }: { label?: string }) {
  return <View style={styles.loading}><ActivityIndicator color={palette.primary} /><Text style={styles.muted}>{label}</Text></View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionHeading}>{title}</Text>{subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}</View>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyMessage}>{message}</Text>{action}</View>;
}

export const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 22, padding: 16 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  primaryButton: { minHeight: 48, paddingHorizontal: 18, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#092018', fontSize: 15, fontWeight: '800' },
  secondaryButton: { minHeight: 46, paddingHorizontal: 16, borderRadius: 15, backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: palette.text, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.surfaceRaised, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 18, color: palette.text },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: '#1D3045', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 8, backgroundColor: palette.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  sectionTitle: { gap: 4, marginBottom: 12 },
  sectionHeading: { color: palette.text, fontSize: 18, fontWeight: '800' },
  empty: { alignItems: 'center', paddingHorizontal: 26, paddingVertical: 44, gap: 9 },
  emptyIcon: { color: palette.primary, fontSize: 42 },
  emptyTitle: { color: palette.text, fontSize: 19, fontWeight: '800' },
  emptyMessage: { color: palette.muted, textAlign: 'center', lineHeight: 20 },
});
