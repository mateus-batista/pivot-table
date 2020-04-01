import React, { useEffect, useState } from "react";
import "../css/Tabela.css";
import { TreeRoot, TreeRootKeys } from "../types/TreeRoot";
import { Board } from "./filter/Board";
import { HorizontalTable } from "./tables/HorizontalTable";
import { MixedTable } from "./tables/MixedTable";
import { VerticalTable } from "./tables/VerticalTable";
import { GroupResult } from "../classes/GroupResult";

export type PivotTableProps<T> = {
  data: T[];
  keyMapping: Map<keyof T, string>;
};

export type Dictionary<T extends any, K extends keyof T> = Record<T[K], T[]>;

export function PivotTable<T>(props: PivotTableProps<T>) {
  const { data, keyMapping } = props;

  const [dataKeyValues, setDataKeyValues] = useState<Map<keyof T, Set<string>>>();

  const [ignoredDataKeyValues, setIgnoredDataKeyValue] = useState<Map<keyof T, Set<string>>>();

  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);

  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);

  const [defaultTree, setDefaultTree] = useState<Dictionary<T, keyof T> & TreeRoot>();

  const [complemetaryTree, setComplementaryTree] = useState<Dictionary<T, keyof T> & TreeRoot>();

  const aggregatorKey = "duracao" as keyof T;
  function accumulator(accumulator: number, curr: T | number): number {
    let value: any;
    if (typeof curr === "number") {
      value = curr;
    } else {
      value = curr[aggregatorKey];
    }
    return (accumulator + value) / 2;
  }

  useEffect(() => {
    const uniqueKeysValues = new Map<keyof T, Set<string>>();

    const inicio = new Date().getTime();

    data.forEach((element: any) => {
      Object.keys(element).forEach(key => {
        let set = uniqueKeysValues.get(key as keyof T);
        if (!set) {
          set = new Set<string>();
          uniqueKeysValues.set(key as keyof T, set);
        }
        set.add(element[key]);
      });
    });

    console.log("key value agrupados em: ", (new Date().getTime() - inicio) / 1000);
    setDataKeyValues(uniqueKeysValues);
  }, [data]);

  useEffect(() => {
    const inicio = new Date().getTime();
    if (rowKeys.length > 0 && columnKeys.length > 0) {
      setComplementaryTree(group(data, [...columnKeys, ...rowKeys], ignoredDataKeyValues, accumulator));
    }
    setDefaultTree(group(data, [...rowKeys, ...columnKeys], ignoredDataKeyValues, accumulator));

    console.log("dados agrupados em: ", (new Date().getTime() - inicio) / 1000);
  }, [data, rowKeys, columnKeys, ignoredDataKeyValues]);

  const handleSubmit = (values: [Array<keyof T>, Array<keyof T>], ignoredFilter: Map<keyof T, Set<string>>) => {
    const [rowKeys, columnKeys] = values;
    setIgnoredDataKeyValue(ignoredFilter);
    setRowKeys(rowKeys);
    setColumnKeys(columnKeys);
    setDefaultTree(undefined);
    setComplementaryTree(undefined);
  };

  console.log("data", data);
  console.log("defaultTree", defaultTree);
  console.log("dataKeyValues", dataKeyValues);
  if (dataKeyValues) {
    return (
      <>
        <div className={"filter-table table"}>
          <Board keys={dataKeyValues} keyMapping={keyMapping} handleSubmit={handleSubmit} />
          <div className="table-bottomright">
            {defaultTree && complemetaryTree ? (
              <MixedTable
                rowData={defaultTree}
                columnData={complemetaryTree}
                columnKeys={columnKeys}
                rowKeys={rowKeys}
                keysMapping={keyMapping}
              />
            ) : defaultTree && rowKeys.length > 0 && columnKeys.length === 0 ? (
              <HorizontalTable data={defaultTree} keys={rowKeys} keysMapping={keyMapping} />
            ) : defaultTree && rowKeys.length === 0 && columnKeys.length > 0 ? (
              <VerticalTable data={defaultTree} keys={columnKeys} keysMapping={keyMapping} />
            ) : (
              <div>
                <b>{data.length}</b>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div>
        <b>Loading...</b>
      </div>
    );
  }
}

function group<T extends any, K extends keyof T>(
  arr: T[],
  keys: Array<K>,
  filterKeys?: Map<K, Set<String>>,
  accumulator?: (accumulator: number, curr: T | number) => number
): any & TreeRoot {
  let key = keys[0];

  if (!key) {
    if (accumulator) {
      return new GroupResult(arr.reduce(accumulator, 0));
    }
    return new GroupResult(arr.length);
  }
  const valuesToIgnore = filterKeys ? filterKeys.get(key) || null : null;

  const obj: T & TreeRoot = groupByKey(arr, key, valuesToIgnore);

  obj.key = key;

  let count = 0;
  Object.keys(obj)
    .filter(k => !TreeRootKeys.includes(k))
    .forEach(k => {
      const arr = obj[k];
      obj[k] = group(arr, keys.slice(1, keys.length), filterKeys, accumulator);
      if (accumulator) {
        count = accumulator(count, obj[k].value);
      } else {
        count += obj[k].value;
      }
    });
  obj.value = count;

  return obj;
}

function groupByKey<T extends any, K extends keyof T>(arr: T[], key: K, valuesToIgnore: Set<T[K]> | null) {
  return arr.reduce((result, curr) => {
    const keyValue = curr[key];

    if (valuesToIgnore != null && valuesToIgnore.has(keyValue)) {
      return result;
    }

    if (!result[keyValue]) {
      result[keyValue] = [];
    }

    result[keyValue].push(curr);

    return result;
  }, {} as Dictionary<T, K>);
}
