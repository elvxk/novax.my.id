import { describe, expect, it } from "bun:test";
import { TOOL_DEFINITIONS, getToolByPath } from "./tool-registry";

describe("tool-registry", () => {
  it("contains all defined tools with required fields", () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThan(0);
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.href).toStartWith("/tools/");
      expect(Array.isArray(tool.apiEndpoints)).toBe(true);
      expect(typeof tool.live).toBe("boolean");
      expect(typeof tool.disabled).toBe("boolean");
    }
  });

  it("resolves tool by web path correctly", () => {
    const dnsTool = getToolByPath("/tools/dns-lookup");
    expect(dnsTool).not.toBeNull();
    expect(dnsTool?.id).toBe("dns-lookup");

    const proxySiteTool = getToolByPath("/tools/proxy-site");
    expect(proxySiteTool).not.toBeNull();
    expect(proxySiteTool?.id).toBe("proxy-site");

    const unknownTool = getToolByPath("/tools/non-existent-tool");
    expect(unknownTool).toBeNull();
  });

  it("resolves tool by API endpoint correctly", () => {
    const geoApi = getToolByPath("/api/ip-geo");
    expect(geoApi).not.toBeNull();
    expect(geoApi?.id).toBe("ip-geo");

    const proxySiteApi = getToolByPath("/api/proxy-site");
    expect(proxySiteApi).not.toBeNull();
    expect(proxySiteApi?.id).toBe("proxy-site");

    const whoisApi = getToolByPath("/api/whois");
    expect(whoisApi).not.toBeNull();
    expect(whoisApi?.id).toBe("dns-lookup");
  });
});
