import { apiSuccess, apiError } from "@/lib/api-response";
import {
  callUpstream,
  isValidRequestId,
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

export async function POST(request, { params }) {
  const { id } = await params;

  if (!isValidRequestId(id)) {
    return apiError(
      "A valid request ID is required (e.g. /api/ssl-generator/issue/0dbadd11-92fe-452f-b38b-75febd17fa3c)",
      400,
      "INVALID_REQUEST_ID"
    );
  }

  // Upstream polls DNS for propagation and only gives up at 60s
  const upstream = await callUpstream(`/issue/${encodeURIComponent(id)}`, undefined, 90000);
  if (!upstream.ok) {
    return apiError(upstream.message, upstreamErrorStatus(upstream.status), "UPSTREAM_ERROR");
  }

  const { domains, certificate, privateKey } = upstream.data ?? {};
  if (!certificate || !privateKey) {
    return apiError("Upstream did not return a certificate", 502, "UPSTREAM_ERROR");
  }

  return apiSuccess({
    id,
    domains: Array.isArray(domains) ? domains : [],
    certificate,
    privateKey,
    message: upstream.message || "Certificate issued successfully",
  });
}
