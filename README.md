<<<<<<< HEAD
# RecoverScope

RecoverScope is a native-first Expo React Native Android app for offline storage investigation, review-first recovery assistance, duplicate analysis, and safe cleanup. It uses TypeScript for the application layer and Expo prebuild/config plugins to generate the native Android project. The project includes an optional Unity LevelPlay bridge, hosted-checkout adapters for Flutterwave and Stripe, a separate static launch homepage, and a GitHub Actions APK workflow.

> **Important product boundary:** A normal Android app cannot bypass file-based encryption, enter another app’s private sandbox, or read raw internal NAND/UFS/eMMC blocks. RecoverScope therefore focuses on readable Android-approved sources, provider trash, user-granted folders, duplicate review, and honest recovery confidence labels.

## Feature set

The current build includes more than ten user-facing capabilities: offline basic scans; premium deep scans; MediaStore authorization; Android Storage Access Framework folder authorization; visible media inventory; Downloads and document review; deleted-provider/trash candidate labels; unindexed-file candidate labels; duplicate candidate review; confidence scoring; candidate selection; restore-to-app recovery-folder support; app-managed recycle bin; reversible restore from the bin; safe empty-bin warnings; local operation history; favorites; source authorization status; battery-aware/read-only settings; Unity rewarded-ad hooks; Free/Plus/Pro plans; Flutterwave checkout adapter for Nigeria; Stripe hosted-payment-link adapter for international users; and a separate launch homepage.

## Project structure

| Path | Purpose |
|---|---|
| `app/` | Expo Router screens for Overview, Scan, Results, Bin, Premium, Settings, and the capability modal. |
| `lib/types.ts` | Domain types, sample candidates, source definitions, and pricing plans. |
| `lib/storage-service.ts` | AsyncStorage persistence, MediaLibrary scanning, SAF authorization, and app recovery-folder copy support. |
| `lib/app-store.tsx` | Shared React state and local persistence actions. |
| `lib/payments.ts` | Flutterwave and Stripe hosted-checkout adapters. |
| `lib/unity-ads.ts` | Unity LevelPlay initialization and rewarded-ad lifecycle. |
| `plugins/withUnityLevelPlay.js` | Expo config plugin for Android LevelPlay dependencies. |
| `launch-homepage.html` | Standalone product launch page. It is not required by the Android app. |
| `.github/workflows/android.yml` | GitHub Actions release APK build. |
| `app.config.ts` | Android package name, permissions, plugins, and build metadata. |
| `eas.json` | Preview APK and production AAB build profiles. |

## Run in VS Code

Install Node.js 22, Java 17, Android Studio with the Android SDK and platform tools, and VS Code. Then open the project folder in VS Code’s integrated terminal.

```bash
npm install
cp .env.example .env
npm start
```

Press `a` in the Expo terminal for a connected Android emulator or device. Expo Go can display the JavaScript UI, but Unity LevelPlay requires a native development build. For the native Android path, generate the Android folder and run it from Android Studio or the terminal:

```bash
npx expo prebuild --platform android
npx expo run:android
```

The first native build downloads Gradle dependencies and can take several minutes. A physical device must have Developer Options and USB debugging enabled. If Gradle reports `SDK location not found`, install Android Studio’s SDK Platform/Build Tools and set `ANDROID_HOME` or `ANDROID_SDK_ROOT`, then accept the licenses with `sdkmanager --licenses`. GitHub Actions uses a hosted Android build environment and does not require an SDK on your personal computer. The generated `android/` directory is build output from the Expo config and should be regenerated when native configuration changes.

## Environment configuration

Copy `.env.example` to `.env`. Only public/client-safe identifiers belong in the mobile app. Never place Flutterwave secret keys, Stripe secret keys, webhook signing secrets, or subscription entitlement secrets in `.env` or in the APK.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key. |
| `EXPO_PUBLIC_FLUTTERWAVE_CHECKOUT_URL` | Your secure backend endpoint that creates or returns a Flutterwave checkout. |
| `EXPO_PUBLIC_STRIPE_*_LINK` | Stripe hosted Payment Links for Plus and Pro monthly/yearly plans. |
| `EXPO_PUBLIC_UNITY_GAME_ID` | Unity LevelPlay app key. |
| `EXPO_PUBLIC_UNITY_REWARDED_AD_UNIT_ID` | Unity rewarded ad unit ID. |
| `EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT` | Rewarded placement name. |
| `EXPO_PUBLIC_UNITY_TEST_MODE` | Keep `true` during testing; use `false` only for a configured release. |

The current client includes a demo “activate plan” action after checkout so the UI can be tested. Production must replace that with a server-verified entitlement flow. The backend should verify Flutterwave or Stripe webhooks and return a signed or authenticated entitlement to the app.

## Payments and pricing

The default USD plans are **Free**, **Plus at $2.99/month or $19.99/year**, and **Pro at $5.99/month or $39.99/year**. Nigerian users can select Flutterwave, and international users can select Stripe. This project uses hosted checkout adapters so secret credentials do not ship in the app. Before production, configure a backend for Flutterwave transaction initialization/verification, Stripe Payment Links or Checkout Session creation, webhook verification, customer entitlement storage, cancellation, refunds, and fraud controls.

