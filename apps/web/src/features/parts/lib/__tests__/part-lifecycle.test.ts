import { describe, it, expect } from "vitest";
import {
  getAllowedLifecycleTransitions,
  getLifecycleVariant,
  getLifecycleBadgeClassName,
  getLifecycleLabel,
} from "@/features/parts/lib/part-lifecycle";

describe("getAllowedLifecycleTransitions", () => {
  it('ACTIVE → ["EOL", "OBSOLETE"]', () => {
    expect(getAllowedLifecycleTransitions("ACTIVE")).toEqual(["EOL", "OBSOLETE"]);
  });

  it('EOL → ["OBSOLETE"]', () => {
    expect(getAllowedLifecycleTransitions("EOL")).toEqual(["OBSOLETE"]);
  });

  it("OBSOLETE → 빈 배열", () => {
    expect(getAllowedLifecycleTransitions("OBSOLETE")).toEqual([]);
  });

  it("null → 빈 배열", () => {
    expect(getAllowedLifecycleTransitions(null)).toEqual([]);
  });
});

describe("getLifecycleVariant", () => {
  it('ACTIVE → "success"', () => {
    expect(getLifecycleVariant("ACTIVE")).toBe("success");
  });

  it('EOL → "accent"', () => {
    expect(getLifecycleVariant("EOL")).toBe("accent");
  });

  it('OBSOLETE → "neutral"', () => {
    expect(getLifecycleVariant("OBSOLETE")).toBe("neutral");
  });

  it('null → "outline"', () => {
    expect(getLifecycleVariant(null)).toBe("outline");
  });
});

describe("getLifecycleBadgeClassName", () => {
  it("ACTIVE → CSS 문자열 포함", () => {
    const result = getLifecycleBadgeClassName("ACTIVE");
    expect(result).toBeDefined();
    expect(result).toContain("status-success");
  });

  it("OBSOLETE → CSS 문자열 포함", () => {
    const result = getLifecycleBadgeClassName("OBSOLETE");
    expect(result).toBeDefined();
    expect(result).toContain("status-neutral");
  });

  it("null → undefined", () => {
    expect(getLifecycleBadgeClassName(null)).toBeUndefined();
  });
});

describe("getLifecycleLabel", () => {
  it('ACTIVE → "활성"', () => {
    expect(getLifecycleLabel("ACTIVE")).toBe("활성");
  });

  it('EOL → "단종 예정"', () => {
    expect(getLifecycleLabel("EOL")).toBe("단종 예정");
  });

  it('OBSOLETE → "폐기"', () => {
    expect(getLifecycleLabel("OBSOLETE")).toBe("폐기");
  });
});
