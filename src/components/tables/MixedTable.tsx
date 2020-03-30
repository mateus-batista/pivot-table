import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";

export type MixedTableProps<T> = {
  rowKeys: Array<keyof T>;
  columnKeys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  rowData: Dictionary<T, keyof T> & Countable;
  columnData: Dictionary<T, keyof T> & Countable;
};

type GetRowInputProps<T> = {
  data: any & Countable;
  rows: ReactElement[];
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  rowPositionMap?: Map<string, number>;
  rowKeyCountMap?: Map<string, number>;
  columnRootKey: keyof T;
  headerSection?: Map<string, ReactElement>;
  startHeader: number;
  startRow?: number;
  startColumn?: number;
  rowPath?: string;
};

type GetRowReturnProps<T> = {
  elements: ReactElement[];
  rowSpan: number;
  columnSpan: number;
  rowMap: Map<string, number>;
  resultMap: Map<string, number>;
  headerSection: Map<string, ReactElement>;
};

type GetColumnInputProps<T> = {
  data: any & Countable;
  columns: ReactElement[];
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  rowPositionMap: Map<string, number>;
  rootRowKey: keyof T;
  headerSection?: Map<string, ReactElement>;
  startHeader: number;
  startRow?: number;
  startColumn?: number;
  rowPath?: string;
  pathPositions?: Set<number>;
};

type GetColumnReturnProps<T> = {
  elements: ReactElement[];
  columnSpan: number;
  headerSection: Map<string, ReactElement>;
};

const TOTAL_ROW_ID = "totalRowID";

export function MixedTable<T>(props: MixedTableProps<T>) {
  const { rowData, columnData, rowKeys, columnKeys, keysMapping } = props;

  const countLinhas = rowKeys.length;
  const countColunas = columnKeys.length;

  const { elements, rowMap, resultMap, headerSection } = getRow({
    data: rowData,
    rows: [],
    keys: rowKeys,
    keysMapping,
    columnRootKey: columnKeys[0],
    startHeader: countColunas + 1,
    startRow: countColunas + 2
  });
  const { elements: table, headerSection: columnHeaderSection, columnSpan } = getColumn({
    data: columnData,
    columns: elements,
    keys: columnKeys,
    keysMapping,
    rowPositionMap: rowMap,
    rootRowKey: rowKeys[0],
    startHeader: countLinhas + 1,
    startRow: 1,
    startColumn: countLinhas + 2
  });

  const totaisColunasRowNumber = rowMap.get(TOTAL_ROW_ID) || 0;
  table.push(
    <div
      key={`${totaisColunasRowNumber} / ${columnSpan} / ${totaisColunasRowNumber + 1} / ${columnSpan + 1}`}
      style={{
        gridArea: `${totaisColunasRowNumber} / ${columnSpan} / ${totaisColunasRowNumber + 1} / ${columnSpan + 1}`
      }}
    >
      <b>{columnData.count}</b>
    </div>
  );
  table.push(
    <div
      key={`1 / ${columnSpan} / ${columnKeys.length + 1} / ${columnSpan + 1}`}
      style={{ gridArea: `1 / ${columnSpan} / ${columnKeys.length + 2} / ${columnSpan + 1}` }}
    >
      <b>Totais</b>
    </div>
  );
  resultMap.forEach((value, key) => {
    const r = rowMap.get(key) || 0;
    table.push(
      <div
        key={`${r}/${columnSpan}/${r + 1}/${columnSpan + 1}`}
        style={{ gridArea: `${r} / ${columnSpan} / ${r + 1} / ${columnSpan + 1}` }}
      >
        <b>{value}</b>
      </div>
    );
  });

  table.push(...Array.from(headerSection.values()));
  table.push(...Array.from(columnHeaderSection.values()));
  return (
    <>
      <div key="table" className="table result-table">
        {table}
      </div>
    </>
  );
}

