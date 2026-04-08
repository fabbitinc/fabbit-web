import type { PartDetailResponseLifecycleState } from "@/api/generated/orval/model/partDetailResponseLifecycleState";
import type { PartDetailResponseRevisionStatus } from "@/api/generated/orval/model/partDetailResponseRevisionStatus";
import type { PartRevisionHistoryItemResponseStatus } from "@/api/generated/orval/model/partRevisionHistoryItemResponseStatus";
import type { PartSummaryResponseRevisionStatus } from "@/api/generated/orval/model/partSummaryResponseRevisionStatus";

export type PartLifecycleState = PartDetailResponseLifecycleState;

export interface PartsListQueryState {
  query: string;
  cursor: string | null;
  cursorDirection: "next" | "prev" | null;
  pageSize: number;
  mineOnly: boolean;
  category: string | null;
  lifecycleState: PartLifecycleState | null;
  hasDrawing: boolean | null;
  hasChildren: boolean | null;
  sortKey: PartListSortKey;
  sortOrder: PartListSortOrder;
}

export type PartListSortKey = "partNumber" | "name" | "category" | "revision" | "lifecycleState";
export type PartListSortOrder = "asc" | "desc";

export interface PartListItemModel {
  id: string;
  partId: string;
  revisionId: string | null;
  partNumber: string;
  name: string | null;
  category: string | null;
  revision: string;
  lifecycleState: PartLifecycleState | null;
  drawingId: string | null;
  childrenCount: number;
  hasStaleChildReference: boolean;
  workStatus: PartSummaryResponseRevisionStatus | null;
}

export interface PartListResultModel {
  nextCursor: string | null;
  prevCursor: string | null;
  limit: number;
  items: PartListItemModel[];
}

export interface PartFilterOptionsModel {
  categories: string[];
  lifecycleStates: PartLifecycleState[];
}

export type PartDrawingProcessingStatus =
  | "ACTION_REQUIRED"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type PartDrawingFailureCode =
  | "TIMEOUT"
  | "UNSUPPORTED_FORMAT"
  | "CONVERTER_UNAVAILABLE"
  | "CONVERSION_FAILED"
  | "UNKNOWN";

export type PartDrawingViewerType = "PDF" | "GLB";
export type PartDrawingActionRequiredReason = "RENDER_SOURCE_REQUIRED";

export interface PartDrawingWebViewRequirementModel {
  title: string;
  description: string | null;
}

export interface PartDrawingModel {
  id: string;
  drawingNumber: string | null;
  name: string | null;
  version: string | null;
  status: string | null;
  conversionStatus: PartDrawingProcessingStatus | null;
  viewerType: PartDrawingViewerType | null;
  viewerUrl: string | null;
  previewUrl: string | null;
  originalFileUrl: string | null;
  failureCode: PartDrawingFailureCode | null;
  failureMessage: string | null;
  webViewRequirement: PartDrawingWebViewRequirementModel | null;
}

export interface PartDrawingProcessingModel {
  status: PartDrawingProcessingStatus;
  failureCode: PartDrawingFailureCode | null;
  failureMessage: string | null;
  pdfReady: boolean;
  webpReady: boolean;
  glbReady: boolean;
  actionRequiredReason: PartDrawingActionRequiredReason | null;
  allowedRenderSourceExtensions: string[];
}

export interface PartDetailModel {
  partId: string;
  revisionId: string;
  revisionStatus: PartDetailResponseRevisionStatus | null;
  baseRevisionId: string | null;
  baseRevisionCode: string | null;
  partNumber: string;
  name: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  description: string | null;
  category: string | null;
  lifecycleState: PartLifecycleState | null;
  isPhantom: boolean | null;
  leadTimeDays: number | null;
  extendedProperties: Record<string, unknown>;
  drawing: PartDrawingModel | null;
  draftCount: number;
  childrenCount: number;
  parentsCount: number;
  suppliersCount: number;
  filesCount: number;
  projectsCount: number;
}

export interface PartBomItemModel {
  id: string;
  bomItemId: string | null;
  partId: string | null;
  revisionId: string | null;
  partNumber: string;
  name: string | null;
  revisionCode: string | null;
  revisionStatus: string | null;
  lineNumber: string | null;
  quantity: number;
  extendedProperties: Record<string, unknown>;
}

export interface PartBomModel {
  children: PartBomItemModel[];
  parents: PartBomItemModel[];
}

export type PartBomDirection = "forward" | "reverse";
export type PartBomExploreView = "multi-level" | "single-level" | "flattened";

export interface PartBomTreeNodeModel {
  id: string;
  partId: string | null;
  revisionId: string | null;
  partNumber: string;
  name: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  category: string | null;
  lifecycleState: PartLifecycleState | null;
  quantity: number;
  children: PartBomTreeNodeModel[];
}

