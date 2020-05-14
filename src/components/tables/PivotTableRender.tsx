/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ReactElement } from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";
import { GridArea, PivotTableCell } from "./PivotTableCell";

export type TableProps<T> = {
  keysMapping: Map<keyof T, string>;
  rowKeys?: Array<keyof T>;
  columnKeys?: Array<keyof T>;
  rowData?: Dictionary<T, keyof T> & TreeRoot;
  columnData?: Dictionary<T, keyof T> & TreeRoot;
};

const RESULT_PATH_KEY = "RESULT";

export function PivotTableRender<T>(props: TableProps<T>) {
  const { rowKeys, columnKeys, rowData, columnData, keysMapping } = props;

  const table: ReactElement[] = [];

  if (rowData && rowKeys && columnData && columnKeys) {
    const rowResult = getResult(rowData, "column", rowKeys);
    console.log(rowResult);
    const [divs, rowTotalValues, totalRowNumber] = getHorizontal({
      results: rowResult,
      keys: rowKeys,
      data: rowData,
      keysMapping,
      headerSpace: columnKeys.length + 1,
      mixedTable: {
        totalKey: columnKeys[0],
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
          rowResult: rowResult,
          rowTotalValues: rowTotalValues,
          totalKey: rowKeys[0],
          totalRowNumber: totalRowNumber,
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
  return (
    <div
      key={"table"}
      css={css`
        display: grid;
        grid-template-columns: auto auto auto auto;
        place-items: center center;
        place-content: start start;
      `}
    >
      {table}
    </div>
  );
}

type GetHorinzontalProps<T> = {
  results: Result<T>[];
  keys: Array<keyof T>;
  data: Dictionary<T, keyof T> & TreeRoot;
  keysMapping: Map<keyof T, string>;
  headerSpace?: number;
  mixedTable?: {
    totalKey?: keyof T;
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
  let maxRowEnd = 0;
  let maxColumnEnd = 0;
  const divs: ReactElement[] = [];
  const rowTotalValues = new Map<string, number>();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (mixedTable && result.key === mixedTable.totalKey) {
      rowTotalValues.set(result.path.replace(result.value.toString(), ""), result.total || 0);
    }
    if (mixedTable && !keys.includes(result.key)) {
      continue;
    }
    const lastKey = mixedTable && result.key === keys[keys.length - 1];
    const value = result.value;
    const rowSpan = result.span.value;
    const columnStart = result.column || 0;
    const columnEnd = lastKey ? columnStart + 2 : columnStart + 1;
    const rowStart = getIni(result.ini) + headerSpace;
    const rowEnd = rowStart + rowSpan;
    maxRowEnd = rowEnd > maxRowEnd ? rowEnd : maxRowEnd;
    maxColumnEnd = columnEnd > maxColumnEnd ? columnStart : maxColumnEnd;

    const gridArea = new GridArea(rowStart, columnStart, rowEnd, columnEnd);
    divs.push(
      <PivotTableCell
        key={gridArea.toString()}
        gridArea={gridArea}
        endColumn={result.key === RESULT_PATH_KEY && !mixedTable}
      >
        {result.key !== RESULT_PATH_KEY ? <b>{value}</b> : value}
      </PivotTableCell>
    );
  }
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const gridArea = new GridArea(headerSpace, i + 1, headerSpace + 1, i + 2);
    divs.push(
      <PivotTableCell key={gridArea.toString()} gridArea={gridArea}>
        <h5>{keysMapping.get(k)?.toUpperCase()}</h5>
      </PivotTableCell>
    );
  }

  if (!mixedTable) {
    const totaisGridArea = new GridArea(headerSpace, maxColumnEnd, headerSpace + 1, maxColumnEnd + 1);
    const totalGridArea = new GridArea(maxRowEnd, 1, maxRowEnd + 1, maxColumnEnd);
    const dataValueGridArea = new GridArea(maxRowEnd, maxColumnEnd, maxRowEnd + 1, maxColumnEnd + 1);
    divs.push(
      <PivotTableCell key={totaisGridArea.toString()} endColumn gridArea={totaisGridArea}>
        <h5>TOTAIS</h5>
      </PivotTableCell>,
      <PivotTableCell key={totalGridArea.toString()} endRow={true} gridArea={totalGridArea}>
        <h5>TOTAL</h5>
      </PivotTableCell>,
      <PivotTableCell key={dataValueGridArea.toString()} endColumn endRow gridArea={dataValueGridArea}>
        <h5>{data.value?.toString()}</h5>
      </PivotTableCell>
    );
  } else {
    const gridArea = new GridArea(maxRowEnd, 1, maxRowEnd + 1, keys.length + 2);
    divs.push(
      <PivotTableCell key={gridArea.toString()} endRow gridArea={gridArea}>
        <h5>TOTAIS</h5>
      </PivotTableCell>
    );
  }

  return [divs, rowTotalValues, maxRowEnd];
}

type GetVerticalProps<T> = {
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
  let maxRowEnd = 0;
  let maxColumnEnd = 0;
  const divs: ReactElement[] = [];
  const mixedTableStartRowCache = new Map<string, number>();
  const mixedTableColumnTotals = new Map<number, number>();
  const cellPositions = new Set<string>();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const value = result.value;
    const columnSpan = result.span.value;
    let rowStart = result.row || 0;
    let columnStart = getIni(result.ini) + columnHeaderSpace;
    if (mixedTable && result.key === mixedTable.totalKey) {
      mixedTableColumnTotals.set(columnStart, result.total || 0);
    }
    if (mixedTable && !keys.includes(result.key) && result.key !== RESULT_PATH_KEY) {
      continue;
    }
    if (mixedTable && mixedTable.rowResult && result.key === RESULT_PATH_KEY) {
      const rows = mixedTable.rowResult.filter((rx) => result.path.indexOf(rx.path) !== -1);
      rowStart = getIni(rows[rows.length - 1].ini) + keys.length + 1;
      columnStart = getIni(result.ini.iniPai) + columnHeaderSpace;
      mixedTableStartRowCache.set(rows[rows.length - 1].path, rowStart);
    }
    const lastKey = mixedTable && result.key === keys[keys.length - 1];
    const rowEnd = lastKey ? rowStart + 2 : rowStart + 1;
    const columnEnd = columnStart + columnSpan;
    maxRowEnd = rowEnd > maxRowEnd ? rowEnd : maxRowEnd;
    maxColumnEnd = columnEnd > maxColumnEnd ? columnStart : maxColumnEnd;
    const gridArea = new GridArea(rowStart, columnStart, rowEnd, columnEnd);
    if (result.key === RESULT_PATH_KEY) {
      divs.push(
        <PivotTableCell key={gridArea.toString()} endRow={mixedTable === undefined} gridArea={gridArea}>
          {value}
        </PivotTableCell>
      );
    } else {
      divs.push(
        <PivotTableCell key={gridArea.toString()} gridArea={gridArea}>
          <h5>{value}</h5>
        </PivotTableCell>
      );
    }
    cellPositions.add(gridArea.toString());
  }
  divs.push(
    ...keys.map((k, i) => {
      const gridArea = new GridArea(i + 1, columnHeaderSpace, i + 2, columnHeaderSpace + 1);
      return (
        <PivotTableCell key={gridArea.toString()} gridArea={gridArea}>
          <h5>{keysMapping.get(k)?.toUpperCase()}</h5>
        </PivotTableCell>
      );
    })
  );
  if (!mixedTable) {
    const totaisGridArea = new GridArea(maxRowEnd - 1, 1, maxRowEnd, 2);
    const totalGridArea = new GridArea(1, maxColumnEnd + 1, maxRowEnd - 1, maxColumnEnd + 2);
    const dataValueGridArea = new GridArea(maxRowEnd - 1, maxColumnEnd + 1, maxRowEnd, maxColumnEnd + 2);
    divs.push(
      <PivotTableCell key={totaisGridArea.toString()} endRow gridArea={totaisGridArea}>
        <h5>TOTAIS</h5>
      </PivotTableCell>,
      <PivotTableCell key={totalGridArea.toString()} endColumn gridArea={totalGridArea}>
        <h5>TOTAL</h5>
      </PivotTableCell>,
      <PivotTableCell key={dataValueGridArea.toString()} endColumn endRow gridArea={dataValueGridArea}>
        <h5>{data.value}</h5>
      </PivotTableCell>
    );
  } else {
    const gridArea = new GridArea(keys.length + 1, columnHeaderSpace, keys.length + 2, columnHeaderSpace + 1);
    divs.push(<PivotTableCell key={gridArea.toString()} gridArea={gridArea}></PivotTableCell>);
    const totalRowNumber = mixedTable.totalRowNumber;
    mixedTableColumnTotals.forEach((value, key) => {
      const gridArea = new GridArea(totalRowNumber, key, totalRowNumber + 1, key + 1);
      divs.push(
        <PivotTableCell endRow key={gridArea.toString()} gridArea={gridArea}>
          <h5>{value}</h5>
        </PivotTableCell>
      );
    });
    mixedTable.rowTotalValues.forEach((value, key) => {
      const rowNumber = mixedTableStartRowCache.get(key) || 0;
      const gridArea = new GridArea(rowNumber, maxColumnEnd + 1, rowNumber + 1, maxColumnEnd + 2);
      divs.push(
        <PivotTableCell endColumn key={gridArea.toString()} gridArea={gridArea}>
          <b>{value}</b>
        </PivotTableCell>
      );
    });
    const totaisGridArea = new GridArea(1, maxColumnEnd + 1, keys.length + 2, maxColumnEnd + 2);
    const dataValueGridArea = new GridArea(totalRowNumber, maxColumnEnd + 1, totalRowNumber + 1, maxColumnEnd + 2);
    divs.push(
      <PivotTableCell key={totaisGridArea.toString()} endColumn gridArea={totaisGridArea}>
        <h5>TOTAIS</h5>
      </PivotTableCell>,
      <PivotTableCell endColumn endRow key={dataValueGridArea.toString()} gridArea={dataValueGridArea}>
        <h5>{data.value}</h5>
      </PivotTableCell>
    );
    for (let column = columnHeaderSpace + 1; column < maxColumnEnd + 1; column++) {
      for (let row = keys.length + 2; row < totalRowNumber; row++) {
        const gridArea = new GridArea(row, column, row + 1, column + 1);
        if (!cellPositions.has(gridArea.toString())) {
          divs.push(<PivotTableCell key={gridArea.toString()} gridArea={gridArea}></PivotTableCell>);
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
        .filter((k) => !TreeRootKeys.includes(k))
        .sort()
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
