export interface PartsListQueryState {
  query: string;
  page: number;
  pageSize: number;
  category: string | null;
  lifecycleState: string | null;
  hasDrawing: boolean | null;
  hasChildren: boolean | null;
  sortKey: PartListSortKey;
  sortOrder: PartListSortOrder;
}

export type PartListSortKey = "partNumber" | "name" | "category" | "revision" | "lifecycleState";
export type PartListSortOrder = "asc" | "desc";

export interface PartListItemModel {
  id: string;
  partNumber: string;
  name: string | null;
  category: string | null;
  revision: string;
  lifecycleState: string | null;
  drawingNumber: string | null;
  childrenCount: number;
}

export interface PartListResultModel {
  total: number;
  offset: number;
  limit: number;
  items: PartListItemModel[];
}

export interface PartFilterOptionsModel {
  categories: string[];
  lifecycleStates: string[];
}

export interface PartDrawingModel {
  id: string;
  drawingNumber: string | null;
  name: string | null;
  version: string | null;
  status: string | null;
  conversionStatus: string | null;
  thumbnailUrl: string | null;
  pdfUrl: string | null;
  originalFileUrl: string | null;
}

export interface PartDetailModel {
  id: string;
  partNumber: string;
  name: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  description: string | null;
  category: string | null;
  lifecycleState: string | null;
  isPhantom: boolean | null;
  leadTimeDays: number | null;
  extendedProperties: Record<string, unknown>;
  ownerId: string | null;
  owner: PartOwnerUserModel | null;
  ownerTeamId: string | null;
  ownerTeamName: string | null;
  drawing: PartDrawingModel | null;
  childrenCount: number;
  parentsCount: number;
  suppliersCount: number;
  filesCount: number;
  projectsCount: number;
}

export interface PartOwnerUserModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface PartBomItemModel {
  id: string;
  partNumber: string;
  name: string | null;
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
  partNumber: string;
  name: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  category: string | null;
  lifecycleState: string | null;
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
  partNumber: string;
  name: string | null;
  quantity: number;
  material: string | null;
  revision: string | null;
  lifecycleState: string | null;
  unit: string | null;
  category: string | null;
  children: PartBomDisplayNodeModel[];
}

export interface PartBomFlatRowModel {
  partNumber: string;
  partId: string | null;
  name: string | null;
  totalQuantity: number;
  material: string | null;
  revision: string | null;
  lifecycleState: string | null;
  unit: string | null;
  category: string | null;
  occurrences: number;
}

export interface PartFileModel {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
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

export interface PartOwnerModel {
  ownerId: string | null;
  owner: PartOwnerUserModel | null;
  ownerTeamId: string | null;
  ownerTeamName: string | null;
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

export type PartDetailTab = "properties" | "bom" | "attachments" | "suppliers" | "projects" | "owner" | "history";
