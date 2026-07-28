import { AtributoValor } from './atributo-valor';

export interface AtributoTipo {
  id: number;
  name: string;
  values: AtributoValor[];
}
