import { LevelPlay, LevelPlayInitRequest, LevelPlayRewardedAd } from 'unity-levelplay-mediation';

export type AdPlacement = 'scan_limit' | 'restore_queue' | 'cleanup_complete';

export const UNITY_AD_CONFIG = {
  appKey: process.env.EXPO_PUBLIC_UNITY_GAME_ID ?? '',
  rewardedAdUnitId: process.env.EXPO_PUBLIC_UNITY_REWARDED_AD_UNIT_ID ?? '',
  rewardedPlacement: process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT ?? 'Rewarded_Android',
  testMode: process.env.EXPO_PUBLIC_UNITY_TEST_MODE !== 'false',
};

let initialized = false;
let rewardedAd: LevelPlayRewardedAd | null = null;

export function isUnityAdsReady() {
  return initialized && Boolean(rewardedAd);
}

export async function initializeUnityAds() {
  if (!UNITY_AD_CONFIG.appKey || !UNITY_AD_CONFIG.rewardedAdUnitId) {
    return { ready: false, reason: 'Unity app key or rewarded ad unit ID is missing.' };
  }
  try {
    const request = LevelPlayInitRequest.builder(UNITY_AD_CONFIG.appKey).withUserId(`local-${Date.now()}`).build();
    await LevelPlay.init(request, {
      onInitFailed: () => { initialized = false; },
      onInitSuccess: () => { initialized = true; },
    });
    rewardedAd = new LevelPlayRewardedAd(UNITY_AD_CONFIG.rewardedAdUnitId);
    return { ready: initialized };
  } catch {
    initialized = false;
    return { ready: false, reason: 'Unity LevelPlay native initialization failed.' };
  }
}

export async function showUnityRewarded(placement: AdPlacement) {
  if (!rewardedAd) {
    return { rewarded: false, reason: 'Build the Android development client and configure Unity Ads first.' };
  }
  return new Promise<{ rewarded: boolean; reason?: string }>(async (resolve) => {
    let resolved = false;
    const finish = (value: { rewarded: boolean; reason?: string }) => { if (!resolved) { resolved = true; resolve(value); } };
    rewardedAd?.setListener({
      onAdLoaded: () => undefined,
      onAdLoadFailed: () => finish({ rewarded: false, reason: 'Unity rewarded ad failed to load.' }),
      onAdInfoChanged: () => undefined,
      onAdDisplayed: () => undefined,
      onAdDisplayFailed: () => finish({ rewarded: false, reason: 'Unity rewarded ad failed to display.' }),
      onAdClicked: () => undefined,
      onAdClosed: () => finish({ rewarded: false, reason: 'Ad closed before reward was confirmed.' }),
      onAdRewarded: () => finish({ rewarded: true }),
    });
    try {
      await rewardedAd?.loadAd();
      if (await rewardedAd?.isAdReady()) await rewardedAd?.showAd(UNITY_AD_CONFIG.rewardedPlacement || placement);
      else finish({ rewarded: false, reason: 'No rewarded ad is ready.' });
    } catch {
      finish({ rewarded: false, reason: 'Unity rewarded ad is unavailable.' });
    }
  });
}

export async function showUnityInterstitial() {
  return { shown: false, reason: 'Interstitial is intentionally disabled until a native placement is configured.' };
}
