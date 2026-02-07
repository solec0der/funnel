import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getClientAuth } from "./client";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(getClientAuth(), googleProvider);
}

export async function signOut() {
  return firebaseSignOut(getClientAuth());
}
