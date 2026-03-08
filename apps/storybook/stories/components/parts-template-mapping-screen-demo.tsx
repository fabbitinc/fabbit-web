import { useMemo, useState } from "react";
import {
  PARTS_TEMPLATE_MAPPING_PROPERTY_LABELS,
  PartsTemplateMappingWorkspace,
  type PartsTemplateMappingBoardColumn,
  type PartsTemplateMappingBoardColumnId,
  type PartsTemplateMappingBoardColumnMapping,
  type PartsTemplateMappingBoardProps,
  type PartsTemplateMappingBoardRelationMapping,
  type PartsTemplateMappingBoardRelationTargetInfo,
  type PartsTemplateMappingBoardTargetPropertyOption,
  type PartsTemplateMappingEmptyStateProps,
} from "@fabbit/components";

const MAPPING_HEADERS = [
  "품번",
  "품명",
  "조립품 품번",
  "공급사 코드",
  "공급사명",
  "도면 번호",
  "프로젝트 코드",
  "수량",
  "비고",
] as const;

const MAPPING_SAMPLE_ROWS = [
  {
    "공급사 코드": "SUP-014",
    "공급사명": "세명정밀",
    "도면 번호": "DWG-8821-A",
    "비고": "외주 가공품",
    "수량": 2,
    "조립품 품번": "ASM-2400",
    "프로젝트 코드": "PJ-ALPHA",
    "품명": "드라이브 브래킷",
    "품번": "DRV-001",
  },
  {
    "공급사 코드": "SUP-014",
    "공급사명": "세명정밀",
    "도면 번호": "DWG-8821-B",
    "비고": "리비전 확인 필요",
    "수량": 4,
    "조립품 품번": "ASM-2400",
    "프로젝트 코드": "PJ-ALPHA",
    "품명": "센서 하우징",
    "품번": "SNS-014",
  },
  {
    "공급사 코드": "SUP-021",
    "공급사명": "하나테크",
    "도면 번호": "DWG-9010-A",
    "비고": "",
    "수량": 1,
    "조립품 품번": "ASM-3100",
    "프로젝트 코드": "PJ-BETA",
    "품명": "메인 커버",
    "품번": "CVR-210",
  },
] satisfies Record<string, unknown>[];

const COLUMN_DEFINITIONS: Array<{
  color: string;
  id: PartsTemplateMappingBoardColumnId;
  title: string;
}> = [
  { id: "Part", title: "부품", color: "blue" },
  { id: "parent_part", title: "상위 부품", color: "indigo" },
  { id: "Supplier", title: "공급사", color: "emerald" },
  { id: "Drawing", title: "도면", color: "amber" },
  { id: "Project", title: "프로젝트", color: "violet" },
  { id: "unmapped", title: "미할당", color: "gray" },
];

const REL_TYPE_TO_COLUMN: Record<string, PartsTemplateMappingBoardColumnId> = {
  CONSISTS_OF: "parent_part",
  DEFINED_BY: "Drawing",
  HAS_ITEM: "Project",
  SUPPLIED_BY: "Supplier",
};

const COLUMN_TO_REL_TYPE: Record<
  Exclude<PartsTemplateMappingBoardColumnId, "Part" | "unmapped">,
  string
> = {
  Drawing: "DEFINED_BY",
  Project: "HAS_ITEM",
  Supplier: "SUPPLIED_BY",
  parent_part: "CONSISTS_OF",
};

const EFFECTIVE_TARGET_OPTIONS = [
  { label: "Part", property: "part_number" },
  { label: "Part", property: "name" },
  { label: "Part", property: "specification" },
  { label: "Part", property: "material" },
  { label: "Part", property: "revision" },
  { label: "Part", property: "description" },
] satisfies PartsTemplateMappingBoardTargetPropertyOption[];

const RELATION_TARGET_INFO_BY_TYPE = {
  CONSISTS_OF: {
    targetMergeKeys: ["part_number"],
    targetProperties: ["part_number", "name", "revision"],
  },
  DEFINED_BY: {
    targetMergeKeys: ["drawing_number"],
    targetProperties: ["drawing_number", "version", "status"],
  },
  HAS_ITEM: {
    targetMergeKeys: ["project_code"],
    targetProperties: ["project_code", "manager", "target_date"],
  },
  SUPPLIED_BY: {
    targetMergeKeys: ["code"],
    targetProperties: ["code", "company_name", "country"],
  },
} satisfies Record<string, PartsTemplateMappingBoardRelationTargetInfo>;

