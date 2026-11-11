import { describe, expect, it } from "bun:test";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("rate-limit utilities", () => {
  it("allows requests under the rate limit", () => {
    const testIp = `test-${Date.now()}-1`;
    const result = checkRateLimit(testIp);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
    expect(result.limit).toBeGreaterThan(0);
    expect(result.resetSeconds).toBeGreaterThan(0);
  });

  it("decrements remaining tokens with consecutive requests", () => {
    const testIp = `test-${Date.now()}-2`;
    const r1 = checkRateLimit(testIp);
    const r2 = checkRateLimit(testIp);
    expect(r2.remaining).toBe(r1.remaining - 1);
  });

  it("extracts real client IP from cf-connecting-ip or forwarded headers", () => {
    const reqWithCf = {
      headers: new Headers({
        "cf-connecting-ip": "203.0.113.195",
      }),
    };
    expect(getClientIp(reqWithCf)).toBe("203.0.113.195");

    const reqWithForwarded = {
      headers: new Headers({
        "x-forwarded-for": "198.51.100.1, 10.0.0.1",
      }),
    };
    expect(getClientIp(reqWithForwarded)).toBe("198.51.100.1");

    const reqFallback = {
      headers: new Headers(),
    };
    expect(getClientIp(reqFallback)).toBe("127.0.0.1");
  });
});