export interface PartBomTreeModel {
  root: PartBomTreeNodeModel;
  direction: PartBomDirection;
  totalCount: number;
}

export interface PartBomDisplayNodeModel {
  nodeKey: string;
  partId: string | null;
  revisionId: string | null;
  partNumber: string;
  name: string | null;
  quantity: number;
  material: string | null;
  revision: string | null;
  lifecycleState: PartLifecycleState | null;
  unit: string | null;
  category: string | null;
  children: PartBomDisplayNodeModel[];
}

export interface PartBomFlatRowModel {
  partNumber: string;
  partId: string | null;
  revisionId: string | null;
  name: string | null;
  totalQuantity: number;
  material: string | null;
  revision: string | null;
  lifecycleState: PartLifecycleState | null;
  unit: string | null;
  category: string | null;
  occurrences: number;
}

export interface PartAttachmentModel {
  id: string;
  kind: "drawing" | "file";
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export type PartPreviewSourceType = "DRAWING" | "PREVIEW_FILE";

export interface PartPreviewSourceModel {
  sourceId: string;
  sourceType: PartPreviewSourceType;
  attachmentType: PartPreviewSourceType;
  previewFileId: string | null;
  fileId: string | null;
  drawingId: string | null;
  originalName: string;
  contentType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  selected: boolean;
  deletable: boolean;
  createdAt: string | null;
}

export interface PartSupplierModel {
  id: string;
  companyName: string;
  code: string | null;
  country: string | null;
  unitCost: number | null;
}

export interface PartProjectModel {
  id: string;
  name: string;
  description: string | null;
}

export interface PartsAvailableProjectModel {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
  isArchived: boolean;
}

export interface PartsAvailableTeamModel {
  id: string;
  name: string;
  memberCount: number;
}

export type PartDetailTab = "properties" | "bom" | "attachments" | "suppliers" | "projects" | "history";

// ── 리비전 이력 ──────────────────────────────────────────

export type PartRevisionStatus = PartRevisionHistoryItemResponseStatus;

export type PartRevisionEventType = "CREATED" | "DRAFT_CREATED" | "DRAFT_RELEASED" | "DRAFT_CANCELED";
export type PartRevisionCreationSourceType = "USER" | "SYNTHESIS";
export type PartRevisionReleaseWorkflowType = "DIRECT" | "ENGINEERING_CHANGE";

export interface PartRevisionHistoryChangeSummaryModel {
  attributeChanges: number;
  fileChanges: number;
  bomChanges: number;
}

export interface PartRevisionHistoryEventModel {
  eventType: PartRevisionEventType;
  occurredAt: string | null;
  actorName: string | null;
  reason: string | null;
  creationSourceType: PartRevisionCreationSourceType | null;
  releaseWorkflowType: PartRevisionReleaseWorkflowType | null;
  draftRevisionId: string | null;
  targetRevisionCode: string | null;
  sourceRefId: string | null;
  sourceRefNumber: number | null;
  sourceRefTitle: string | null;
}

export interface PartRevisionHistoryItemModel {
  revisionId: string;
  revisionCode: string;
  status: PartRevisionStatus;
  name: string | null;
  summary: PartRevisionHistoryChangeSummaryModel | null;
  events: PartRevisionHistoryEventModel[];
}

// ── 리비전 diff ──────────────────────────────────────────

export type PartRevisionDiffChangeType = "ADDED" | "REMOVED" | "CHANGED";

export interface PartRevisionDiffAttributeModel {
  fieldKey: string;
  fieldLabel: string;
  changeType: PartRevisionDiffChangeType;
  beforeValue: string | null;
  afterValue: string | null;
}

export interface PartRevisionDiffFileModel {
  itemType: string;
  displayName: string;
  changeType: PartRevisionDiffChangeType;
}

export interface PartRevisionDiffBomModel {
  lineNumber: string | null;
  beforePartNumber: string | null;
  beforeName: string | null;
  beforeQuantity: number | null;
  afterPartNumber: string | null;
  afterName: string | null;
  afterQuantity: number | null;
  changeType: PartRevisionDiffChangeType;
}

export interface PartRevisionDiffModel {
  baseRevisionId: string | null;
  targetRevisionId: string | null;
  baseRevisionCode: string | null;
  targetRevisionCode: string | null;
  summary: PartRevisionHistoryChangeSummaryModel | null;
  attributes: PartRevisionDiffAttributeModel[];
  files: PartRevisionDiffFileModel[];
  bom: PartRevisionDiffBomModel[];
}

// ── 리비전 선택기 ──────────────────────────────────────

export interface PartRevisionOptionModel {
  revisionId: string;
  revisionCode: string;
  status: string;
  currentReleased: boolean;
}
