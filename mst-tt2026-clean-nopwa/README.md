# MST IoM TT 2026 — Operations App

A live operations dashboard for MST minibus transfers during the Isle of Man TT 2026.

## Features

- ✅ Full schedule (81 jobs) for both weeks
- ✅ Harry & Leanne driver lanes with real-time sync
- ✅ Passenger manifests with tap-to-call contacts
- ✅ Live GPS sharing between drivers
- ✅ Tap-to-navigate via Google Maps
- ✅ Elegance 16-seater fare tracking with paid/unpaid status
- ✅ Race day capacity warnings & overflow alerts
- ✅ Road closure schedule built in
- ✅ Works offline (PWA — saves to home screen as an app)
- ✅ Installable on iPhone and Android

---

## DEPLOYMENT — Step by step

### Prerequisites
You need:
1. A **GitHub account** (free) — sign up at github.com
2. A **Firebase project** (free) — already done ✓
3. A **Vercel account** (free) — sign up at vercel.com using your GitHub account

---

### STEP 1 — Get your Firebase config keys

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll down to "Your apps"
4. If you haven't already, click the **`</>`** (web) icon and register the app
5. Copy the `firebaseConfig` object — you need these 6 values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

**Keep these handy** — you'll paste them into Vercel in step 4.

---

### STEP 2 — Set up Firestore Database

1. In Firebase Console, click **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll lock down later)
4. Pick **europe-west2 (London)** as the region
5. Click Enable

That's it — the database is ready.

---

### STEP 3 — Upload code to GitHub

1. Go to **github.com**, sign in
2. Click **+** in top right → **New repository**
3. Name it `mst-tt2026`, leave Public selected, **don't** tick any of the Add boxes
4. Click **Create repository**
5. On the next screen, click **uploading an existing file**
6. Drag the entire contents of this folder (everything except node_modules and dist) into the upload area
7. Scroll down, click **Commit changes**

Your code is now on GitHub.

---

### STEP 4 — Deploy on Vercel

1. Go to **vercel.com** and sign in with GitHub
2. Click **Add New...** → **Project**
3. Find your `mst-tt2026` repo and click **Import**
4. Leave Framework Preset as **Vite** (auto-detected)
5. Expand **Environment Variables** and add all 6 Firebase values:

   | Name | Value |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | (your apiKey) |
   | `VITE_FIREBASE_AUTH_DOMAIN` | (your authDomain) |
   | `VITE_FIREBASE_PROJECT_ID` | (your projectId) |
   | `VITE_FIREBASE_STORAGE_BUCKET` | (your storageBucket) |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | (your messagingSenderId) |
   | `VITE_FIREBASE_APP_ID` | (your appId) |

6. Click **Deploy**
7. Wait ~2 minutes
8. You'll get a URL like `mst-tt2026.vercel.app` 🎉

---

### STEP 5 — Install on your phones

**On iPhone (Safari):**
1. Open the Vercel URL in Safari
2. Tap the **Share** button (square with arrow up)
3. Scroll down → **Add to Home Screen**
4. Tap **Add**

**On Android (Chrome):**
1. Open the Vercel URL in Chrome
2. Tap the **⋮** menu → **Add to Home Screen** (or "Install app")
3. Tap **Install**

The app icon appears on your home screen. Tap it — it opens fullscreen like a native app.

**Send the URL to Leanne** so she can install it too. First time you each open it, pick your name (Harry or Leanne).

---

## Updating the app

If you make code changes:
1. Edit files on GitHub directly (use the pencil icon on any file)
2. Or upload new versions via "Add file → Upload files"
3. Vercel auto-deploys within 60 seconds

The app on your phones updates automatically next time you open it.

---

## Securing Firestore (do this after testing)

After confirming the app works, lock down the database:

1. Firebase Console → Firestore → **Rules** tab
2. Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click Publish

This keeps it open but adds basic protection. For higher security, add Firebase Auth — but for race week with just 2 users sharing the URL, this is fine.

---

## Help

- App not loading? Check Vercel deployment logs
- Locations not syncing? Check Firestore rules are set to test mode
- Need to reset all jobs? Delete everything in Firestore → reload app
