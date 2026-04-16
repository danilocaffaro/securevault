import { NextResponse } from "next/server";
import { execSync } from "child_process";

interface KeychainEntry {
  name: string;
  savedAt: string;
}

export async function GET() {
  try {
    const output = execSync(
      `security dump-keychain 2>/dev/null | grep -A4 'svce.*"securevault"' | grep '"acct"' | sed 's/.*="//;s/"$//'`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );

    const names = output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const credentials: KeychainEntry[] = names.map((name) => ({
      name,
      savedAt: "Keychain",
    }));

    return NextResponse.json({ credentials });
  } catch {
    return NextResponse.json({ credentials: [] });
  }
}
