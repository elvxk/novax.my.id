import { describe, expect, it } from "bun:test";
import { apiSuccess, apiError } from "./api-response";

describe("apiResponse utilities", () => {
  it("generates standard success envelope", async () => {
    const res = apiSuccess({ hello: "world" }, { page: 1 });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Content-Type")).toStartWith("application/json");

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.hello).toBe("world");
    expect(json.meta.page).toBe(1);
  });

  it("omits meta if empty in apiSuccess", async () => {
    const res = apiSuccess({ value: 42 });
    const json = await res.json();
    expect(json.meta).toBeUndefined();
  });

  it("generates standard error envelope with custom status and code", async () => {
    const res = apiError("Invalid domain", 422, "INVALID_DOMAIN");
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_DOMAIN");
    expect(json.error.message).toBe("Invalid domain");
  });
});
