import { VFlow } from "bold-ui";
import React, { useEffect, useState } from "react";
import { GroupResult } from "../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../types/TreeRoot";
import { Board } from "./filter/Board";
import { PivotTableRender, PivotCsvRender } from "./table/PivotTableRender";

export type PivotTableProps<T extends any> = {
  data: T[];
  keyMapping: Map<keyof T, string>;
};

export type Dictionary<T extends any, K extends keyof T> = Record<T[K], T[]>;

export function PivotTable<T>(props: PivotTableProps<T>) {
  const { data, keyMapping } = props;

  const [dataKeyValues, setDataKeyValues] = useState<Map<keyof T, Array<string>>>();

  const [filterDataKeyValues, setFilterDataKeyValue] = useState<Map<keyof T, Set<string>>>();

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
    tempKeysValues.forEach((value, key) => uniqueKeysValues.set(key, Array.from(value).sort()));

    setDataKeyValues(uniqueKeysValues);
  }, [data]);

  useEffect(() => {
    if (rowKeys.length > 0 && columnKeys.length > 0) {
      setComplementaryTree(group(data, [...columnKeys, ...rowKeys], filterDataKeyValues, aggregator, aggregatorKey));
    }
    setDefaultTree(group(data, [...rowKeys, ...columnKeys], filterDataKeyValues, aggregator, aggregatorKey));
  }, [data, rowKeys, columnKeys, filterDataKeyValues, aggregator, aggregatorKey]);

  const handleSubmit = (values: [Array<keyof T>, Array<keyof T>], newFilters: Map<keyof T, Set<string>>) => {
    const [newRowKeys, newColumnKeys] = values;

    if (newRowKeys.length === 0 && newColumnKeys.length === 0) {
      alert("Nenhuma linha/coluna selecionada.");
      return;
    }

    for (let rowKey of newRowKeys) {
      const size = newFilters?.get(rowKey)?.size;
      if (!size) {
        alert("Nenhum valor selecionado para as linhas aplicadas.");
        return;
      } else if (size && size > 50) {
        alert("O limite de 50 valores para uma chave foi excedido, filtre mais itens.");
        return;
      }
    }

    for (let columnKey of newColumnKeys) {
      const size = newFilters?.get(columnKey)?.size;

      if (!size) {
        alert("Nenhum valor selecionado para as colunas aplicadas.");
        return;
      } else if (size && size > 50) {
        alert("O limite de 50 valores para uma chave foi excedido, filtre mais itens.");
        return;
      }
    }

    setFilterDataKeyValue(newFilters);
    setRowKeys(newRowKeys);
    setColumnKeys(newColumnKeys);

    if (newRowKeys !== rowKeys || newColumnKeys !== columnKeys || newFilters !== filterDataKeyValues) {
      setDefaultTree(undefined);
      setComplementaryTree(undefined);
    }
  };

  const handleCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (rowKeys && columnKeys) {
      const csvTable = PivotCsvRender<T>({
        rowData: defaultTree,
        rowKeys,
        columnData: complemetaryTree,
        columnKeys,
        keysMapping: keyMapping,
      });
      csvTable.forEach((line, idl) => {
        line.forEach((column, idc) => {
          csvContent += column;
        });
        csvContent += "\n";
      });
    }
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    link.click();
  };

  if (dataKeyValues) {
    return (
      <VFlow>
        <Board<T>
          keys={dataKeyValues}
          keyMapping={keyMapping}
          handleSubmit={handleSubmit}
          handleCsv={handleCsv}
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
      const groupResult = group(arr, keys.slice(1, keys.length), filterKeys, aggregator, aggregatorKey);
      if (
        !(groupResult instanceof GroupResult) &&
        Object.keys(groupResult).filter((k) => !TreeRootKeys.includes(k)).length === 0
      ) {
        delete obj[k];
      } else {
        obj[k] = groupResult;
        count.push(obj[k].value);
      }
    });

  if (aggregator && aggregatorKey) {
    obj.value = aggregator(count);
  } else {
    obj.value = count.reduce((prev, curr) => prev + curr, 0);
  }

  return obj;
}

function groupByKey<T extends any, K extends keyof T>(arr: T[], key: K, filterKeys?: Map<K, Set<String>>) {
  return arr.reduce((result, curr) => {
    const keyValue = curr[key];

    if (!filterKeys?.get(key)?.has(keyValue)) {
      return result;
    }

    if (!result[keyValue]) {
      result[keyValue] = [];
    }

    result[keyValue].push(curr);

    return result;
  }, {} as Dictionary<T, K>);
}
