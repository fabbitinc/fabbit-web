import { useMemo } from "react";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type {
  OntologySchemaModel,
  RelationTargetInfoModel,
  TargetPropertyOptionModel,
} from "@/features/part-template-mapping/types/part-template-mapping-model";

const SAMPLE_DATA_MAX_COUNT = 3;

type ColumnBucketId = "Part" | "parent_part" | "Supplier" | "Drawing" | "Project" | "unmapped";

const REL_TYPE_TO_COLUMN: Record<string, ColumnBucketId> = {
  CONSISTS_OF: "parent_part",
  SUPPLIED_BY: "Supplier",
  DEFINED_BY: "Drawing",
  HAS_ITEM: "Project",
};

type BlockingIssueReason = "unselected_property" | "merge_key_missing";

interface BlockingIssue {
  columnId: ColumnBucketId;
  reason: BlockingIssueReason;
}

function buildTargetPropertyOptions(ontologySchema?: OntologySchemaModel): TargetPropertyOptionModel[] {
  if (!ontologySchema) {
    return [];
  }

  return ontologySchema.nodeLabels.flatMap((nodeLabel) =>
    nodeLabel.properties.map((property) => ({
      label: nodeLabel.label,
      property: property.name,
      description: property.description,
      required: property.required,
      dataType: property.dataType,
      isMergeKey: property.isMergeKey,
    })),
  );
}

