export interface AtributoValor {
  id: number;
  value: string;
}

export interface AtributoTipo {
  id: number;
  name: string;
  values: AtributoValor[];
}