const RELATION_PROPERTY_BY_TYPE: Record<string, string[]> = {
  CONSISTS_OF: ["quantity", "find_number"],
  DEFINED_BY: ["reference_designator"],
  HAS_ITEM: ["sequence", "description"],
  SUPPLIED_BY: ["lead_time", "unit_cost"],
};

const MERGE_KEYS_BY_LABEL: Record<string, string[]> = {
  Drawing: ["drawing_number"],
  Part: ["part_number"],
  Project: ["project_code"],
  Supplier: ["code"],
};

const SAVED_MAPPINGS = [
  { id: "mapping-1", name: "부품 마스터 템플릿", version: 3 },
  { id: "mapping-2", name: "외주 부품 상세 템플릿", version: 1 },
];

type StoryScenario = "complete" | "missing-part-merge-key";

interface PartsTemplateMappingScreenDemoProps {
  emptyState?: PartsTemplateMappingEmptyStateProps;
  isLoadingBoard?: boolean;
  isSaving?: boolean;
  scenario?: StoryScenario;
}

function cloneColumnMappings(mappings: PartsTemplateMappingBoardColumnMapping[]) {
  return mappings.map((mapping) => ({ ...mapping }));
}

function cloneRelationMappings(mappings: PartsTemplateMappingBoardRelationMapping[]) {
  return mappings.map((mapping) => ({
    ...mapping,
    nodeColumns: { ...mapping.nodeColumns },
    relColumns: { ...mapping.relColumns },
  }));
}

function createInitialColumnMappings(
  scenario: StoryScenario,
): PartsTemplateMappingBoardColumnMapping[] {
  if (scenario === "missing-part-merge-key") {
    return cloneColumnMappings([
      { id: "cm-name", sourceColumn: "품번", targetProperty: "name", isExtended: false },
      { id: "cm-specification", sourceColumn: "품명", targetProperty: "specification", isExtended: false },
    ]);
  }

  return cloneColumnMappings([
    { id: "cm-part-number", sourceColumn: "품번", targetProperty: "part_number", isExtended: false },
    { id: "cm-name", sourceColumn: "품명", targetProperty: "name", isExtended: false },
  ]);
}

function createInitialRelationMappings(): PartsTemplateMappingBoardRelationMapping[] {
  return cloneRelationMappings([
    {
      id: "rm-parent-part",
      relType: "CONSISTS_OF",
      nodeColumns: { part_number: "조립품 품번" },
      relColumns: { 수량: "quantity" },
      dismissed: false,
    },
    {
      id: "rm-supplier",
      relType: "SUPPLIED_BY",
      nodeColumns: { code: "공급사 코드", company_name: "공급사명" },
      relColumns: {},
      dismissed: false,
    },
    {
      id: "rm-drawing",
      relType: "DEFINED_BY",
      nodeColumns: { drawing_number: "도면 번호" },
      relColumns: {},
      dismissed: false,
    },
    {
      id: "rm-project",
      relType: "HAS_ITEM",
      nodeColumns: { project_code: "프로젝트 코드" },
      relColumns: {},
      dismissed: false,
    },
  ]);
}

function getHeaderOrder(sourceColumn: string) {
  return MAPPING_HEADERS.indexOf(sourceColumn as (typeof MAPPING_HEADERS)[number]);
}

function sortColumnMappings(mappings: PartsTemplateMappingBoardColumnMapping[]) {
  return [...mappings].sort(
    (left, right) => getHeaderOrder(left.sourceColumn) - getHeaderOrder(right.sourceColumn),
  );
}

function createExtendedPropertyName(sourceColumn: string) {
  const hash = Array.from(sourceColumn).reduce(
    (accumulator, character) => ((accumulator * 31 + character.charCodeAt(0)) >>> 0),
    7,
  );

  const normalized = sourceColumn
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `_ext_${normalized || `col_${hash.toString(36)}`}`;
}

