import { apiSuccess, apiError } from "@/lib/api-response";
import {
  callUpstream,
  normalizeDomains,
  upstreamErrorStatus,
} from "@/lib/ssl-generator";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const { domains, error } = normalizeDomains(body?.domains);
  if (error) {
    return apiError(error, 400, "INVALID_DOMAINS");
  }

  const upstream = await callUpstream("/challenge", { domains });
  if (!upstream.ok) {
    return apiError(upstream.message, upstreamErrorStatus(upstream.status), "UPSTREAM_ERROR");
  }

  const id = upstream.data?.id;
  if (!id) {
    return apiError("Upstream did not return a request ID", 502, "UPSTREAM_ERROR");
  }

  return apiSuccess({
    id,
    domains,
    dns: Array.isArray(upstream.data?.dns) ? upstream.data.dns : [],
  });
}
