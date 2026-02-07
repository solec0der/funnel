import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getNormalizer, PROVIDERS } from "@/lib/normalizers";
import { FieldValue } from "firebase-admin/firestore";
import type { Provider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // 1. Validate provider
  if (!PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { ok: false, error: `Unknown provider: ${provider}` },
      { status: 400 }
    );
  }

  // 2. Extract token
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing token query parameter" },
      { status: 401 }
    );
  }

  const db = getAdminDb();

  // 3. Lookup webhook token
  const tokenDoc = await db.doc(`webhookTokens/${token}`).get();
  if (!tokenDoc.exists) {
    return NextResponse.json(
      { ok: false, error: "Invalid token" },
      { status: 401 }
    );
  }

  const { userId, sourceId } = tokenDoc.data()!;

  // 4. Verify source exists and is enabled
  const sourceDoc = await db
    .doc(`users/${userId}/sources/${sourceId}`)
    .get();
  if (!sourceDoc.exists) {
    return NextResponse.json(
      { ok: false, error: "Source not found" },
      { status: 404 }
    );
  }
  const source = sourceDoc.data()!;
  if (!source.enabled) {
    return NextResponse.json(
      { ok: false, error: "Source is disabled" },
      { status: 404 }
    );
  }

  // 5. Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 6. Normalize
  const normalizer = getNormalizer(provider as Provider);
  let normalized;
  try {
    normalized = normalizer(body);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payload validation failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 422 }
    );
  }

  // 7. Write notification
  const notificationRef = db
    .collection(`users/${userId}/notifications`)
    .doc();

  await notificationRef.set({
    sourceId,
    provider,
    context: source.context || "both",
    priority: normalized.priority,
    timeSensitive: normalized.timeSensitive,
    title: normalized.title,
    body: normalized.body,
    url: normalized.url,
    raw: body,
    read: false,
    archived: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json(
    { ok: true, notificationId: notificationRef.id },
    { status: 201 }
  );
}