function getSampleData(sourceColumn: string) {
  const values = Array.from(
    new Set(
      MAPPING_SAMPLE_ROWS
        .map((row) => row[sourceColumn])
        .filter((value) => value != null && String(value).trim() !== "")
        .map((value) => String(value)),
    ),
  );

  return values.slice(0, 3);
}

function removeSourceColumnFromRelations(
  relationMappings: PartsTemplateMappingBoardRelationMapping[],
  sourceColumn: string,
) {
  return relationMappings.flatMap((mapping) => {
    const nextNodeColumns = Object.fromEntries(
      Object.entries(mapping.nodeColumns).filter(([, value]) => value !== sourceColumn),
    );
    const nextRelColumns = Object.fromEntries(
      Object.entries(mapping.relColumns).filter(([column]) => column !== sourceColumn),
    );

    if (Object.keys(nextNodeColumns).length === 0 && Object.keys(nextRelColumns).length === 0) {
      return [];
    }

    return [
      {
        ...mapping,
        dismissed: false,
        nodeColumns: nextNodeColumns,
        relColumns: nextRelColumns,
      },
    ];
  });
}

function buildBoardProps(
  columnMappings: PartsTemplateMappingBoardColumnMapping[],
  relationMappings: PartsTemplateMappingBoardRelationMapping[],
): PartsTemplateMappingBoardProps {
  const cardsByColumn: Record<PartsTemplateMappingBoardColumnId, PartsTemplateMappingBoardColumn["cards"]> = {
    Drawing: [],
    Part: [],
    Project: [],
    Supplier: [],
    parent_part: [],
    unmapped: [],
  };

  const activeRelationMappings = relationMappings.filter((mapping) => !mapping.dismissed);

  for (const mapping of columnMappings.filter((item) => !item.isExtended)) {
    cardsByColumn.Part.push({
      id: mapping.sourceColumn,
      sourceColumn: mapping.sourceColumn,
      targetProperty: mapping.targetProperty || null,
      confidence: mapping.targetProperty ? 100 : 0,
      approved: Boolean(mapping.targetProperty),
      isExtended: false,
      isRelation: false,
      sampleData: getSampleData(mapping.sourceColumn),
    });
  }

  for (const mapping of columnMappings.filter((item) => item.isExtended)) {
    cardsByColumn.Part.push({
      id: mapping.sourceColumn,
      sourceColumn: mapping.sourceColumn,
      targetProperty: mapping.targetProperty || null,
      confidence: 100,
      approved: true,
      isExtended: true,
      isRelation: false,
      sampleData: getSampleData(mapping.sourceColumn),
    });
  }

  for (const mapping of activeRelationMappings) {
    const columnId = REL_TYPE_TO_COLUMN[mapping.relType] ?? "unmapped";

    for (const [nodeProperty, sourceColumn] of Object.entries(mapping.nodeColumns) as Array<[string, string]>) {
      cardsByColumn[columnId].push({
        id: sourceColumn,
        sourceColumn,
        targetProperty: null,
        confidence: 100,
        approved: Boolean(nodeProperty),
        isExtended: false,
        isRelation: true,
        relNodeProperty: nodeProperty,
        relType: mapping.relType,
        sampleData: getSampleData(sourceColumn),
      });
    }

    for (const [sourceColumn, relProperty] of Object.entries(mapping.relColumns) as Array<[string, string]>) {
      cardsByColumn[columnId].push({
        id: sourceColumn,
        sourceColumn,
        targetProperty: null,
        confidence: relProperty ? 100 : 0,
        approved: Boolean(relProperty),
        isExtended: false,
        isRelation: true,
        relProperty,
        relType: mapping.relType,
        sampleData: getSampleData(sourceColumn),
      });
    }
  }

  const mappedColumns = new Set([
    ...columnMappings.map((mapping) => mapping.sourceColumn),
    ...activeRelationMappings.flatMap((mapping) => Object.values(mapping.nodeColumns)),
    ...activeRelationMappings.flatMap((mapping) => Object.keys(mapping.relColumns)),
  ]);

  for (const header of MAPPING_HEADERS) {
    if (mappedColumns.has(header)) {
      continue;
    }

    cardsByColumn.unmapped.push({
      id: header,
      sourceColumn: header,
      targetProperty: null,
      confidence: 0,
      approved: false,
      isExtended: false,
      isRelation: false,
      sampleData: getSampleData(header),
    });
  }

  return {
    columns: COLUMN_DEFINITIONS.map((column) => ({
      ...column,
      cards: [...cardsByColumn[column.id]].sort(
        (left, right) => getHeaderOrder(left.sourceColumn) - getHeaderOrder(right.sourceColumn),
      ),
    })),
    mappingHeaders: [...MAPPING_HEADERS],
    mappingSampleRows: MAPPING_SAMPLE_ROWS,
    effectiveTargetOptions: EFFECTIVE_TARGET_OPTIONS,
    columnMappings,
    propertyLabelByName: PARTS_TEMPLATE_MAPPING_PROPERTY_LABELS,
    relationMappings,
    relationPropertyByType: RELATION_PROPERTY_BY_TYPE,
    relationTargetInfoByType: RELATION_TARGET_INFO_BY_TYPE,
    mergeKeysByLabel: MERGE_KEYS_BY_LABEL,
    issueCountByColumn: {},
    issueSummaryByColumn: {},
    onMoveCard: () => undefined,
    onSetPartMapping: () => undefined,
    onSetRelationCardMapping: () => undefined,
    onRemoveColumnMapping: () => undefined,
    onRemoveExtendedMapping: () => undefined,
    onRemoveRelationCardMapping: () => undefined,
  };
}

