import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getClientDb } from "./client";

export async function registerToken(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  const db = getClientDb();
  const token = JSON.stringify(subscription.toJSON());
  await updateDoc(doc(db, "users", userId), {
    fcmTokens: arrayUnion(token),
  });
}

export async function removeToken(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  const db = getClientDb();
  const token = JSON.stringify(subscription.toJSON());
  await updateDoc(doc(db, "users", userId), {
    fcmTokens: arrayRemove(token),
  });
}
