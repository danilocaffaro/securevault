import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

interface SaveBody {
  name: string;
  value: string;
}

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 10;
  const hits = (rateLimitMap.get(ip) || []).filter((t) => now - t < window);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length <= max;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as SaveBody;
    const { name, value } = body;

    if (!name || !value || typeof name !== "string" || typeof value !== "string") {
      return NextResponse.json({ ok: false, error: "name and value required" }, { status: 400 });
    }

    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, "");
    if (!sanitizedName) {
      return NextResponse.json({ ok: false, error: "Invalid credential name" }, { status: 400 });
    }

    // Delete existing entry (ignore errors if not found)
    try {
      execSync(
        `security delete-generic-password -s "securevault" -a "${sanitizedName}" 2>/dev/null`,
        { stdio: "pipe" }
      );
    } catch {
      // not found, ok
    }

    execSync(
      `security add-generic-password -s "securevault" -a "${sanitizedName}" -w "${value.replace(/"/g, '\\"')}" -U`,
      { stdio: "pipe" }
    );

    console.log(`[SecureVault] Saved: ${sanitizedName} at ${new Date().toISOString()}`);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[SecureVault] Save error: ${msg}`);
    return NextResponse.json({ ok: false, error: "Failed to save to Keychain" }, { status: 500 });
  }
}
