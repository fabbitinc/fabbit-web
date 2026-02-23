// ─── Ontology ───

export interface PropertySchemaDTO {
  name: string;
  description: string;
  data_type: string;
  required: boolean;
  is_merge_key: boolean;
}

export interface NodeLabelSchemaDTO {
  label: string;
  description: string;
  properties: PropertySchemaDTO[];
  merge_keys: string[];
}

export interface RelationshipTypeSchemaDTO {
  rel_type: string;
  description: string;
  from_label: string;
  to_label: string;
  properties: PropertySchemaDTO[];
}

export interface OntologySchemaResponse {
  name: string;
  description: string;
  node_labels: NodeLabelSchemaDTO[];
  relationship_types: RelationshipTypeSchemaDTO[];
}

// ─── Node Search ───

export interface NodeSearchItem {
  value: string;
  label?: string | null;
}

export interface NodeSearchResponse {
  node_label: string;
  items: NodeSearchItem[];
}
