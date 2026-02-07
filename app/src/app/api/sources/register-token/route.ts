import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyIdToken } from "@/lib/firebase/verify-auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, userId, sourceId, provider } = await request.json();

  if (uid !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getAdminDb();

  // Verify source exists
  const sourceDoc = await db.doc(`users/${userId}/sources/${sourceId}`).get();
  if (!sourceDoc.exists) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // Write webhook token lookup doc
  await db.doc(`webhookTokens/${token}`).set({
    userId,
    sourceId,
    provider,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
