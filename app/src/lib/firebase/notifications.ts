import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  updateDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "./client";
import type { Notification } from "@/lib/types";

const PAGE_SIZE = 25;

function mapDoc(doc: QueryDocumentSnapshot<DocumentData>): Notification {
  return { id: doc.id, ...doc.data() } as Notification;
}

export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void
): () => void {
  const db = getClientDb();
  const q = query(
    collection(db, `users/${userId}/notifications`),
    where("archived", "==", false),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(mapDoc);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === PAGE_SIZE;
    callback(notifications, lastDoc, hasMore);
  });
}

export async function loadMoreNotifications(
  userId: string,
  lastDoc: QueryDocumentSnapshot<DocumentData>
): Promise<{
  notifications: Notification[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const db = getClientDb();
  const q = query(
    collection(db, `users/${userId}/notifications`),
    where("archived", "==", false),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(PAGE_SIZE)
  );

  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map(mapDoc);
  const newLast = snapshot.docs[snapshot.docs.length - 1] || null;
  const hasMore = snapshot.docs.length === PAGE_SIZE;

  return { notifications, lastDoc: newLast, hasMore };
}

export async function markAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
    read: true,
  });
}

export async function archiveNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
    archived: true,
  });
}
