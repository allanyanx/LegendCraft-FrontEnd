export interface AttributeValueResponse {
  id: number;
  value: string;
}

export interface AttributeTypeResponse {
  id: number;
  name: string;
  values: AttributeValueResponse[];
}

export interface AttributeTypeCreateRequest {
  name: string;
}

export interface AttributeValueCreateRequest {
  attributeTypeId: number;
  value: string;
}
