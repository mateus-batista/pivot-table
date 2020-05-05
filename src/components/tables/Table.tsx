import React, { ReactElement } from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";
import { TableWrapper, HeaderWrapper } from "./ElementWrappers";

export type TableProps<T> = {
  keysMapping: Map<keyof T, string>;
  rowKeys?: Array<keyof T>;
  columnKeys?: Array<keyof T>;
  rowData?: Dictionary<T, keyof T> & TreeRoot;
  columnData?: Dictionary<T, keyof T> & TreeRoot;
};

const RESULT_PATH_KEY = "RESULT";

export function Table<T>(props: TableProps<T>) {
  const { rowKeys, columnKeys, rowData, columnData, keysMapping } = props;

  const table: ReactElement[] = [];

  if (rowData && rowKeys && columnData && columnKeys) {
    const rowResult = getResult(rowData, "column", rowKeys);
    console.log(rowResult);
    const [divs, mixedTotals, totalRowNumber] = getHorizontal({
      results: rowResult,
      keys: rowKeys,
      data: rowData,
      keysMapping,
      headerSpace: columnKeys.length + 1,
      mixedTable: {
        mixedTableTotalKey: columnKeys[0],
      },
    });
    table.push(...divs);
    const columnResult = getResult(columnData, "row", columnKeys);

    table.push(
      ...getVertical<T>({
        results: columnResult,
        keys: columnKeys,
        data: columnData,
        keysMapping,
        columnHeaderSpace: rowKeys.length + 1,
        mixedTable: {
          mixedTableRowResult: rowResult,
          rowTotals: mixedTotals,
          mixedTableTotalKey: rowKeys[0],
          mixedTableTotalRowNumber: totalRowNumber,
        },
      })
    );
  } else if (rowData && rowKeys) {
    const rowResult = getResult(rowData, "column");
    console.log(rowResult);
    const [divs] = getHorizontal<T>({ results: rowResult, keys: rowKeys, data: rowData, keysMapping, headerSpace: 2 });
    table.push(...divs);
  } else if (columnData && columnKeys) {
    const columnResult = getResult(columnData, "row");
    table.push(
      ...getVertical<T>({ results: columnResult, keys: columnKeys, data: columnData, keysMapping })
    );
  }
  return <TableWrapper>{table}</TableWrapper>;
}

type GetHorinzontalProps<T> = {
  results: Result<T>[];
  keys: Array<keyof T>;
  data: Dictionary<T, keyof T> & TreeRoot;
  keysMapping: Map<keyof T, string>;
  headerSpace?: number;
  mixedTable?: {
    mixedTableTotalKey?: keyof T;
  };
};

function getHorizontal<T>({
  results,
  keys,
  data,
  keysMapping,
  headerSpace = 1,
  mixedTable,
}: GetHorinzontalProps<T>): [ReactElement[], Map<string, number>, number] {
  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs: ReactElement[] = [];
  const mixedTableTotals = new Map<string, number>();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (mixedTable && result.key === mixedTable.mixedTableTotalKey) {
      mixedTableTotals.set(result.path.replace(result.value.toString(), ""), result.total || 0);
    }
    if (mixedTable && !keys.includes(result.key)) {
      continue;
    }
    const lastKey = mixedTable && result.key === keys[keys.length - 1];
    const value = result.value;
    const rowSpan = result.span.value;
    const startColumn = result.column || 0;
    const endColumn = lastKey ? startColumn + 2 : startColumn + 1;
    const startRow = getIni(result.ini) + headerSpace;
    const endRow = startRow + rowSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    const gridArea = `${startRow} / ${startColumn} / ${endRow} / ${endColumn} `;
    divs.push(
      <div key={gridArea} data-endcolumn={result.key === RESULT_PATH_KEY && !mixedTable} style={{ gridArea: gridArea }}>
        {result.key !== RESULT_PATH_KEY ? <b>{value}</b> : value}
      </div>
    );
  }
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const gridArea = `${headerSpace} / ${i + 1} / ${headerSpace + 1} / ${i + 2} `;
    divs.push(
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <HeaderWrapper>{keysMapping.get(k)}</HeaderWrapper>
      </div>
    );
  }

  if (!mixedTable) {
    const totaisGridArea = `${headerSpace} / ${maxEndColumn} / ${headerSpace + 1} / ${maxEndColumn + 1} `;
    const totalGridArea = `${maxEndRow} / 1 / ${maxEndRow + 1} / ${maxEndColumn} `;
    const totalValueGridArea = `${maxEndRow} / ${maxEndColumn} / ${maxEndRow + 1} / ${maxEndColumn + 1} `;
    divs.push(
      <div key={totaisGridArea} data-endcolumn={true} style={{ gridArea: totaisGridArea }}>
        <b>TOTAIS</b>
      </div>,
      <div key={totalGridArea} data-endrow={true} style={{ gridArea: totalGridArea }}>
        <b>TOTAL</b>
      </div>,
      <div key={totalValueGridArea} data-endrow={true} data-endcolumn={true} style={{ gridArea: totalValueGridArea }}>
        <b>{data.value}</b>
      </div>
    );
  } else {
    const gridArea = `${maxEndRow} / 1 / ${maxEndRow + 1} / ${keys.length + 2} `;
    divs.push(
      <div key={gridArea} data-endrow={true} style={{ gridArea: gridArea }}>
        <b>TOTAIS</b>
      </div>
    );
  }

  return [divs, mixedTableTotals, maxEndRow];
}

