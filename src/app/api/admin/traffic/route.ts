import { NextRequest } from "next/server";
import { handleAdminTrafficRequest } from "@/lib/traffic-analytics-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleAdminTrafficRequest(request);
}
