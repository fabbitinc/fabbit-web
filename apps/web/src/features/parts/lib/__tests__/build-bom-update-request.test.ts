import { describe, expect, it } from "vitest";
import { buildBomUpdateRequest } from "../build-bom-update-request";

describe("buildBomUpdateRequest", () => {
  const initial = {
    childPartRevisionId: "rev-1",
    lineNumber: "10",
    quantity: 5,
  };

  it("변경 없으면 null 반환", () => {
    expect(buildBomUpdateRequest({ ...initial }, initial)).toBeNull();
  });

  it("quantity만 변경하면 quantity_set만 true", () => {
    const result = buildBomUpdateRequest({ ...initial, quantity: 10 }, initial);
    expect(result).toEqual({
      quantity: 10,
      quantity_set: true,
    });
  });

  it("lineNumber만 변경하면 line_number_set만 true", () => {
    const result = buildBomUpdateRequest({ ...initial, lineNumber: "20" }, initial);
    expect(result).toEqual({
      line_number: "20",
      line_number_set: true,
    });
  });

  it("childPartRevisionId만 변경하면 child_part_revision_id_set만 true", () => {
    const result = buildBomUpdateRequest({ ...initial, childPartRevisionId: "rev-2" }, initial);
    expect(result).toEqual({
      child_part_revision_id: "rev-2",
      child_part_revision_id_set: true,
    });
  });

  it("여러 필드 변경 시 해당 필드만 _set 포함", () => {
    const result = buildBomUpdateRequest(
      { childPartRevisionId: "rev-2", lineNumber: "20", quantity: 10 },
      initial,
    );
    expect(result).toEqual({
      child_part_revision_id: "rev-2",
      child_part_revision_id_set: true,
      line_number: "20",
      line_number_set: true,
      quantity: 10,
      quantity_set: true,
    });
  });

  it("변경되지 않은 필드는 _set 플래그가 없음", () => {
    const result = buildBomUpdateRequest({ ...initial, quantity: 10 }, initial);
    expect(result).not.toHaveProperty("line_number_set");
    expect(result).not.toHaveProperty("child_part_revision_id_set");
  });
});
