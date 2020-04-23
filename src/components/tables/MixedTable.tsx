import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { GroupResult } from "../../classes/GroupResult";

export type MixedTableProps<T> = {
  rowKeys: Array<keyof T>;
  columnKeys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  rowData: Dictionary<T, keyof T> & TreeRoot;
  columnData: Dictionary<T, keyof T> & TreeRoot;
};

type GetRowInputProps<T> = {
  data: any & TreeRoot;
  rows: ReactElement[];
  rowKeys: Array<keyof T>;
  columnRootKey: keyof T;
  rowPositionMap?: Map<string, number>;
  rowKeyCountMap?: Map<string, number>;
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
};

const TOTAL_ROW_ID = "totalRowID";

export function MixedTable<T>(props: MixedTableProps<T>) {
  const { rowData, columnData, rowKeys, columnKeys, keysMapping } = props;

  const countLinhas = rowKeys.length;
  const countColunas = columnKeys.length;

  const { elements, rowMap, resultMap, rowSpan, columnSpan: rowColumnSpan } = getRow({
    data: rowData,
    rows: [],
    rowKeys,
    columnRootKey: columnKeys[0],
    startRow: countColunas + 2,
  });

  const { elements: table, columnSpan } = getColumn({
    data: columnData,
    columns: elements,
    keys: columnKeys,
    rowPositionMap: rowMap,
    rootRowKey: rowKeys[0],
    startHeader: countLinhas + 1,
    startRow: 1,
    startColumn: countLinhas + 2,
  });

  table.push(
    ...getColumnHeader({
      keysMapping,
      columnKeys,
      startHeader: countLinhas + 1,
      totaisColunasRowNumber: rowMap.get(TOTAL_ROW_ID) || 0,
      columnSpan,
      rowData,
      resultMap,
      rowMap,
    })
  );
  table.push(...getRowHeader(rowKeys, keysMapping, countColunas + 1, rowSpan, rowColumnSpan));
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
  rowKeys,
  rowPositionMap: rowMap = new Map<string, number>(),
  columnRootKey,
  rowKeyCountMap: resultMap = new Map<string, number>(),
  startRow = 1,
  startColumn = 1,
  rowPath = "",
}: GetRowInputProps<T>): GetRowReturnProps<T> {
  const linha = rowKeys[0];

  if (data.key === columnRootKey) {
    resultMap.set(rowPath, data.value);
  }

  if (!linha) {
    return {
      elements: rows,
      rowSpan: startRow + 1,
      columnSpan: startColumn + 1,
      rowMap: rowMap,
      resultMap,
    };
  }

  let rowSpan = 0;
  let columnSpan = 0;
  rowKeys = [...rowKeys].splice(1, rowKeys.length);
  Object.keys(data)
    .filter((k) => !TreeRootKeys.includes(k))
    .forEach((key) => {
      const { elements: children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        data: data[key],
        rows: [],
        rowKeys,
        rowPositionMap: rowMap,
        rowKeyCountMap: resultMap,
        columnRootKey,
        startRow: startRow,
        startColumn: startColumn + 1,
        rowPath: rowPath + key,
      });

      const lastChild = rowKeys.length === 0;

      rowSpan = childrenRowSpan;
      columnSpan = childrenColumnSpan;

      const gridArea = `${startRow} / ${startColumn} / ${childrenRowSpan} / ${
        lastChild ? startColumn + 2 : startColumn + 1
      }`;
      const root = (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          <b>{key}</b>
        </div>
      );

      rowMap.set(rowPath + key, startRow.valueOf());

      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (data.key === linha) {
    rowMap.set(TOTAL_ROW_ID, rowSpan);
  }

  return { elements: rows, rowSpan, columnSpan, rowMap, resultMap };
}

function getRowHeader<T>(
  keys: Array<keyof T>,
  keysMapping: Map<keyof T, string>,
  startHeader: number,
  rowSpan: number,
  columnSpan: number
) {
  const header = keys.map((k, i) => {
    const gridArea = `${startHeader} / ${i + 1} / ${startHeader + 1} / ${i + 2}`;
    return (
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <b>{keysMapping.get(k)}</b>
      </div>
    );
  });
  const gridArea = `${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan}`;
  header.push(
    <div key={gridArea} style={{ gridArea: gridArea }}>
      <b>Totais</b>
    </div>
  );

  return header;
}

type GetColumnInputProps<T> = {
  data: any & TreeRoot;
  columns: ReactElement[];
  keys: Array<keyof T>;
  rowPositionMap: Map<string, number>;
  rootRowKey: keyof T;
  startHeader: number;
  startRow?: number;
  startColumn?: number;
  rowPath?: string;
  pathPositions?: Set<number>;
};

type GetColumnReturnProps<T> = {
  elements: ReactElement[];
  columnSpan: number;
};

function getColumn<T>({
  data,
  columns: rows,
  keys: columnKeys,
  rowPositionMap,
  rootRowKey,
  startHeader,
  startRow = 1,
  startColumn = 1,
  rowPath = "",
  pathPositions = new Set<number>(),
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
  if (data instanceof GroupResult) {
    const r = rowPositionMap.get(rowPath) || 0;
    pathPositions.add(r);
    const gridArea = `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}`;
    rows.push(
      <div key={gridArea} style={{ gridArea: gridArea }}>
        {data.value}
      </div>
    );
    return { elements: rows, columnSpan: startColumn + 1 };
  }

  let columnSpan: number = 0;
  const rootKey = columnKeys.includes(data.key);
  columnKeys = [...columnKeys].splice(1, columnKeys.length);
  Object.keys(data)
    .filter((k) => !TreeRootKeys.includes(k))
    .forEach((key) => {
      const lastChild = columnKeys.length === 0;
      const { elements: children, columnSpan: childColumnSpan } = getColumn({
        data: data[key],
        columns: [],
        keys: columnKeys,
        rowPositionMap,
        rootRowKey,
        startHeader,
        startRow: rootKey ? startRow + 1 : startRow,
        startColumn,
        rowPath: !rootKey ? rowPath + key : rowPath,
        pathPositions: new Set(),
      });
      columnSpan = childColumnSpan;
      const gridArea = `${startRow} / ${startColumn} / ${lastChild ? startRow + 2 : startRow + 1} / ${childColumnSpan}`;
      const root = (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          <b>{key}</b>
        </div>
      );

      if (rootKey) {
        startColumn = childColumnSpan;
        rows.push(root);
      }
      rows.push(...children);
    });

  if (data.key === rootRowKey) {
    const r = rowPositionMap.get(TOTAL_ROW_ID) || 0;
    const gridArea = `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}`;
    rows.push(
      <div
        key={gridArea}
        style={{
          gridArea: gridArea,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <b>{data.value}</b>
      </div>
    );
    for (let i = startRow + 1; i < r; i++) {
      if (!pathPositions.has(i)) {
        const gridArea = `${i} / ${startColumn} / ${i + 1} / ${startColumn + 1}`;
        rows.push(<span key={gridArea} style={{ gridArea: gridArea }}></span>);
      }
    }
  }
  return { elements: rows, columnSpan };
}

type GetColumnHeaderProps<T> = {
  keysMapping: Map<keyof T, string>;
  columnKeys: Array<keyof T>;
  startHeader: number;
  totaisColunasRowNumber: number;
  columnSpan: number;
  rowData: any & TreeRoot;
  resultMap: Map<string, number>;
  rowMap: Map<string, number>;
};
function getColumnHeader<T>({
  keysMapping,
  columnKeys,
  startHeader,
  totaisColunasRowNumber,
  columnSpan,
  rowData,
  resultMap,
  rowMap,
}: GetColumnHeaderProps<T>) {
  const header = columnKeys.map((k, i) => {
    const gridArea = `${i + 1} / ${startHeader} / ${i + 2} / ${startHeader + 1}`;
    return (
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <b>{keysMapping.get(k)}</b>
      </div>
    );
  });

  const totaisValueGridArea = `${totaisColunasRowNumber} / ${columnSpan} / ${totaisColunasRowNumber + 1} / ${
    columnSpan + 1
  }`;
  header.push(
    <div key={totaisValueGridArea} style={{ gridArea: totaisValueGridArea }}>
      <b>{rowData.value}</b>
    </div>
  );
  const totaisLabelGridArea = `1 / ${columnSpan} / ${columnKeys.length + 2} / ${columnSpan + 1}`;
  header.push(
    <div key={totaisLabelGridArea} style={{ gridArea: totaisLabelGridArea }}>
      <b>Totais</b>
    </div>
  );

  resultMap.forEach((value, key) => {
    const r = rowMap.get(key) || 0;
    const gridArea = `${r} / ${columnSpan} / ${r + 1} / ${columnSpan + 1}`;
    header.push(
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <b>{value}</b>
      </div>
    );
  });
  return header;
}
