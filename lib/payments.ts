import * as WebBrowser from 'expo-web-browser';

import { Plan } from './types';

export type PaymentRegion = 'nigeria' | 'international';

export type PaymentRequest = {
  plan: Plan;
  billing: 'monthly' | 'yearly';
  email: string;
  region: PaymentRegion;
};

const config = {
  flutterwavePublicKey: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '',
  flutterwaveCheckoutBase: process.env.EXPO_PUBLIC_FLUTTERWAVE_CHECKOUT_URL ?? '',
  stripePlusMonthly: process.env.EXPO_PUBLIC_STRIPE_PLUS_MONTHLY_LINK ?? '',
  stripePlusYearly: process.env.EXPO_PUBLIC_STRIPE_PLUS_YEARLY_LINK ?? '',
  stripeProMonthly: process.env.EXPO_PUBLIC_STRIPE_PRO_MONTHLY_LINK ?? '',
  stripeProYearly: process.env.EXPO_PUBLIC_STRIPE_PRO_YEARLY_LINK ?? '',
};

function stripeLink(plan: Plan, billing: PaymentRequest['billing']) {
  if (plan.id === 'plus' && billing === 'monthly') return config.stripePlusMonthly;
  if (plan.id === 'plus' && billing === 'yearly') return config.stripePlusYearly;
  if (plan.id === 'pro' && billing === 'monthly') return config.stripeProMonthly;
  return config.stripeProYearly;
}

export function paymentAvailability(region: PaymentRegion, plan: Plan, billing: PaymentRequest['billing']) {
  if (region === 'nigeria') return Boolean(config.flutterwaveCheckoutBase || config.flutterwavePublicKey);
  return Boolean(stripeLink(plan, billing));
}

export async function openPaymentCheckout(request: PaymentRequest) {
  const txRef = `recoverscope-${request.plan.id}-${request.billing}-${Date.now()}`;
  let url = '';

  if (request.region === 'nigeria') {
    if (!config.flutterwaveCheckoutBase) {
      throw new Error('Add EXPO_PUBLIC_FLUTTERWAVE_CHECKOUT_URL to enable Flutterwave checkout.');
    }
    const params = new URLSearchParams({
      tx_ref: txRef,
      amount: String(request.billing === 'monthly' ? request.plan.monthly : request.plan.yearly),
      currency: 'USD',
      payment_options: 'card,banktransfer,ussd',
      customer_email: request.email,
      public_key: config.flutterwavePublicKey,
      plan: request.plan.id,
      billing: request.billing,
    });
    url = `${config.flutterwaveCheckoutBase}?${params.toString()}`;
  } else {
    url = stripeLink(request.plan, request.billing);
    if (!url) throw new Error('Add the Stripe Payment Link environment variable for this plan.');
  }

  await WebBrowser.openBrowserAsync(url);
  return { txRef, provider: request.region === 'nigeria' ? 'flutterwave' : 'stripe' as const };
}

export function getPaymentSetupMessage(region: PaymentRegion) {
  return region === 'nigeria'
    ? 'Flutterwave checkout is ready when EXPO_PUBLIC_FLUTTERWAVE_CHECKOUT_URL and the public key are configured.'
    : 'Stripe checkout is ready when the plan Payment Link environment variables are configured.';
}
