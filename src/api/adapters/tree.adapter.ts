import type { TreeNodeData } from "@/features/items/types";
import type {
  ProjectTreeResponse,
  ProjectTreeDto,
  FolderTreeDto,
  ItemTreeDto,
} from "../types";

/**
 * API 응답을 UI TreeNodeData 형식으로 변환
 *
 * [필드 누락 안내]
 * API에 없어서 기본값으로 처리되는 필드:
 * - Project: description, lastUpdated
 * - Item: status, hasDrawing
 */

function convertItemTree(item: ItemTreeDto): TreeNodeData {
  // 하위 아이템 변환 (ASSEMBLY인 경우)
  const children = item.items?.map(convertItemTree);

  return {
    id: item.id,
    name: item.name ?? item.itemNumber, // name이 없으면 itemNumber 사용
    type: "item",
    partNumber: item.itemNumber,
    itemType: item.itemType,
    itemCount: item.itemCount, // API에서 제공
    children: children && children.length > 0 ? children : undefined,
    // TODO: status - API에 없음, 기본값 "none"
    status: "none",
    // TODO: hasDrawing - API에 없음, 기본값 false
    hasDrawing: false,
  };
}

function convertFolderTree(folder: FolderTreeDto): TreeNodeData {
  const children: TreeNodeData[] = [
    ...folder.folders.map(convertFolderTree),
    ...folder.items.map(convertItemTree),
  ];

  return {
    id: folder.id,
    name: folder.name,
    type: "folder",
    itemCount: folder.itemCount, // API에서 제공
    children: children.length > 0 ? children : undefined,
  };
}

function convertProjectTree(project: ProjectTreeDto): TreeNodeData {
  const children = project.folders.map(convertFolderTree);

  return {
    id: project.id,
    name: project.name,
    type: "project",
    // TODO: description - API에 없음
    description: undefined,
    // TODO: lastUpdated - API에 없음
    lastUpdated: undefined,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * ProjectTreeResponse를 TreeNodeData[] 배열로 변환
 */
export function convertProjectTreeResponse(
  response: ProjectTreeResponse,
): TreeNodeData[] {
  return response.projects.map(convertProjectTree);
}