function getRow<T>({
  data,
  rows,
  keys: rowKeys,
  keysMapping,
  rowPositionMap: rowMap = new Map<string, number>(),
  columnRootKey,
  headerSection = new Map(),
  rowKeyCountMap: resultMap = new Map<string, number>(),
  startHeader,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
}: GetRowInputProps<T>): GetRowReturnProps<T> {
  const linha = rowKeys[0];

  if (data.key === columnRootKey) {
    resultMap.set(rowPath, data.count);
  }

  if (!linha) {
    return {
      elements: rows,
      rowSpan: startRow + 1,
      columnSpan: startColumn + 1,
      rowMap: rowMap,
      resultMap,
      headerSection: headerSection
    };
  }

  let rowSpan = 0;
  let columnSpan = 0;
  rowKeys = [...rowKeys].splice(1, rowKeys.length);
  Object.keys(data)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const { elements: children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        data: data[key],
        rows: [],
        keys: rowKeys,
        keysMapping,
        rowPositionMap: rowMap,
        rowKeyCountMap: resultMap,
        columnRootKey,
        headerSection: headerSection,
        startHeader: startHeader,
        startRow: startRow,
        startColumn: startColumn + 1,
        rowPath: rowPath + key
      });

      const lastChild = rowKeys.length === 0;

      rowSpan = childrenRowSpan;
      columnSpan = childrenColumnSpan;

      const root = (
        <div
          key={`${startRow}/${startColumn}/${childrenRowSpan}/${lastChild ? startColumn + 2 : startColumn + 1}${key}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${childrenRowSpan} / ${
              lastChild ? startColumn + 2 : startColumn + 1
            }`
          }}
        >
          <b>{key}</b>
        </div>
      );
      headerSection.set(
        data.key,
        <div
          key={`${startHeader}/${startColumn}/${startHeader + 1}/${startColumn + 1}${data.key}`}
          style={{
            gridArea: `${startHeader} / ${startColumn} / ${startHeader + 1} / ${startColumn + 1}`
          }}
        >
          <b>{keysMapping.get(data.key)}</b>
        </div>
      );

      rowMap.set(rowPath + key, startRow.valueOf());

      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (data.key === linha) {
    headerSection.set(
      TOTAL_ROW_ID,
      <div
        key={`${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan}`}
        style={{
          gridArea: `${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan}`
        }}
      >
        <b>Totais</b>
      </div>
    );
    rowMap.set(TOTAL_ROW_ID, rowSpan);
  }

  return { elements: rows, rowSpan, columnSpan, rowMap, resultMap, headerSection };
}

function getColumn<T>({
  data,
  columns: rows,
  keys: columnKeys,
  keysMapping,
  rowPositionMap,
  rootRowKey,
  headerSection = new Map(),
  startHeader,
  startRow = 1,
  startColumn = 1,
  rowPath = "",
  pathPositions = new Set<number>()
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
  if (data instanceof Array) {
    const r = rowPositionMap.get(rowPath) || 0;
    pathPositions.add(r);
    rows.push(
      <div
        key={`${r}/${startColumn}/${r + 1}/${startColumn + 1}${data.length}`}
        style={{ gridArea: `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}` }}
      >
        {data.length}
      </div>
    );
    return { elements: rows, columnSpan: startColumn + 1, headerSection };
  }

  let columnSpan: number = 0;
  const rootKey = columnKeys.includes(data.key);
  columnKeys = [...columnKeys].splice(1, columnKeys.length);
  Object.keys(data)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const lastChild = columnKeys.length === 0;
      const { elements: children, columnSpan: childColumnSpan } = getColumn({
        data: data[key],
        columns: [],
        keys: columnKeys,
        keysMapping,
        rowPositionMap,
        rootRowKey,
        headerSection,
        startHeader,
        startRow: rootKey ? startRow + 1 : startRow,
        startColumn,
        rowPath: !rootKey ? rowPath + key : rowPath,
        pathPositions: new Set()
      });
      columnSpan = childColumnSpan;
      const root = (
        <div
          key={`${startRow}/${startColumn}/${lastChild ? startRow + 2 : startRow + 1}/${childColumnSpan}- ${key}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${lastChild ? startRow + 2 : startRow + 1} / ${childColumnSpan}`
          }}
        >
          <b>{key}</b>
        </div>
      );
      if (rootKey) {
        headerSection.set(
          data.key,
          <div
            key={`${startRow}/${startHeader}/${startRow + 1}/${startHeader + 1}${data.key}`}
            style={{
              gridArea: `${startRow} / ${startHeader} / ${startRow + 1} / ${startHeader + 1}`
            }}
          >
            <b>{keysMapping.get(data.key)}</b>
          </div>
        );
      }

      if (rootKey) {
        startColumn = childColumnSpan;
      }

      if (rootKey) {
        rows.push(root);
      }
      rows.push(...children);
    });

  if (data.key === rootRowKey) {
    const r = rowPositionMap.get(TOTAL_ROW_ID) || 0;
    headerSection.set(
      data.key + startColumn + "total",
      <div
        key={`${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}${data.key}`}
        style={{
          gridArea: `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <b>{data.count}</b>
      </div>
    );
    for (let i = startRow + 1; i < r; i++) {
      if (!pathPositions.has(i)) {
        rows.push(
          <span
            key={`${i}/${startColumn}/${i + 1}/${startColumn + 1}`}
            style={{ gridArea: `${i} / ${startColumn} / ${i + 1} / ${startColumn + 1}` }}
          ></span>
        );
      }
    }
  }

  return { elements: rows, columnSpan, headerSection };
}
