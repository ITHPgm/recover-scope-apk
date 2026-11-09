import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Pill, PrimaryButton, SectionTitle, SecondaryButton, palette } from '@/components/ui';
import { useAppStore } from '@/lib/app-store';
import { getPaymentSetupMessage, openPaymentCheckout, paymentAvailability, PaymentRequest } from '@/lib/payments';
import { DEFAULT_PLANS } from '@/lib/types';

export default function PremiumScreen() {
  const { settings, activatePlan } = useAppStore();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [region, setRegion] = useState<'nigeria' | 'international'>('international');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function subscribe(planId: 'plus' | 'pro') {
    const plan = DEFAULT_PLANS.find((item) => item.id === planId);
    if (!plan) return;
    if (!email.includes('@')) {
      Alert.alert('Email required', 'Add an email address so the payment provider can identify your checkout.');
      return;
    }
    const request: PaymentRequest = { plan, billing, email, region };
    if (!paymentAvailability(region, plan, billing)) {
      Alert.alert('Payment setup needed', getPaymentSetupMessage(region));
      return;
    }
    setLoading(true);
    try {
      await openPaymentCheckout(request);
      Alert.alert('Checkout opened', 'Complete payment in the secure provider page. For this demo build, activate the plan after payment verification is connected on your backend.', [
        { text: 'Activate demo plan', onPress: () => activatePlan(planId) },
        { text: 'Later', style: 'cancel' },
      ]);
    } catch (error) {
      Alert.alert('Unable to open checkout', error instanceof Error ? error.message : 'Check your payment configuration.');
    } finally {
      setLoading(false);
    }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><Text style={styles.eyebrow}>UNLOCK MORE</Text><Text style={styles.title}>Premium access</Text><Text style={styles.subtitle}>Remove Unity Ads limits and unlock deeper offline investigation modes.</Text></View>
    {settings.isPremium ? <Card style={styles.active}><Pill tone="success">ACTIVE PLAN</Pill><Text style={styles.activeTitle}>{settings.planId.toUpperCase()} access is enabled</Text><Text style={styles.activeCopy}>You can continue scanning without the Free plan’s daily deep-scan limit.</Text></Card> : null}
    <View style={styles.billingRow}><SecondaryButton style={[styles.billingButton, billing === 'monthly' && styles.activeToggle]} onPress={() => setBilling('monthly')}>Monthly</SecondaryButton><SecondaryButton style={[styles.billingButton, billing === 'yearly' && styles.activeToggle]} onPress={() => setBilling('yearly')}>Yearly · save</SecondaryButton></View>
    <View style={styles.regionRow}><Text style={styles.regionLabel}>Checkout region</Text><View style={styles.regionOptions}><SecondaryButton style={[styles.regionButton, region === 'international' && styles.activeToggle]} onPress={() => setRegion('international')}>International · Stripe</SecondaryButton><SecondaryButton style={[styles.regionButton, region === 'nigeria' && styles.activeToggle]} onPress={() => setRegion('nigeria')}>Nigeria · Flutterwave</SecondaryButton></View></View>
    <TextInput value={email} onChangeText={setEmail} placeholder="Email for checkout" placeholderTextColor={palette.muted} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
    <SectionTitle title="Choose your plan" subtitle="Prices are in USD. Payment verification should be completed by your backend before production activation." />
    {DEFAULT_PLANS.map((plan) => <Card key={plan.id} style={[styles.plan, plan.popular && styles.popular]}><View style={styles.planHeader}><View><Text style={styles.planName}>{plan.name}</Text><Text style={styles.planPrice}>{plan.monthly === 0 ? 'Free' : `$${billing === 'monthly' ? plan.monthly.toFixed(2) : plan.yearly.toFixed(2)}`}<Text style={styles.period}>{plan.monthly === 0 ? '' : billing === 'monthly' ? '/month' : '/year'}</Text></Text></View>{plan.popular ? <Pill tone="purple">POPULAR</Pill> : null}</View><Text style={styles.planDescription}>{plan.description}</Text><View style={styles.features}>{plan.features.map((feature) => <Text key={feature} style={styles.feature}>✓ {feature}</Text>)}</View>{plan.id === 'free' ? <SecondaryButton onPress={() => activatePlan('free')}>Use Free plan</SecondaryButton> : <PrimaryButton disabled={loading} onPress={() => subscribe(plan.id as 'plus' | 'pro')}>{loading ? 'Opening checkout…' : `Choose ${plan.name}`}</PrimaryButton>}</Card>)}
    <Card style={styles.note}><Text style={styles.noteTitle}>Payment architecture</Text><Text style={styles.noteCopy}>The app contains provider adapters, but payment secrets and verification must stay on a secure server. Stripe and Flutterwave should call a webhook before a plan is activated in production.</Text></Card>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 40, gap: 16 },
  eyebrow: { color: palette.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  title: { color: palette.text, fontSize: 29, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  active: { backgroundColor: '#16372F', borderColor: '#2D7A61', gap: 9 },
  activeTitle: { color: palette.text, fontSize: 17, fontWeight: '900' },
  activeCopy: { color: '#B0DAD1', lineHeight: 19, fontSize: 12 },
  billingRow: { flexDirection: 'row', gap: 10 },
  billingButton: { flex: 1 },
  activeToggle: { borderColor: palette.primary, backgroundColor: '#102C34' },
  regionRow: { gap: 8 },
  regionLabel: { color: palette.text, fontWeight: '800', fontSize: 13 },
  regionOptions: { flexDirection: 'row', gap: 8 },
  regionButton: { flex: 1, paddingHorizontal: 8 },
  input: { height: 50, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 15, color: palette.text, paddingHorizontal: 15, fontSize: 14 },
  plan: { gap: 13 },
  popular: { borderColor: palette.purple, backgroundColor: '#17162B' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { color: palette.text, fontSize: 20, fontWeight: '900' },
  planPrice: { color: palette.primary, fontSize: 26, fontWeight: '900', marginTop: 4 },
  period: { color: palette.muted, fontSize: 12, fontWeight: '600' },
  planDescription: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  features: { gap: 7 },
  feature: { color: '#C7D3DF', fontSize: 12 },
  note: { backgroundColor: '#151C29', gap: 7 },
  noteTitle: { color: palette.text, fontWeight: '900' },
  noteCopy: { color: palette.muted, fontSize: 12, lineHeight: 19 },
});
