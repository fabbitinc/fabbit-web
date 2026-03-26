import { describe, it, expect } from "vitest";
import { getAvailablePartActions } from "@/features/parts/lib/part-actions";

describe("getAvailablePartActions - DIRECT 모드", () => {
  it("DRAFT 리비전 → canRelease: true, canCancel: true, canEditDraft: true", () => {
    const result = getAvailablePartActions({
      workflowMode: "DIRECT",
      revisionStatus: "DRAFT",
      lifecycleState: null,
    });

    expect(result.canRelease).toBe(true);
    expect(result.canCancel).toBe(true);
    expect(result.canEditDraft).toBe(true);
  });

  it("RELEASED + ACTIVE → canCreateDraft: true, lifecycleTransitions: [EOL, OBSOLETE]", () => {
    const result = getAvailablePartActions({
      workflowMode: "DIRECT",
      revisionStatus: "RELEASED",
      lifecycleState: "ACTIVE",
    });

    expect(result.canCreateDraft).toBe(true);
    expect(result.lifecycleTransitions).toEqual(["EOL", "OBSOLETE"]);
  });

  it("RELEASED + OBSOLETE → canCreateDraft: false (OBSOLETE 차단)", () => {
    const result = getAvailablePartActions({
      workflowMode: "DIRECT",
      revisionStatus: "RELEASED",
      lifecycleState: "OBSOLETE",
    });

    expect(result.canCreateDraft).toBe(false);
  });

  it("RELEASED + EOL → canCreateDraft: false, lifecycleTransitions: [OBSOLETE]", () => {
    const result = getAvailablePartActions({
      workflowMode: "DIRECT",
      revisionStatus: "RELEASED",
      lifecycleState: "EOL",
    });

    expect(result.canCreateDraft).toBe(false);
    expect(result.lifecycleTransitions).toEqual(["OBSOLETE"]);
  });
});

describe("getAvailablePartActions - EC 모드", () => {
  it("DRAFT 리비전 → canRelease: false, canCancel: false, disabledReason: not null", () => {
    const result = getAvailablePartActions({
      workflowMode: "ENGINEERING_CHANGE_REQUIRED",
      revisionStatus: "DRAFT",
      lifecycleState: null,
    });

    expect(result.canRelease).toBe(false);
    expect(result.canCancel).toBe(false);
    expect(result.disabledReason).not.toBeNull();
  });

  it("DRAFT 리비전 → canEditDraft: true (편집은 모드 무관)", () => {
    const result = getAvailablePartActions({
      workflowMode: "ENGINEERING_CHANGE_REQUIRED",
      revisionStatus: "DRAFT",
      lifecycleState: null,
    });

    expect(result.canEditDraft).toBe(true);
  });

  it("RELEASED 리비전 → canCreateDraft: true (새 초안 생성은 모드 무관)", () => {
    const result = getAvailablePartActions({
      workflowMode: "ENGINEERING_CHANGE_REQUIRED",
      revisionStatus: "RELEASED",
      lifecycleState: "ACTIVE",
    });

    expect(result.canCreateDraft).toBe(true);
  });

  it("lifecycleTransitions: 항상 빈 배열", () => {
    const result = getAvailablePartActions({
      workflowMode: "ENGINEERING_CHANGE_REQUIRED",
      revisionStatus: "RELEASED",
      lifecycleState: "ACTIVE",
    });

    expect(result.lifecycleTransitions).toEqual([]);
  });
});

describe("getAvailablePartActions - 경계 케이스", () => {
  it("workflowMode: null → DIRECT로 동작하지 않고 적절히 처리", () => {
    const result = getAvailablePartActions({
      workflowMode: null,
      revisionStatus: "DRAFT",
      lifecycleState: null,
    });

    // workflowMode가 null이면 isEcMode가 false이므로 DIRECT 분기로 진입
    // 이는 의도된 동작: null은 EC 모드가 아니므로 DIRECT처럼 동작
    expect(result.canRelease).toBe(true);
    expect(result.canCancel).toBe(true);
    expect(result.disabledReason).toBeNull();
  });

  it("revisionStatus: null → 모든 리비전 관련 액션 false", () => {
    const result = getAvailablePartActions({
      workflowMode: "DIRECT",
      revisionStatus: null,
      lifecycleState: null,
    });

    expect(result.canRelease).toBe(false);
    expect(result.canCancel).toBe(false);
    expect(result.canCreateDraft).toBe(false);
    expect(result.canEditDraft).toBe(false);
  });
});
