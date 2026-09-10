# NeuroTactix OS

NeuroTactix OS is a Vite/React web application with a Capacitor integration. The
web build is deployable to a host such as Vercel. Capacitor is the intended
Android wrapper, but the native `android/` project is not checked in yet.

## Current Android release status

The repository is not ready to submit to Google Play. The source-side
prerequisites are present (`@capacitor/android` and `capacitor.config.ts`), but
the following release blockers remain:

- Generate and review the native `android/` project with a pinned Android
  Studio/Gradle toolchain.
- Generate Android launcher, adaptive, and splash resources from the existing
  `public/icon.svg`; Play requires raster assets and store listing artwork.
- Configure a release keystore outside the repository and create a signed
  Android App Bundle (`.aab`). Never commit the keystore or passwords.
- Host the `/api/gemini/*` serverless endpoints and provide `GEMINI_API_KEY`
  server-side. A Capacitor webview cannot serve these API routes by itself.
- Publish a privacy policy URL, data-safety answers, content rating, target API
  level, and the remaining Google Play listing metadata.
- Verify the financial-risk disclosures and app behavior against current Google
  Play policies before submission.
- Configure the `Android release` GitHub Actions workflow with the repository
  variable `API_BASE_URL` and these Actions secrets:
  `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEY_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`,
  and `ANDROID_KEY_PASSWORD`.

The bundle identity is currently `com.secondchance.binaryoptionsos` and the
display name is `NeuroTactix OS`. Changing the bundle identity after publishing
would create a different Play application, so confirm it before the first
release.

## Local Android setup

Install Node.js, the project package manager, Android Studio, an Android SDK
with the required platform/build-tools versions, and Java supported by the
selected Capacitor release. Then run:

```text
bun install
bun run cap:add:android
bun run cap:android:build
bun run cap:android
```

Run `cap:add:android` only once. It creates the native project; review the
generated files and commit the Android project if native configuration is
intended to be maintained in this repository.

For a release build, open the generated project in Android Studio, configure a
local signing entry (or CI secret store), validate the API base URL and network
security settings, and build a signed `.aab`. Do not use a debug APK for Play
submission.

## Web checks

```text
bun run lint
bun run build
```

The mobile wrapper uses the same compiled web assets as the web app. It does not
turn the local Express server into an Android backend; production API hosting
must be configured separately.

The frontend uses `VITE_API_BASE_URL` for API calls. Leave the value empty for
the hosted web app when `/api` is same-origin. Set `API_BASE_URL` to the HTTPS
origin that hosts the serverless API for Android builds.
