import React, { useEffect, useState } from "react";
import "../css/Tabela.css";
import { Countable, CountableKeys } from "../types/Countable";
import { Board } from "./filter/Board";
import { HorizontalTable } from "./tables/HorizontalTable";
import { MixedTable } from "./tables/MixedTable";
import { VerticalTable } from "./tables/VerticalTable";

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

  const [defaultTree, setDefaultTree] = useState<Dictionary<T, keyof T> & Countable>();

  const [complemetaryTree, setComplementaryTree] = useState<Dictionary<T, keyof T> & Countable>();

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
      setComplementaryTree(group(data, [...columnKeys, ...rowKeys], ignoredDataKeyValues));
    }
    group2(data, [...columnKeys, ...rowKeys], ignoredDataKeyValues);
    setDefaultTree(group(data, [...rowKeys, ...columnKeys], ignoredDataKeyValues));

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
  filterKeys?: Map<K, Set<String>>
): any & Countable {
  let key = keys[0];

  if (!key) {
    return arr;
  }
  const valuesToIgnore = filterKeys ? filterKeys.get(key) || null : null;

  const obj: T & Countable = groupByKey(arr, key, valuesToIgnore);

  obj.key = key;

  let count = 0;
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(k => {
      const arr = obj[k];
      count += arr.length;
      obj[k] = group(arr, keys.slice(1, keys.length));
    });
  obj.count = count;

  return obj;
}

function group2<T extends any, K extends keyof T>(
  arr: T[],
  keys: Array<K>,
  filterKeys?: Map<K, Set<String>>
): any & Countable {
  let depth = 0;
  const x: Map<T & Countable, Array<K>> = new Map<T & Countable, Array<K>>();
  const key = keys[0];
  const valuesToIgnore = filterKeys ? filterKeys.get(key) || null : null;
  x.set(groupByKey(arr, key, valuesToIgnore), keys.slice(1, keys.length));
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const valuesToIgnore = filterKeys ? filterKeys.get(key) || null : null;
    const obj: T & Countable = groupByKey(arr, key, valuesToIgnore);
    console.log(obj);
    obj.key = key;
    let count = 0;
    Object.keys(obj)
      .filter(k => !CountableKeys.includes(k))
      .forEach(k => {
        const arr = obj[k];
        count += arr.length;
        x.set(obj, keys.slice(1, keys.length));
        //obj[k] = group(arr, keys.slice(1, keys.length));
      });
    obj.count = count;
    depth = depth + 1;
  }
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