export function useTemplateMappingDerivedState(ontologySchema?: OntologySchemaModel) {
  const columnMappings = usePartTemplateMappingStore((state) => state.columnMappings);
  const relationMappings = usePartTemplateMappingStore((state) => state.relationMappings);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const mappingSampleRows = usePartTemplateMappingStore((state) => state.mappingSampleRows);

  const targetPropertyOptions = useMemo(
    () => buildTargetPropertyOptions(ontologySchema),
    [ontologySchema],
  );

  const effectiveTargetOptions = useMemo(
    () => targetPropertyOptions.filter((option) => option.label === "Part"),
    [targetPropertyOptions],
  );

  const baseMappings = useMemo(
    () => columnMappings.filter((mapping) => !mapping.isExtended),
    [columnMappings],
  );

  const extendedMappings = useMemo(
    () => columnMappings.filter((mapping) => mapping.isExtended),
    [columnMappings],
  );

  const mergeKeysByLabel = useMemo(() => {
    const nodeLabels = ontologySchema?.nodeLabels ?? [];

    return nodeLabels.reduce<Record<string, string[]>>((accumulator, nodeLabel) => {
      const mergeKeysFromProperties = nodeLabel.properties
        .filter((property) => property.isMergeKey)
        .map((property) => property.name);

      accumulator[nodeLabel.label] =
        nodeLabel.mergeKeys.length > 0 ? nodeLabel.mergeKeys : mergeKeysFromProperties;

      return accumulator;
    }, {});
  }, [ontologySchema]);

  const targetPropertiesByLabel = useMemo(() => {
    const map = new Map<string, string[]>();

    targetPropertyOptions.forEach((option) => {
      if (!map.has(option.label)) {
        map.set(option.label, []);
      }

      const properties = map.get(option.label)!;
      if (!properties.includes(option.property)) {
        properties.push(option.property);
      }
    });

    return map;
  }, [targetPropertyOptions]);

  const relationTypeOptions = useMemo(() => {
    const schemaRelationTypes = ontologySchema?.relationshipTypes ?? [];

    if (schemaRelationTypes.length > 0) {
      return [...new Set(schemaRelationTypes.map((relationshipType) => relationshipType.relType))];
    }

    return [...new Set(relationMappings.map((mapping) => mapping.relType))];
  }, [ontologySchema, relationMappings]);

  const relationPropertyByType = useMemo(() => {
    const schemaRelationTypes = ontologySchema?.relationshipTypes ?? [];

    if (schemaRelationTypes.length > 0) {
      return schemaRelationTypes.reduce<Record<string, string[]>>((accumulator, relationshipType) => {
        if (!accumulator[relationshipType.relType]) {
          accumulator[relationshipType.relType] = [];
        }

        relationshipType.properties.forEach((property) => {
          if (!accumulator[relationshipType.relType].includes(property.name)) {
            accumulator[relationshipType.relType].push(property.name);
          }
        });

        return accumulator;
      }, {});
    }

    return relationMappings.reduce<Record<string, string[]>>((accumulator, mapping) => {
      const properties = Object.values(mapping.relColumns);
      if (!accumulator[mapping.relType]) {
        accumulator[mapping.relType] = [];
      }

      properties.forEach((property) => {
        if (property && !accumulator[mapping.relType].includes(property)) {
          accumulator[mapping.relType].push(property);
        }
      });

      return accumulator;
    }, {});
  }, [ontologySchema, relationMappings]);

  const relationTargetInfoByType = useMemo(() => {
    const schemaRelationTypes = ontologySchema?.relationshipTypes ?? [];
    const relationByType = new Map(
      schemaRelationTypes.map((relationshipType) => [relationshipType.relType, relationshipType]),
    );

    return relationTypeOptions.reduce<Record<string, RelationTargetInfoModel>>((accumulator, relType) => {
      const relationshipType = relationByType.get(relType);
      const fallbackRelation = relationMappings.find((mapping) => mapping.relType === relType);

      const targetLabel = relationshipType?.toLabel || fallbackRelation?.targetLabel || "";
      const targetMergeKeys = targetLabel ? (mergeKeysByLabel[targetLabel] || []) : [];
      const targetProperties = targetLabel ? (targetPropertiesByLabel.get(targetLabel) || []) : [];

      const targetColumnOptions =
        targetMergeKeys.length > 0
          ? [
              ...new Set(
                baseMappings
                  .filter(
                    (mapping) =>
                      mapping.approved && mapping.targetProperty && targetMergeKeys.includes(mapping.targetProperty),
                  )
                  .map((mapping) => mapping.sourceColumn),
              ),
            ]
          : [...mappingHeaders];

      accumulator[relType] = {
        targetLabel,
        targetMergeKeys,
        targetColumnOptions: targetColumnOptions.length > 0 ? targetColumnOptions : [...mappingHeaders],
        targetProperties,
      };

      return accumulator;
    }, {});
  }, [baseMappings, mappingHeaders, mergeKeysByLabel, ontologySchema, relationMappings, relationTypeOptions, targetPropertiesByLabel]);

  const selectableRelationTypeOptions = relationTypeOptions.filter((relType) => {
    const targetInfo = relationTargetInfoByType[relType];
    return Boolean(targetInfo && targetInfo.targetColumnOptions.length > 0);
  });

  const activeRelationMappings = relationMappings.filter((mapping) => !mapping.dismissed);

  const unmappedColumns = useMemo(() => {
    const mappedColumns = new Set([
      ...columnMappings.map((mapping) => mapping.sourceColumn),
      ...activeRelationMappings.flatMap((mapping) => Object.values(mapping.nodeColumns)),
      ...activeRelationMappings.flatMap((mapping) => Object.keys(mapping.relColumns)),
    ]);

    return mappingHeaders.filter((header) => !mappedColumns.has(header));
  }, [activeRelationMappings, columnMappings, mappingHeaders]);

  const approvedBaseCount = baseMappings.filter((mapping) => mapping.approved).length;
  const approvedRelationCount = activeRelationMappings.filter((mapping) => mapping.approved).length;
  const approvedExtendedCount = extendedMappings.filter((mapping) => mapping.approved).length;
  const totalMappings = baseMappings.length + activeRelationMappings.length + extendedMappings.length;
  const totalApproved = approvedBaseCount + approvedRelationCount + approvedExtendedCount;
  const excludedCount = unmappedColumns.length;
  const hasMappings = totalMappings > 0;

  const unselectedPartMappings = baseMappings.filter((mapping) => !mapping.targetProperty);
  const unselectedRelationMappings = activeRelationMappings.flatMap((mapping) =>
    Object.values(mapping.relColumns).filter((property) => !String(property || "").trim()),
  );

  const hasUnselectedPartMappings = unselectedPartMappings.length > 0;
  const hasUnselectedRelationMappings = unselectedRelationMappings.length > 0;
  const hasUnselectedMappings = hasUnselectedPartMappings || hasUnselectedRelationMappings;

  const partMergeKeys = mergeKeysByLabel.Part || [];
  const partMissingMergeKeys = partMergeKeys.filter(
    (mergeKey) => !baseMappings.some((mapping) => mapping.targetProperty === mergeKey),
  );
  const hasRequiredPartMergeKeys = partMergeKeys.length === 0 || partMissingMergeKeys.length === 0;

  const relationMergeKeyIssueByType = activeRelationMappings.reduce<Record<string, number>>(
    (accumulator, mapping) => {
      const mergeKeys = relationTargetInfoByType[mapping.relType]?.targetMergeKeys || [];
      if (mergeKeys.length === 0) {
        return accumulator;
      }

      const hasBasicProperty = Object.keys(mapping.nodeColumns).length > 0;
      if (!hasBasicProperty) {
        return accumulator;
      }

      const hasMergeKey = mergeKeys.some((mergeKey) => Boolean(mapping.nodeColumns[mergeKey]));
      if (!hasMergeKey) {
        accumulator[mapping.relType] = (accumulator[mapping.relType] || 0) + 1;
      }

      return accumulator;
    },
    {},
  );

  const hasRelationMergeKeyIssues = Object.keys(relationMergeKeyIssueByType).length > 0;
  const relationMergeKeyIssueCount = Object.values(relationMergeKeyIssueByType).reduce(
    (sum, count) => sum + count,
    0,
  );

  const blockingIssues = useMemo<BlockingIssue[]>(() => {
    const issues: BlockingIssue[] = [];

    unselectedPartMappings.forEach(() => {
      issues.push({ columnId: "Part", reason: "unselected_property" });
    });

    activeRelationMappings.forEach((mapping) => {
      const columnId = REL_TYPE_TO_COLUMN[mapping.relType] || "unmapped";

      Object.values(mapping.relColumns)
        .filter((property) => !String(property || "").trim())
        .forEach(() => {
          issues.push({ columnId, reason: "unselected_property" });
        });
    });

    partMissingMergeKeys.forEach(() => {
      issues.push({ columnId: "Part", reason: "merge_key_missing" });
    });

    Object.entries(relationMergeKeyIssueByType).forEach(([relType, count]) => {
      const columnId = REL_TYPE_TO_COLUMN[relType] || "unmapped";
      for (let index = 0; index < count; index += 1) {
        issues.push({ columnId, reason: "merge_key_missing" });
      }
    });

    return issues;
  }, [activeRelationMappings, partMissingMergeKeys, relationMergeKeyIssueByType, unselectedPartMappings]);

  const issueCountByColumn = useMemo(() => {
    return blockingIssues.reduce<Record<string, number>>((accumulator, issue) => {
      accumulator[issue.columnId] = (accumulator[issue.columnId] || 0) + 1;
      return accumulator;
    }, {});
  }, [blockingIssues]);

  const issueSummaryByColumn = useMemo(() => {
    const summaryMap = new Map<ColumnBucketId, Set<string>>();

    for (const issue of blockingIssues) {
      if (!summaryMap.has(issue.columnId)) {
        summaryMap.set(issue.columnId, new Set());
      }

      const messages = summaryMap.get(issue.columnId)!;
      if (issue.reason === "unselected_property") {
        messages.add("속성을 선택하지 않은 카드가 있습니다.");
      }

      if (issue.reason === "merge_key_missing") {
        messages.add("매칭키가 지정되지 않았습니다.");
      }
    }

    return Array.from(summaryMap.entries()).reduce<Record<string, string>>((accumulator, [columnId, messages]) => {
      accumulator[columnId] = Array.from(messages).join(" · ");
      return accumulator;
    }, {});
  }, [blockingIssues]);

  const getSampleData = (column: string) => {
    const uniqueValues = [
      ...new Set(
        mappingSampleRows
          .map((row) => row[column])
          .filter((value) => value != null && String(value).trim() !== "")
          .map((value) => String(value)),
      ),
    ];

    return uniqueValues.slice(0, SAMPLE_DATA_MAX_COUNT);
  };

  return {
    effectiveTargetOptions,
    targetPropertyOptions,
    baseMappings,
    extendedMappings,
    relationTypeOptions,
    relationPropertyByType,
    relationTargetInfoByType,
    selectableRelationTypeOptions,
    mergeKeysByLabel,
    activeRelationMappings,
    unmappedColumns,
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    hasUnselectedPartMappings,
    unselectedPartMappingsCount: unselectedPartMappings.length,
    hasUnselectedRelationMappings,
    unselectedRelationMappingsCount: unselectedRelationMappings.length,
    hasUnselectedMappings,
    hasRequiredPartMergeKeys,
    partMissingMergeKeys,
    relationMergeKeyIssueByType,
    hasRelationMergeKeyIssues,
    relationMergeKeyIssueCount,
    blockingIssues,
    issueCountByColumn,
    issueSummaryByColumn,
    blockingIssueCount: blockingIssues.length,
    getSampleData,
  };
}
