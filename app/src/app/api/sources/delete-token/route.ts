import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyIdToken } from "@/lib/firebase/verify-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, sourceId } = await request.json();

  if (uid !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getAdminDb();

  // Find and delete all tokens for this source
  const tokens = await db
    .collection("webhookTokens")
    .where("userId", "==", userId)
    .where("sourceId", "==", sourceId)
    .get();

  const batch = db.batch();
  tokens.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return NextResponse.json({ ok: true });
}
