import { getUsageToday } from "@/lib/geminiUsage";

export async function GET() {
  return Response.json(getUsageToday());
}
