# ReliefLink Mobile

Flutter client for ReliefLink's **donor** and **beneficiary** experiences. The existing Laravel application remains the API and staff/admin workspace.

## Run

1. Start the Laravel backend and make its API reachable from the device.
2. From this directory, run `flutter pub get` and `flutter run` (or select Windows, Android, or iOS in Android Studio and press Run).
3. The default API URL is `http://127.0.0.1:8000/api` on Windows and `http://10.0.2.2:8000/api` for the Android emulator. On a physical phone, set the API URL from the sign-in screen to the host machine's reachable address, such as `http://192.168.1.10:8000/api`. Use HTTPS for a deployed server.

The app stores the API URL and Sanctum bearer token locally. It supports role based sign up and sign in, donation pledges, verified request browsing for donors, beneficiary support requests, request/donation status, match and handoff details, notifications, and sign out. Admin and staff screens are intentionally not included.

## Backend API

The client uses the Laravel endpoints under `/api`: authentication, `donations`, `requests`, `matches`, and `notifications`. Keep the API server running and configure its CORS/network access for the mobile device where needed.
