import { Dictionary, groupBy } from "lodash";
import React, { useEffect, useState } from "react";
// import generated from "../data/generated.json";
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

export function PivotTable<T>(props: PivotTableProps<T>) {
  const { data, keyMapping } = props;

  const [dataKeyValues, setDataKeyValues] = useState<Map<keyof T, Set<string>>>();

  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);

  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);

  const [defaultTree, setDefaultTree] = useState<Dictionary<T> & Countable>();

  const [complemetaryTree, setComplementaryTree] = useState<Dictionary<T> & Countable>();

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
      setComplementaryTree(group(data, [...columnKeys, ...rowKeys]));
    }
    setDefaultTree(group(data, [...rowKeys, ...columnKeys]));

    console.log("dados agrupados em: ", (new Date().getTime() - inicio) / 1000);
  }, [data, rowKeys, columnKeys]);

  const handleSubmit = (values: [Array<keyof T>, Array<keyof T>]) => {
    const [rowKeys, columnKeys] = values;

    setRowKeys(rowKeys);
    setColumnKeys(columnKeys);
    setDefaultTree(undefined);
    setComplementaryTree(undefined);
  };

  if (dataKeyValues) {
    return (
      <>
        <div className={"filter-table table"}>
          <Board keys={Array.from(dataKeyValues.keys())} keyMapping={keyMapping} handleSubmit={handleSubmit} />
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

function group<T>(arr: T[], keys: Array<keyof T>): any & Countable {
  let key = keys[0];

  if (!key) {
    return arr;
  }

  const obj: Dictionary<T[]> & Countable = groupBy(arr, key);

  obj.key = key as string;
  obj.count = arr.length;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(k => {
      const arr = obj[k];
      obj[k] = group(arr, keys.slice(1, keys.length));
    });

  return obj;
}
