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

  const { subscription } = await request.json();
  if (!subscription) {
    return NextResponse.json(
      { error: "Missing subscription" },
      { status: 400 }
    );
  }

  const token = JSON.stringify(subscription);
  const db = getAdminDb();

  await db.doc(`users/${uid}`).update({
    fcmTokens: FieldValue.arrayRemove(token),
  });

  return NextResponse.json({ ok: true });
}