type GetVerticalProps<T> = {
  results: Result<T>[];
  keys: Array<keyof T>;
  data: Dictionary<T, keyof T> & TreeRoot;
  keysMapping: Map<keyof T, string>;
  columnHeaderSpace?: number;
  mixedTable?: {
    mixedTableRowResult: Result<T>[];
    rowTotals: Map<string, number>;
    mixedTableTotalKey: keyof T;
    mixedTableTotalRowNumber: number;
  };
};

function getVertical<T>({
  results,
  keys,
  data,
  keysMapping,
  columnHeaderSpace = 1,
  mixedTable,
}: GetVerticalProps<T>): ReactElement[] {
  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs: ReactElement[] = [];
  const mixedTableStartRowCache = new Map<string, number>();
  const mixedTableColumnTotals = new Map<number, number>();
  const cellPositions = new Set<string>();
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    let value = result.value;
    const columnSpan = result.span.value;
    let startRow = result.row || 0;
    let startColumn = getIni(result.ini) + columnHeaderSpace;
    if (mixedTable && result.key === mixedTable.mixedTableTotalKey) {
      mixedTableColumnTotals.set(startColumn, result.total || 0);
    }
    if (mixedTable && !keys.includes(result.key) && result.key !== RESULT_PATH_KEY) {
      continue;
    }
    if (mixedTable && mixedTable.mixedTableRowResult && result.key === RESULT_PATH_KEY) {
      const rows = mixedTable.mixedTableRowResult.filter((rx) => result.path.indexOf(rx.path) !== -1);
      startRow = getIni(rows[rows.length - 1].ini) + keys.length + 1;
      startColumn = getIni(result.ini.iniPai) + columnHeaderSpace;
      mixedTableStartRowCache.set(rows[rows.length - 1].path, startRow);
    }
    const lastKey = mixedTable && result.key === keys[keys.length - 1];
    const endRow = lastKey ? startRow + 2 : startRow + 1;
    const endColumn = startColumn + columnSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    const gridArea = `${startRow} / ${startColumn} / ${endRow} / ${endColumn}`;
    divs.push(
      <div key={gridArea} data-endrow={result.key === RESULT_PATH_KEY && !mixedTable} style={{ gridArea: gridArea }}>
        {result.key !== RESULT_PATH_KEY ? <b>{value}</b> : value}
      </div>
    );
    cellPositions.add(gridArea);
  }
  divs.push(
    ...keys.map((k, i) => {
      const gridArea = `${i + 1} / ${columnHeaderSpace} / ${i + 2} / ${columnHeaderSpace + 1} `;
      return (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          <HeaderWrapper>{keysMapping.get(k)}</HeaderWrapper>
        </div>
      );
    })
  );
  if (!mixedTable) {
    const totaisGridArea = `${maxEndRow - 1} / 1 / ${maxEndRow} / 2`;
    const totalGridArea = `1 / ${maxEndColumn + 1} / ${maxEndRow - 1} / ${maxEndColumn + 2}`;
    const totalValueGridArea = `${maxEndRow - 1} / ${maxEndColumn + 1} / ${maxEndRow} / ${maxEndColumn + 2}`;
    divs.push(
      <div key={totaisGridArea} data-endrow={true} style={{ gridArea: totaisGridArea }}>
        <b>TOTAIS</b>
      </div>,
      <div key={totalGridArea} data-endcolumn={true} style={{ gridArea: totalGridArea }}>
        <b>TOTAL</b>
      </div>,
      <div key={totalValueGridArea} data-endrow={true} data-endcolumn={true} style={{ gridArea: totalValueGridArea }}>
        <b>{data.value}</b>
      </div>
    );
  } else {
    const keysGapCellGridArea = `${keys.length + 1} / ${columnHeaderSpace} / ${keys.length + 2} / ${
      columnHeaderSpace + 1
    }`;
    divs.push(<div key={keysGapCellGridArea} style={{ gridArea: keysGapCellGridArea }}></div>);
    const totalRowNumber = mixedTable.mixedTableTotalRowNumber;
    mixedTableColumnTotals.forEach((value, key) => {
      const gridArea = `${totalRowNumber} / ${key} / ${totalRowNumber + 1} / ${key + 1}`;
      divs.push(
        <div key={gridArea} data-endrow={true} style={{ gridArea: gridArea }}>
          <b>{value}</b>
        </div>
      );
    });
    mixedTable.rowTotals.forEach((value, key) => {
      const rowNumber = mixedTableStartRowCache.get(key) || 0;
      const gridArea = `${rowNumber} / ${maxEndColumn + 1} / ${rowNumber + 1} / ${maxEndColumn + 2}`;
      divs.push(
        <div key={gridArea} data-endcolumn={true} style={{ gridArea: gridArea }}>
          <b>{value}</b>
        </div>
      );
    });
    const totaisGridArea = `1 / ${maxEndColumn + 1} / ${keys.length + 2} / ${maxEndColumn + 2}`;
    const totaisValueGridArea = `${totalRowNumber} / ${maxEndColumn + 1} / ${totalRowNumber + 1} / ${maxEndColumn + 2}`;
    divs.push(
      <div key={totaisGridArea} data-endcolumn={true} style={{ gridArea: totaisGridArea }}>
        <b>TOTAIS</b>
      </div>,
      <div key={totaisValueGridArea} data-endrow={true} data-endcolumn={true} style={{ gridArea: totaisValueGridArea }}>
        <b>{data.value}</b>
      </div>
    );
    for (let column = columnHeaderSpace + 1; column < maxEndColumn + 1; column++) {
      for (let row = keys.length + 2; row < totalRowNumber; row++) {
        const gridArea = `${row} / ${column} / ${row + 1} / ${column + 1}`;
        if (!cellPositions.has(gridArea)) {
          divs.push(<div key={gridArea} style={{ gridArea: gridArea }}></div>);
        }
      }
    }
  }

  return divs;
}
type SpanValue = {
  value: number;
};
type InitialPosition = {
  iniPai?: InitialPosition;
  iniAux?: InitialPosition;
  spanAux?: SpanValue;
};

