import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "@/lib/contentful";

describe("resolveAssetUrl", () => {
  it("prefixes protocol-relative Contentful URLs with https", () => {
    expect(resolveAssetUrl("//images.ctfassets.net/space/asset.jpg")).toBe(
      "https://images.ctfassets.net/space/asset.jpg",
    );
  });

  it("leaves absolute URLs unchanged", () => {
    expect(resolveAssetUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(resolveAssetUrl("http://example.com/a.png")).toBe("http://example.com/a.png");
  });

  it("returns undefined for empty or nullish input", () => {
    expect(resolveAssetUrl(undefined)).toBeUndefined();
    expect(resolveAssetUrl(null)).toBeUndefined();
    expect(resolveAssetUrl("")).toBeUndefined();
  });
});