For Google Play distribution, review current Play billing requirements before publishing digital subscriptions. If the app is sold through Play, a Play-compliant billing implementation may be required instead of routing digital purchases to an external checkout. Flutterwave and Stripe remain useful for a separately distributed Android build, a web product, or regions and channels where the applicable store rules permit them.

## Unity Ads

The project includes `unity-levelplay-mediation` and a config plugin that adds the Android Google Play Services dependencies required by the bridge. Configure a Unity LevelPlay app key, rewarded ad unit ID, and placement. In Expo Go, the adapter safely reports that the native bridge is unavailable. Use `npx expo prebuild` and `npx expo run:android` or an EAS development build to test real rewarded ads.

Do not reward a user merely because a checkout screen opened. Rewarded scan credits should be granted only after the ad SDK reports the reward callback. The current app presents the adapter and fallback behavior; connect the reward callback to a persisted daily allowance before production.

## GitHub Actions and downloadable APK

Create an empty GitHub repository, then from the project directory run:

```bash
git init
git add .
git commit -m "Initial RecoverScope Android app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

In GitHub, open **Settings → Secrets and variables → Actions** and add the public configuration values listed in `.env.example`. The workflow at `.github/workflows/android.yml` runs on pushes to `main` and manual dispatch. It installs dependencies, generates `android/`, runs Gradle, and uploads `recoverscope-android-apk` as a workflow artifact. Open the workflow run, scroll to **Artifacts**, and download the APK.

For a signed production release, do not use the debug/test artifact. Configure an Android keystore through EAS or GitHub encrypted secrets, protect the signing credentials, and build an AAB with the production profile:

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile production
```

## Publishing to Google Play

Create a Play Console developer account, create an application, prepare the store listing, add privacy policy and data safety disclosures, complete content declarations, configure the application ID `com.recoverscope.app`, and upload the signed AAB to an internal testing track first. Test media permissions, Android 13+ photo/video/audio permission behavior, Android 11+ scoped storage, Android 14/15 behavior, restoration edge cases, subscription entitlement verification, Unity test ads, and offline mode. Submit the required closed/open testing release before production if Play Console requires it for the account.

The store listing must not claim that the app recovers every deleted file or reads raw phone memory. Use language such as “investigates readable storage and provider-managed trash” and explain that encrypted, discarded, or physically overwritten data may be unrecoverable.

## Optional Vercel hosting for the launch homepage

The Android app does not depend on Vercel. To host the separate homepage, create a new Vercel project whose root directory is this repository and use a static deployment. The homepage is `launch-homepage.html`; for a conventional Vercel root page, copy it to `index.html` in the Vercel-only project or set the project’s output configuration to serve that file. Do not publish mobile payment secrets or server credentials in the homepage. Vercel is not the payment verification backend unless you separately implement protected server-side endpoints.

A simple separate homepage deployment can be done with the Vercel CLI:

```bash
npm install --global vercel
vercel login
vercel --prod
```

Alternatively, import the GitHub repository in the Vercel dashboard and choose the static project settings. Keep the launch page independent from the native Android build so changes to marketing content do not alter the APK.

## Testing checklist

Test with an Android emulator and at least one physical Android 13+ device. Grant and revoke MediaStore permissions, grant and revoke SAF folders, run scans with airplane mode enabled, select and deselect candidates, move files to the app bin, restore them, empty the bin, clear the local index, test low-storage and denied-permission states, test a large media library, test corrupted or missing content URIs, confirm no source file is changed during a scan, and verify that all payment and ad actions show a safe configuration error when credentials are absent.

Before release, replace sample candidates with a production scan pipeline that obtains real file metadata, use content-provider-safe copy and restore operations, add server-side subscription verification, add a persisted rewarded-ad allowance, configure Unity privacy settings and consent flows, add a real Android native restore module where required, and obtain legal review for Play disclosures and payment routing.

## Security and privacy notes

The app’s local index can contain filenames, URIs, sizes, and timestamps. Treat it as sensitive. Avoid logging full paths or media metadata, do not upload candidate data without explicit consent, and use Android’s user-authorized Storage Access Framework and MediaStore APIs. The app-managed bin is a review queue, not a guarantee of secure flash erasure.

## References

[1]: https://developer.android.com/about/versions/11/privacy/storage "Android storage updates and scoped storage"
[2]: https://developer.android.com/training/data-storage/shared/media "Android shared media storage"
[3]: https://developer.android.com/training/data-storage/shared/documents-files "Android documents and other files"
[4]: https://docs.unity.com/en-us/grow/levelplay/sdk/react/plugin-integration "Unity LevelPlay React Native plugin integration"
[5]: https://docs.expo.dev/versions/latest/sdk/stripe/ "Expo Stripe integration guidance"
[6]: https://support.google.com/googleplay/android-developer/answer/10467955 "Google Play all files access policy"
=======
# recover-scope-apk
This is for recovering medias
>>>>>>> 936bd4fb4929fa079f8d953ef4c872b9be3a2d4c
