import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  return NextResponse.json({
    ok: true,
    provider,
    message: "Webhook received (placeholder)",
  });
}
