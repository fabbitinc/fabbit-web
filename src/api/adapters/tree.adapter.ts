import type { TreeNodeData } from "@/features/items/types";
import type {
  ProjectTreeResponse,
  ProjectTreeDto,
  FolderTreeDto,
  TreeItemNodeDto,
} from "../types";

/**
 * API 응답을 UI TreeNodeData 형식으로 변환
 *
 * [필드 누락 안내]
 * API에 없거나 optional인 필드는 기본값으로 처리됩니다.
 */

function toItemName(item: TreeItemNodeDto): string {
  if (item.name && item.name.trim().length > 0) {
    return item.name;
  }
  if (item.item_number && item.item_number.trim().length > 0) {
    return item.item_number;
  }
  return "이름 없는 아이템";
}

function convertItemTree(item: TreeItemNodeDto): TreeNodeData {
  const children = item.items?.map(convertItemTree);
  const itemId = item.id ?? item.item_number ?? `unknown-item-${toItemName(item)}`;

  return {
    id: itemId,
    name: toItemName(item),
    type: "item",
    partNumber: item.item_number,
    itemType: item.item_type,
    itemCount: item.item_count,
    children: children && children.length > 0 ? children : undefined,
    status: "none",
    hasDrawing: Boolean(item.has_drawing),
  };
}

function convertFolderTree(folder: FolderTreeDto): TreeNodeData {
  const children: TreeNodeData[] = [
    ...(folder.folders ?? []).map(convertFolderTree),
    ...(folder.items ?? []).map(convertItemTree),
  ];

  return {
    id: folder.id,
    name: folder.name,
    type: "folder",
    itemCount: folder.item_count ?? 0,
    children: children.length > 0 ? children : undefined,
  };
}

function convertProjectTree(project: ProjectTreeDto): TreeNodeData {
  const children = (project.folders ?? []).map(convertFolderTree);

  return {
    id: project.id,
    name: project.name,
    type: "project",
    description: project.description ?? undefined,
    lastUpdated: project.updated_at,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * ProjectTreeResponse를 TreeNodeData[] 배열로 변환
 */
export function convertProjectTreeResponse(
  response: ProjectTreeResponse,
): TreeNodeData[] {
  // 현재 UI는 최상위 노드를 project로 가정하므로 orphans는 포함하지 않습니다.
  return (response.projects ?? []).map(convertProjectTree);
}
