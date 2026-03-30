# Android QA

`npm run qa:android` runs a quick native smoke pass against a connected emulator or device.

- It checks the active JDK, rebuilds the web bundle, installs the debug APK, clears app data, launches the app, and captures screenshots plus logcat under `output/android-qa/<timestamp>/`.
- Default smoke flow uses demo mode, denies the notification prompt, and validates pause, resume, reset confirm/cancel, panel back-close, and idle exit confirmation.
- `npm run qa:android:notification` runs the longer demo flow with notification permission allowed and captures notification diagnostics after backgrounding the app.
- `npm run qa:android:release` runs the same smoke flow against the signed release build.
- `npm run qa:android:release:notification` runs the release build notification pass and captures notification diagnostics after backgrounding the app.

## Release submission artifacts

- `npm run bundle:android` rebuilds the Capacitor web assets and produces the signed AAB at `android/app/build/outputs/bundle/release/app-release.aab`.
- Run `npm run qa:android:release` before submitting that bundle so the screenshots and `summary.txt` reflect the release variant.

## Debug build for native console noise

`npm run build:android:debug` enables Vite sourcemaps for the Capacitor bundle so repeated `Capacitor/Console` messages can be traced back to their source during Android debugging.

## Current logging policy

- App-owned sync and subscription warnings now log only in development builds.
- If repeated `Capacitor/Console` entries still appear in production Android logs after that change, treat them as external noise first and inspect with the debug build before editing app behavior.

## Manual Play Console steps

- Production-track eligibility and Play Console form completion still require an authenticated developer account and must be finished in the browser.
- Before same-day submission, confirm the store listing, app access, data safety, content rating, financial features, ads, and privacy policy URL sections all show complete in Play Console.
