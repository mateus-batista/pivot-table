import { TreeRoot } from "./TreeRoot";
import { Dictionary } from "../components/PivotTable";

export type SpanValue = {
  value: number;
};
export type InitialPosition = {
  iniPai?: InitialPosition;
  iniAux?: InitialPosition;
  spanAux?: SpanValue;
};

export type StackObj = {
  data: TreeRoot & any;
  spanTree?: SpanValue[];
  iniPai?: InitialPosition;
  path?: string;
  column?: number;
  row?: number;
};

export type Result<T> = {
  span: SpanValue;
  value: string | number;
  ini: InitialPosition;
  path: string;
  column?: number;
  row?: number;
  key: keyof T;
  total?: number;
};

/**
 *
 */

export type GetVerticalProps<T> = {
  results: Result<T>[];
  keys: Array<keyof T>;
  data: Dictionary<T, keyof T> & TreeRoot;
  keysMapping: Map<keyof T, string>;
  columnHeaderSpace?: number;
  mixedTable?: {
    rowResult: Result<T>[];
    rowTotalValues: Map<string, number>;
    totalKey: keyof T;
    totalRowNumber: number;
    cellPosition: Set<string>;
  };
};

export type GetHorinzontalProps<T> = {
  results: Result<T>[];
  keys: Array<keyof T>;
  data: Dictionary<T, keyof T> & TreeRoot;
  keysMapping: Map<keyof T, string>;
  headerSpace?: number;
  mixedTable?: {
    totalKey?: keyof T;
  };
};
