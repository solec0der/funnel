import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let _app: App | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;

export function getAdminApp(): App {
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApp();
    } else {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
      }
      _app = initializeApp({
        credential: cert(JSON.parse(serviceAccountKey)),
      });
    }
  }
  return _app;
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}
