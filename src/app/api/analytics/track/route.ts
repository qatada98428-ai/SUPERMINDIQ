import { NextRequest } from "next/server";
import { handleTrackTrafficRequest } from "@/lib/traffic-analytics-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleTrackTrafficRequest(request);
}
