import { NextResponse } from "next/server";

/**
 * Standard Success Response
 * @param {any} data - payload
 * @param {object} [meta] - optional pagination, timestamps, or stats
 * @param {number} [status=200] - HTTP status code
 */
export function apiSuccess(data, meta = {}, status = 200) {
  const body = {
    success: true,
    data,
  };

  if (meta && Object.keys(meta).length > 0) {
    body.meta = meta;
  }

  return NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * Standard Error Response
 * @param {string} message - human readable error description
 * @param {number} [status=400] - HTTP status code
 * @param {string} [code="BAD_REQUEST"] - machine readable error code
 */
export function apiError(message, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
