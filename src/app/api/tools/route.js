import { apiSuccess } from "@/lib/api-response";
import { getToolsFromDb } from "@/lib/tools-db";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request) {
  const tools = await getToolsFromDb();
  const searchParams = request?.nextUrl?.searchParams;
  const includeAll = searchParams?.get("all") === "true";

  // By default, filter out completely disabled tools; allow ?all=true for docs and management
  const data = includeAll ? tools : tools.filter((t) => !t.disabled);

  return apiSuccess(data, {
    total: data.length,
    timestamp: new Date().toISOString(),
  });
}
