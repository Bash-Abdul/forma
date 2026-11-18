# Testing Forma on an iPhone

Forma targets **Expo SDK 58**, matching the SDK 58 Expo Go client reported on the test iPhone (Expo Go 58.0.5, iOS 26.6.2). The project previously targeted SDK 55. An Expo Go client and project must use matching SDK versions; see [Expo’s compatibility guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

## Start a fresh development session

1. Stop any running Forma development server with **Ctrl+C** in its terminal. A server started before the SDK update can still be serving old code.
2. Use Node.js 24.3 or newer on the Node 24 release line (Node 22.13+ on the Node 22 line is also supported).
3. In the Forma project directory, run:

   ```sh
   npm install
   npm run start:go
   ```

4. Close and reopen Expo Go on the iPhone, then scan the **new** QR code from that terminal. `start:go` runs `expo start --go --clear` so it explicitly targets Expo Go and clears Metro’s transform cache.
5. If Expo Go requests login, sign in to the same Expo account in Expo Go and Expo CLI (`npx expo login`). See [Expo’s iOS login requirement](https://expo.dev/changelog/expo-go-57-login).

The computer and phone must be able to reach one another over the network. Use the same Wi-Fi network for the default LAN connection; allow Expo Go local-network access if iOS asks.

## WSL2 or a phone that cannot reach the QR address

The investigated development server advertised `exp://172.21.235.156:8081` from WSL2. That is an internal development-environment address and is not normally reachable directly from an iPhone on the Windows host’s Wi-Fi network.

Stop the old server with **Ctrl+C**, then run:

```sh
npx expo login
npm run start:go:tunnel
```

Sign in to **the same Expo account** in the Expo Go app on the iPhone. Keep the terminal running and scan its new tunnel QR code. Do not reuse the old `172.21…` QR code. The tunnel command does not clear the bundle cache on every start, avoiding an unnecessary full rebuild.

The tunnel test initially failed with: `Couldn't create a signed tunnel URL for this project. You're not logged in to your Expo account — run 'npx expo login'.` Signing in requires the developer’s interaction; do not put credentials in source files or share passwords in chat.

The iOS manifest and JavaScript bundle were successfully served locally on SDK 58. That verifies the local server but does not establish that the phone can reach its private IP. Expo recommends [tunnel mode for network connection problems](https://docs.expo.dev/get-started/start-developing/).

A GitHub repository URL is not the running development-server address. For this workflow, open Forma using the QR code from the active Expo terminal session.

## If Expo Go still closes completely

Record whether the terminal reaches **iOS Bundled**, whether any Forma screen appears, and the exact time of the crash. Capture any error printed in the Metro terminal. A complete native app exit may require the iPhone’s Expo Go crash report; JavaScript bundle compilation and browser checks cannot establish that a physical-device crash is fixed.

Do not delete Expo Go or clear Forma’s app storage as a first troubleshooting step. Routines, workouts, weights and preferences are stored locally. This SDK update does not change the `forma:v1` storage key or the application’s data schema.

## Project checks

```sh
npx expo install --check
npx expo-doctor@latest
npm run typecheck
npm run lint
npm test
```

Expo Doctor checks for duplicate native modules as well as SDK compatibility. Keep `expo-font` and the Router native support packages aligned with the installed Expo SDK; an earlier installation contained both SDK 55 and SDK 58 copies of `expo-font`.
