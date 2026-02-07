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
  writeBatch,
  type QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getClientDb } from "./client";
import type { Notification, NotificationView } from "@/lib/types";

const PAGE_SIZE = 25;

function mapDoc(doc: QueryDocumentSnapshot<DocumentData>): Notification {
  return { id: doc.id, ...doc.data() } as Notification;
}

function viewConstraints(view: NotificationView): QueryConstraint[] {
  switch (view) {
    case "work":
      return [
        where("archived", "==", false),
        where("context", "in", ["work", "both"]),
      ];
    case "personal":
      return [
        where("archived", "==", false),
        where("context", "in", ["personal", "both"]),
      ];
    case "critical":
      return [
        where("archived", "==", false),
        where("priority", "in", ["critical", "high"]),
      ];
    default:
      return [where("archived", "==", false)];
  }
}

export function subscribeNotifications(
  userId: string,
  view: NotificationView,
  callback: (notifications: Notification[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void
): () => void {
  const db = getClientDb();
  const q = query(
    collection(db, `users/${userId}/notifications`),
    ...viewConstraints(view),
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
  view: NotificationView,
  lastDoc: QueryDocumentSnapshot<DocumentData>
): Promise<{
  notifications: Notification[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const db = getClientDb();
  const q = query(
    collection(db, `users/${userId}/notifications`),
    ...viewConstraints(view),
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

export async function markAsUnread(
  userId: string,
  notificationId: string
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
    read: false,
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

export async function batchMarkAsRead(
  userId: string,
  ids: string[]
): Promise<void> {
  const db = getClientDb();
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.update(doc(db, `users/${userId}/notifications/${id}`), { read: true });
  }
  await batch.commit();
}

export async function batchArchive(
  userId: string,
  ids: string[]
): Promise<void> {
  const db = getClientDb();
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.update(doc(db, `users/${userId}/notifications/${id}`), { archived: true });
  }
  await batch.commit();
}
