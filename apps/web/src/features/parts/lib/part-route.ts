export interface PartRevisionRef {
  kind: "revision";
  partNumber: string;
  revisionCode: string;
}

export interface PartDraftRef {
  kind: "draft";
  partNumber: string;
  draftKey: string;
}

export interface PartRevisionDraftRef {
  kind: "revision-draft";
  partNumber: string;
  revisionCode: string;
  draftKey: string;
}

export type PartRouteRef = PartRevisionRef | PartDraftRef | PartRevisionDraftRef;

export function toPartRouteId({
  partNumber,
  revisionCode,
}: Omit<PartRevisionRef, "kind">): string {
  return `${partNumber}/revisions/${revisionCode}`;
}

export function toPartDraftRouteId({
  partNumber,
  draftKey,
}: Omit<PartDraftRef, "kind">): string {
  return `${partNumber}/drafts/${draftKey}`;
}

export function toPartRevisionDraftRouteId({
  partNumber,
  revisionCode,
  draftKey,
}: Omit<PartRevisionDraftRef, "kind">): string {
  return `${partNumber}/revisions/${revisionCode}/drafts/${draftKey}`;
}

export function parsePartRouteId(partRouteId: string): PartRouteRef {
  const segments = partRouteId.split("/");

  if (
    segments.length === 3 &&
    segments[0] &&
    segments[1] === "revisions" &&
    segments[2]
  ) {
    return {
      kind: "revision",
      partNumber: segments[0],
      revisionCode: segments[2],
    };
  }

  if (
    segments.length === 3 &&
    segments[0] &&
    segments[1] === "drafts" &&
    segments[2]
  ) {
    return {
      kind: "draft",
      partNumber: segments[0],
      draftKey: segments[2],
    };
  }

  if (
    segments.length === 5 &&
    segments[0] &&
    segments[1] === "revisions" &&
    segments[2] &&
    segments[3] === "drafts" &&
    segments[4]
  ) {
    return {
      kind: "revision-draft",
      partNumber: segments[0],
      revisionCode: segments[2],
      draftKey: segments[4],
    };
  }

  throw new Error(`유효하지 않은 부품 경로 식별자입니다: ${partRouteId}`);
}

export function buildPartDetailPath(partRouteId: string): string {
  return `/parts/${partRouteId}`;
}

export function buildPartEditPath(partRouteId: string): string {
  const route = parsePartRouteId(partRouteId);

  if (route.kind !== "draft" && route.kind !== "revision-draft") {
    throw new Error("편집 경로는 초안에서만 지원합니다.");
  }

  return `/parts/${partRouteId}/edit`;
}

export function buildPartBomPath(partRouteId: string): string {
  const route = parsePartRouteId(partRouteId);

  if (route.kind !== "revision") {
    throw new Error("BOM 경로는 공식 리비전에서만 지원합니다.");
  }

  return `/parts/${partRouteId}/bom`;
}