function buildIssueState(
  columnMappings: PartsTemplateMappingBoardColumnMapping[],
  relationMappings: PartsTemplateMappingBoardRelationMapping[],
) {
  const baseMappings = columnMappings.filter((mapping) => !mapping.isExtended);
  const activeRelationMappings = relationMappings.filter((mapping) => !mapping.dismissed);

  const partMissingMergeKeys = MERGE_KEYS_BY_LABEL.Part.filter(
    (mergeKey) => !baseMappings.some((mapping) => mapping.targetProperty === mergeKey),
  );
  const unselectedPartMappings = baseMappings.filter((mapping) => !mapping.targetProperty);
  const unselectedRelationMappings = activeRelationMappings.flatMap((mapping) =>
    Object.values(mapping.relColumns).filter((property) => !String(property || "").trim()),
  );
  const relationMergeKeyIssueByType = activeRelationMappings.reduce<Record<string, number>>(
    (accumulator, mapping) => {
      const mergeKeys = RELATION_TARGET_INFO_BY_TYPE[mapping.relType]?.targetMergeKeys ?? [];

      if (mergeKeys.length === 0 || Object.keys(mapping.nodeColumns).length === 0) {
        return accumulator;
      }

      const hasMergeKey = mergeKeys.some((mergeKey) => Boolean(mapping.nodeColumns[mergeKey]));
      if (!hasMergeKey) {
        accumulator[mapping.relType] = (accumulator[mapping.relType] ?? 0) + 1;
      }

      return accumulator;
    },
    {},
  );

  const issueCountByColumn: Partial<Record<PartsTemplateMappingBoardColumnId, number>> = {};
  const issueSummaryByColumn: Partial<Record<PartsTemplateMappingBoardColumnId, string>> = {};

  if (unselectedPartMappings.length > 0 || partMissingMergeKeys.length > 0) {
    issueCountByColumn.Part =
      unselectedPartMappings.length + partMissingMergeKeys.length;
    issueSummaryByColumn.Part = [
      unselectedPartMappings.length > 0 ? "속성을 선택하지 않은 카드가 있습니다." : "",
      partMissingMergeKeys.length > 0 ? "매칭키가 지정되지 않았습니다." : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  for (const mapping of activeRelationMappings) {
    const columnId = REL_TYPE_TO_COLUMN[mapping.relType] ?? "unmapped";
    const unselectedCount = Object.values(mapping.relColumns).filter(
      (property) => !String(property || "").trim(),
    ).length;
    const missingMergeKeyCount = relationMergeKeyIssueByType[mapping.relType] ?? 0;

    if (unselectedCount + missingMergeKeyCount === 0) {
      continue;
    }

    issueCountByColumn[columnId] =
      (issueCountByColumn[columnId] ?? 0) + unselectedCount + missingMergeKeyCount;
    issueSummaryByColumn[columnId] = [
      unselectedCount > 0 ? "속성을 선택하지 않은 카드가 있습니다." : "",
      missingMergeKeyCount > 0 ? "매칭키가 지정되지 않았습니다." : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const hasMappings = baseMappings.length + activeRelationMappings.length + columnMappings.filter((mapping) => mapping.isExtended).length > 0;
  const hasUnselectedMappings =
    unselectedPartMappings.length > 0 || unselectedRelationMappings.length > 0;
  const hasRelationMergeKeyIssues = Object.keys(relationMergeKeyIssueByType).length > 0;

  const confirmDisabledReason = !hasMappings
    ? "매핑된 카드가 없습니다."
    : hasUnselectedMappings
      ? "속성을 선택하지 않은 카드가 있습니다."
      : partMissingMergeKeys.length > 0
        ? "부품 매칭키가 모두 지정되어야 합니다."
        : hasRelationMergeKeyIssues
          ? "관계 매핑의 매칭키를 확인해주세요."
          : undefined;

  return {
    confirmDisabledReason,
    issueCountByColumn,
    issueSummaryByColumn,
  };
}

export function PartsTemplateMappingScreenDemo({
  emptyState,
  isLoadingBoard = false,
  isSaving = false,
  scenario = "complete",
}: PartsTemplateMappingScreenDemoProps) {
  const [columnMappings, setColumnMappings] = useState(() => createInitialColumnMappings(scenario));
  const [relationMappings, setRelationMappings] = useState(createInitialRelationMappings);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const baseBoardProps = useMemo(
    () => buildBoardProps(columnMappings, relationMappings),
    [columnMappings, relationMappings],
  );
  const issueState = useMemo(
    () => buildIssueState(columnMappings, relationMappings),
    [columnMappings, relationMappings],
  );

  const handleRemoveColumnMapping = (mappingId: string) => {
    setColumnMappings((current) => current.filter((mapping) => mapping.id !== mappingId));
  };

  const handleRemoveExtendedMapping = (mappingId: string) => {
    setColumnMappings((current) => current.filter((mapping) => mapping.id !== mappingId));
  };

  const handleRemoveRelationCardMapping = (sourceColumn: string) => {
    setRelationMappings((current) => removeSourceColumnFromRelations(current, sourceColumn));
  };

  const handleSetPartMapping = (sourceColumn: string, targetProperty: string) => {
    setColumnMappings((current) => {
      const nextMappings = current.filter((mapping) => mapping.sourceColumn !== sourceColumn);

      if (!targetProperty) {
        return sortColumnMappings([
          ...nextMappings,
          {
            id: `cm-${sourceColumn}`,
            sourceColumn,
            targetProperty: "",
            isExtended: false,
          },
        ]);
      }

      if (targetProperty === "__extended__") {
        return sortColumnMappings([
          ...nextMappings,
          {
            id: `cm-${sourceColumn}`,
            sourceColumn,
            targetProperty: createExtendedPropertyName(sourceColumn),
            isExtended: true,
          },
        ]);
      }

      return sortColumnMappings([
        ...nextMappings,
        {
          id: `cm-${sourceColumn}`,
          sourceColumn,
          targetProperty,
          isExtended: false,
        },
      ]);
    });
  };

  const handleSetRelationCardMapping = (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => {
    setRelationMappings((current) => {
      const relationIndex = current.findIndex(
        (mapping) =>
          mapping.relType === relType &&
          (Object.values(mapping.nodeColumns).includes(sourceColumn) ||
            Object.keys(mapping.relColumns).includes(sourceColumn)),
      );

      if (relationIndex < 0) {
        return current;
      }

      return current
        .map((mapping, index) => {
          if (index !== relationIndex) {
            return mapping;
          }

          const nextNodeColumns = Object.fromEntries(
            Object.entries(mapping.nodeColumns).filter(([, value]) => value !== sourceColumn),
          );
          const nextRelColumns = Object.fromEntries(
            Object.entries(mapping.relColumns).filter(([column]) => column !== sourceColumn),
          );

          if (mappingType === "node" && property) {
            const existingSource = nextNodeColumns[property];
            if (existingSource && existingSource !== sourceColumn) {
              return mapping;
            }
            nextNodeColumns[property] = sourceColumn;
          } else {
            nextRelColumns[sourceColumn] = property;
          }

          return {
            ...mapping,
            dismissed: false,
            nodeColumns: nextNodeColumns,
            relColumns: nextRelColumns,
          };
        })
        .filter(
          (mapping) =>
            Object.keys(mapping.nodeColumns).length > 0 || Object.keys(mapping.relColumns).length > 0,
        );
    });
  };

  const handleMoveCard = (
    sourceColumn: string,
    fromColumnId: PartsTemplateMappingBoardColumnId,
    toColumnId: PartsTemplateMappingBoardColumnId,
  ) => {
    if (fromColumnId === toColumnId) {
      return;
    }

    if (toColumnId === "Part") {
      setColumnMappings((current) =>
        sortColumnMappings([
          ...current.filter((mapping) => mapping.sourceColumn !== sourceColumn),
          {
            id: `cm-${sourceColumn}`,
            sourceColumn,
            targetProperty: "",
            isExtended: false,
          },
        ]),
      );
      setRelationMappings((current) => removeSourceColumnFromRelations(current, sourceColumn));
      return;
    }

    setColumnMappings((current) => current.filter((mapping) => mapping.sourceColumn !== sourceColumn));

    if (toColumnId === "unmapped") {
      setRelationMappings((current) => removeSourceColumnFromRelations(current, sourceColumn));
      return;
    }

    const relType = COLUMN_TO_REL_TYPE[toColumnId];
    if (!relType) {
      return;
    }

    setRelationMappings((current) => {
      const nextMappings = removeSourceColumnFromRelations(current, sourceColumn);
      const relationIndex = nextMappings.findIndex((mapping) => mapping.relType === relType);

      if (relationIndex < 0) {
        return [
          ...nextMappings,
          {
            id: `rm-${relType.toLowerCase()}`,
            relType,
            nodeColumns: {},
            relColumns: { [sourceColumn]: "" },
            dismissed: false,
          },
        ];
      }

      return nextMappings.map((mapping, index) =>
        index === relationIndex
          ? {
              ...mapping,
              dismissed: false,
              relColumns: {
                ...mapping.relColumns,
                [sourceColumn]: "",
              },
            }
          : mapping,
      );
    });
  };

  return (
    <PartsTemplateMappingWorkspace
      boardProps={{
        ...baseBoardProps,
        issueCountByColumn: issueState.issueCountByColumn,
        issueSummaryByColumn: issueState.issueSummaryByColumn,
        onMoveCard: handleMoveCard,
        onSetPartMapping: handleSetPartMapping,
        onSetRelationCardMapping: handleSetRelationCardMapping,
        onRemoveColumnMapping: handleRemoveColumnMapping,
        onRemoveExtendedMapping: handleRemoveExtendedMapping,
        onRemoveRelationCardMapping: handleRemoveRelationCardMapping,
      }}
      confirmDisabledReason={issueState.confirmDisabledReason}
      emptyState={emptyState}
      fileName="모터_서브어셈블리_템플릿.xlsx"
      isLoadingBoard={isLoadingBoard}
      isSaveDialogOpen={isSaveDialogOpen}
      isSaving={isSaving}
      saveDialogKey={`부품 마스터 템플릿:${SAVED_MAPPINGS[0]?.id ?? "new"}:${SAVED_MAPPINGS.length}:${isSaveDialogOpen ? "open" : "closed"}`}
      saveDialogProps={{
        defaultMappingName: "부품 마스터 템플릿",
        isLoadingMappings: false,
        isSubmitting: isSaving,
        mappings: SAVED_MAPPINGS,
        onOpenChange: setIsSaveDialogOpen,
        onConfirm: () => setIsSaveDialogOpen(false),
      }}
      onCancelClick={() => undefined}
      onConfirmClick={() => {
        if (!issueState.confirmDisabledReason) {
          setIsSaveDialogOpen(true);
        }
      }}
      onResetClick={() => {
        setColumnMappings(createInitialColumnMappings(scenario));
        setRelationMappings(createInitialRelationMappings());
      }}
      onSaveDialogOpenChange={setIsSaveDialogOpen}
    />
  );
}