type StackObj = {
  data: TreeRoot & any;
  spanTree?: SpanValue[];
  iniPai?: InitialPosition;
  path?: string;
  column?: number;
  row?: number;
};

type Result<T> = {
  span: SpanValue;
  value: string | number;
  ini: InitialPosition;
  path: string;
  column?: number;
  row?: number;
  key: keyof T;
  total?: number;
};

function getResult<T>(
  data: Dictionary<T, keyof T> & TreeRoot,
  increment: "column" | "row",
  onlyIncreaseSpanOnKeys?: Array<keyof T>
): Result<T>[] {
  const stack: StackObj[] = [];

  stack.push({ data: data, [increment]: 1 });

  const result: Result<T>[] = [];

  while (stack.length) {
    const obj = stack.shift();
    if (obj) {
      let spanAux: SpanValue;
      let iniAux: InitialPosition;
      const increaseSpan = !onlyIncreaseSpanOnKeys || onlyIncreaseSpanOnKeys.includes(obj.data.key);
      Object.keys(obj.data)
        .sort()
        .filter((k) => !TreeRootKeys.includes(k))
        .forEach((key) => {
          let span = { value: 1 };
          let spanTree = [span];
          if (obj.spanTree) {
            const myKeys = Object.keys(obj.data).filter((k) => !TreeRootKeys.includes(k));
            const lastSpan = obj.spanTree[0];
            if (myKeys.length > lastSpan.value && increaseSpan) {
              for (let i = 0; i < obj.spanTree.length; i++) {
                obj.spanTree[i].value++;
              }
            }
            spanTree.push(...obj.spanTree);
          }

          const rowOrColumn = obj[increment] || 0;
          const iniPai = obj.iniPai;
          const path = obj.path ? obj.path + key : key;

          const ini: InitialPosition = { iniPai, spanAux: increaseSpan ? spanAux : { value: 0 }, iniAux };

          result.push({
            span: span,
            value: key,
            ini: ini,
            [increment]: rowOrColumn,
            path,
            key: obj.data.key,
            total: obj.data.value,
          });

          if (!(obj.data[key] instanceof GroupResult)) {
            stack.push({
              data: obj.data[key],
              spanTree: spanTree,
              [increment]: rowOrColumn + 1,
              iniPai: ini,
              path,
            });
          } else {
            result.push({
              span: span,
              [increment]: rowOrColumn + 1,
              ini: ini,
              path: path + RESULT_PATH_KEY,
              value: obj.data[key].value,
              key: RESULT_PATH_KEY as keyof T,
            });
          }
          iniAux = ini;
          spanAux = span;
        });
    }
  }
  return result;
}

function getIni(ini: InitialPosition | undefined) {
  const stack: InitialPosition[] = [];

  if (ini) {
    stack.push(ini);
  } else {
    return 0;
  }

  let result = 1;

  while (stack.length) {
    const i = stack.pop();
    if (i) {
      if (i.spanAux) {
        result += i.spanAux.value;
      }
      if (i.iniAux) {
        stack.push(i.iniAux);
      } else if (i.iniPai) {
        stack.push(i.iniPai);
      }
    }
  }
  return result;
}
