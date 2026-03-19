export function buildPartDetailPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}`;
}

export function buildPartEditPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}/edit`;
}

export function buildPartBomPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}/bom`;
}

export function buildPartTemplateAnalysisPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}/templates`;
}

export function buildPartTemplateProcessingPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}/templates/processing`;
}

export function buildPartTemplateMappingPath(partId: string, revisionId: string): string {
  return `/parts/${partId}/revisions/${revisionId}/templates/mapping`;
}
