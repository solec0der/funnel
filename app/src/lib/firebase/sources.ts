import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getClientDb, getClientAuth } from "./client";
import type { Provider, Context, Source } from "@/lib/types";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function getIdToken(): Promise<string> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export async function createSource(
  userId: string,
  data: { provider: Provider; name: string; context: Context }
): Promise<string> {
  const token = generateToken();
  const db = getClientDb();

  // Write source doc
  const sourceRef = await addDoc(collection(db, `users/${userId}/sources`), {
    provider: data.provider,
    name: data.name,
    type: "webhook" as const,
    context: data.context,
    enabled: true,
    webhookToken: token,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Register token via server API
  const idToken = await getIdToken();
  const res = await fetch("/api/sources/register-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      token,
      userId,
      sourceId: sourceRef.id,
      provider: data.provider,
    }),
  });

  if (!res.ok) {
    // Clean up source doc if token registration fails
    await deleteDoc(sourceRef);
    throw new Error("Failed to register webhook token");
  }

  return sourceRef.id;
}

export async function updateSource(
  userId: string,
  sourceId: string,
  updates: Partial<Pick<Source, "name" | "context" | "enabled">>
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, `users/${userId}/sources/${sourceId}`), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSource(
  userId: string,
  sourceId: string
): Promise<void> {
  const db = getClientDb();

  // Delete token via server API
  const idToken = await getIdToken();
  await fetch("/api/sources/delete-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ userId, sourceId }),
  });

  // Delete source doc
  await deleteDoc(doc(db, `users/${userId}/sources/${sourceId}`));
}

export function subscribeSources(
  userId: string,
  callback: (sources: Source[]) => void
): () => void {
  const db = getClientDb();
  const q = query(
    collection(db, `users/${userId}/sources`),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const sources = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Source
    );
    callback(sources);
  });
}
