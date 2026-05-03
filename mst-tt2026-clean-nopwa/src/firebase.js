import { initializeApp } from 'firebase/app'
import {
  getFirestore, doc, setDoc, deleteDoc, onSnapshot,
  collection, serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = !!firebaseConfig.apiKey

let app, db
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

// ─── JOBS ──────────────────────────────────────────────────────────────────
export function subscribeToJobs(callback) {
  if (!db) return () => {}
  return onSnapshot(collection(db, 'jobs'), snap => {
    const jobs = []
    snap.forEach(d => jobs.push({ id: d.id, ...d.data() }))
    callback(jobs)
  }, err => console.error('Jobs sync error:', err))
}

export async function saveJobToCloud(job) {
  if (!db) return
  try { await setDoc(doc(db, 'jobs', job.id), job) }
  catch (e) { console.error('Save failed:', e) }
}

export async function deleteJobFromCloud(id) {
  if (!db) return
  try { await deleteDoc(doc(db, 'jobs', id)) }
  catch (e) { console.error('Delete failed:', e) }
}

// ─── LOCATIONS ─────────────────────────────────────────────────────────────
export async function updateDriverLocation(driverId, location) {
  if (!db) return
  try {
    await setDoc(doc(db, 'locations', driverId), {
      ...location,
      timestamp: serverTimestamp(),
      updatedAt: Date.now(),
    })
  } catch (e) { console.error('Location update failed:', e) }
}

export function subscribeToLocations(callback) {
  if (!db) return () => {}
  return onSnapshot(collection(db, 'locations'), snap => {
    const locs = {}
    snap.forEach(d => { locs[d.id] = d.data() })
    callback(locs)
  }, err => console.error('Locations sync error:', err))
}
