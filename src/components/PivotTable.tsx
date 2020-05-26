import { VFlow } from "bold-ui";
import React, { useEffect, useState } from "react";
import { GroupResult } from "../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../types/TreeRoot";
import { Board } from "./filter/Board";
import { PivotTableRender } from "./tables/PivotTableRender";

export type PivotTableProps<T extends any> = {
  data: T[];
  keyMapping: Map<keyof T, string>;
};

export type Dictionary<T extends any, K extends keyof T> = Record<T[K], T[]>;

export function PivotTable<T>(props: PivotTableProps<T>) {
  const { data, keyMapping } = props;

  const [dataKeyValues, setDataKeyValues] = useState<Map<keyof T, Array<string>>>();

  const [ignoredDataKeyValues, setIgnoredDataKeyValue] = useState<Map<keyof T, Set<string>>>();

  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);

  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);

  const [defaultTree, setDefaultTree] = useState<Dictionary<T, keyof T> & TreeRoot>();

  const [complemetaryTree, setComplementaryTree] = useState<Dictionary<T, keyof T> & TreeRoot>();

  const [aggregator, setAggregator] = useState<any>();

  const [aggregatorKey, setAggregatorKey] = useState<keyof T>();

  const handleAggregatorKey = (key: keyof T) => setAggregatorKey(key);
  const handleAggregator = (fun: ((values: number[]) => number) | undefined) => {
    setAggregator(() => fun);
  };

  useEffect(() => {
    const tempKeysValues = new Map<keyof T, Set<string>>();

    data.forEach((element: any) => {
      Object.keys(element).forEach((key) => {
        let set = tempKeysValues.get(key as keyof T);
        if (!set) {
          set = new Set<string>();
          tempKeysValues.set(key as keyof T, set);
        }
        set.add(element[key]);
      });
    });
    const uniqueKeysValues = new Map<keyof T, Array<string>>();
    for (const [key, value] of tempKeysValues) {
      uniqueKeysValues.set(key, Array.from(value).sort());
    }
    setDataKeyValues(uniqueKeysValues);
  }, [data]);

  useEffect(() => {
    if (rowKeys.length > 0 && columnKeys.length > 0) {
      const complemetaryTreeTime = new Date().getTime();
      console.debug("Building complementary tree...");
      setComplementaryTree(group(data, [...columnKeys, ...rowKeys], ignoredDataKeyValues, aggregator, aggregatorKey));
      console.debug("Building complementary tree took " + (new Date().getTime() - complemetaryTreeTime));
    }
    const defaultTreeTime = new Date().getTime();
    console.debug("Building default tree...");
    setDefaultTree(group(data, [...rowKeys, ...columnKeys], ignoredDataKeyValues, aggregator, aggregatorKey));
    console.debug("Building default tree took " + (new Date().getTime() - defaultTreeTime));
  }, [data, rowKeys, columnKeys, ignoredDataKeyValues, aggregator, aggregatorKey]);

  const handleSubmit = (values: [Array<keyof T>, Array<keyof T>], newIgnoredFilter: Map<keyof T, Set<string>>) => {
    const [newRowKeys, newColumnKeys] = values;
    if (dataKeyValues !== undefined) {
      for (const [key, filterSet] of newIgnoredFilter) {
        const keySet = dataKeyValues.get(key) || new Array<string>();
        if (filterSet.size >= keySet.length) {
          alert("deu pau");
          return 0;
        }
      }
    }
    setIgnoredDataKeyValue(newIgnoredFilter);
    setRowKeys(newRowKeys);
    setColumnKeys(newColumnKeys);

    if (newRowKeys !== rowKeys || newColumnKeys !== columnKeys || newIgnoredFilter !== ignoredDataKeyValues) {
      setDefaultTree(undefined);
      setComplementaryTree(undefined);
    }
  };

  if (dataKeyValues) {
    return (
      <VFlow>
        <Board<T>
          keys={dataKeyValues}
          keyMapping={keyMapping}
          handleSubmit={handleSubmit}
          sample={data[0]}
          handleAggregatorChange={handleAggregator}
          handleAggregatorKeyChange={handleAggregatorKey}
        />

        {defaultTree && complemetaryTree ? (
          <PivotTableRender
            rowData={defaultTree}
            rowKeys={rowKeys}
            columnData={complemetaryTree}
            columnKeys={columnKeys}
            keysMapping={keyMapping}
          />
        ) : defaultTree && rowKeys.length > 0 && columnKeys.length === 0 ? (
          <PivotTableRender rowData={defaultTree} rowKeys={rowKeys} keysMapping={keyMapping} />
        ) : defaultTree && rowKeys.length === 0 && columnKeys.length > 0 ? (
          <PivotTableRender columnData={defaultTree} columnKeys={columnKeys} keysMapping={keyMapping} />
        ) : (
          <div>
            <b>Total: {defaultTree && defaultTree.value}</b>
          </div>
        )}
      </VFlow>
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
  aggregator?: (values: number[]) => number,
  aggregatorKey?: keyof T
): any & TreeRoot {
  let key = keys[0];

  if (!key) {
    if (aggregator && aggregatorKey) {
      return new GroupResult(aggregator(arr.map((v) => v[aggregatorKey])));
    }
    return new GroupResult(arr.length);
  }

  const obj: T & TreeRoot = groupByKey(arr, key, filterKeys);

  obj.key = key;

  let count: number[] = [];
  Object.keys(obj)
    .filter((k) => !TreeRootKeys.includes(k))
    .forEach((k) => {
      const arr = obj[k];
      obj[k] = group(arr, keys.slice(1, keys.length), filterKeys, aggregator, aggregatorKey);
      count.push(obj[k].value);
    });

  if (aggregator && aggregatorKey) {
    obj.value = aggregator(count);
  } else {
    obj.value = count.reduce((prev, curr) => prev + curr, 0);
  }

  return obj;
}

function groupByKey<T extends any, K extends keyof T>(arr: T[], key: K, valuesToIgnore?: Map<K, Set<String>>) {
  return arr.reduce((result, curr) => {
    const keyValue = curr[key];

    if (valuesToIgnore) {
      for (let [ignoredKey, values] of valuesToIgnore) {
        const ignoredValue = curr[ignoredKey];
        if (values.has(ignoredValue)) {
          return result;
        }
      }
    }

    if (!result[keyValue]) {
      result[keyValue] = [];
    }

    result[keyValue].push(curr);

    return result;
  }, {} as Dictionary<T, K>);
}
