# Android QA

`npm run qa:android` runs a quick native smoke pass against a connected emulator or device.

- It checks the active JDK, rebuilds the web bundle, installs the debug APK, clears app data, launches the app, and captures screenshots plus logcat under `output/android-qa/<timestamp>/`.
- Default smoke flow uses demo mode and denies the notification prompt so the timer flow can be validated quickly.
- `npm run qa:android:notification` runs the longer demo flow with notification permission allowed and captures notification diagnostics after backgrounding the app.

## Debug build for native console noise

`npm run build:android:debug` enables Vite sourcemaps for the Capacitor bundle so repeated `Capacitor/Console` messages can be traced back to their source during Android debugging.

## Current logging policy

- App-owned sync and subscription warnings now log only in development builds.
- If repeated `Capacitor/Console` entries still appear in production Android logs after that change, treat them as external noise first and inspect with the debug build before editing app behavior.
