/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ReactElement } from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";
import { GridArea } from "../../classes/GridArea";
import { PivotTableCell } from "./PivotTableCell";
import { useTheme } from "bold-ui";
import {
  Result,
  StackObj,
  SpanValue,
  InitialPosition,
  GetHorinzontalProps,
  GetVerticalProps,
} from "../../types/PivotTableRenderTypes";

export type TableProps<T> = {
  keysMapping: Map<keyof T, string>;
  rowKeys?: Array<keyof T>;
  columnKeys?: Array<keyof T>;
  rowData?: Dictionary<T, keyof T> & TreeRoot;
  columnData?: Dictionary<T, keyof T> & TreeRoot;
};

const RESULT_PATH_KEY = "RESULT";
const PATH_SEPARATOR = "|";

export function PivotTableRender<T>(props: TableProps<T>) {
  const { rowKeys, columnKeys, rowData, columnData, keysMapping } = props;

  const theme = useTheme();

  const table: ReactElement[] = [];

  if (rowData && rowKeys && columnData && columnKeys) {
    const rowResult = getResult(rowData, "column", rowKeys);

    const [divs, rowTotalValues, totalRowNumber, cellPosition] = getHorizontal({
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
          cellPosition: cellPosition,
        },
      })
    );
  } else if (rowData && rowKeys) {
    const rowResult = getResult(rowData, "column");
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
      css={css`
        max-width: 100%;
        overflow: auto;
        border: 1px solid ${theme.pallete.divider};
      `}
    >
      <div
        key={"table"}
        css={css`
          display: grid;
          place-items: center center;
          place-content: start start;
          margin-left: -1px;
          margin-top: -1px;
        `}
      >
        {table}
      </div>
    </div>
  );
}

function getHorizontal<T>({
  results,
  keys,
  data,
  keysMapping,
  headerSpace = 1,
  mixedTable,
}: GetHorinzontalProps<T>): [ReactElement[], Map<string, number>, number, Set<string>] {
  let maxRowEnd = 0;
  let maxColumnEnd = 0;
  const divs: ReactElement[] = [];
  const rowTotalValues = new Map<string, number>();
  const cellPosition = new Set<string>();

  /**
   * Create headers
   */
  keys.forEach((k, idx) => {
    const gridArea = new GridArea(headerSpace, idx + 1, headerSpace + 1, idx + 2);
    divs.push(
      <PivotTableCell type={["header"]} key={gridArea.toString()} gridArea={gridArea}>
        {keysMapping.get(k)?.toUpperCase()}
      </PivotTableCell>
    );
  });

  /**
   * Populate values
   */
  for (let result of results) {
    if (mixedTable) {
      if (result.key === mixedTable.totalKey) {
        rowTotalValues.set(result.path.replace(PATH_SEPARATOR + result.value.toString(), ""), result.total || 0);
      }
      if (!keys.includes(result.key)) {
        continue;
      }
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
        type={result.key !== RESULT_PATH_KEY ? ["header"] : ["value"]}
        key={gridArea.toString()}
        gridArea={gridArea}
        endColumn={result.key === RESULT_PATH_KEY && !mixedTable}
      >
        {value}
      </PivotTableCell>
    );
    cellPosition.add(gridArea.toString());
  }

  /**
   * Populate totals
   */
  let totaisGridArea;
  if (mixedTable) {
    totaisGridArea = new GridArea(maxRowEnd, 1, maxRowEnd + 1, keys.length + 2);
  } else {
    totaisGridArea = new GridArea(headerSpace, maxColumnEnd, headerSpace + 1, maxColumnEnd + 1);
    const totalGridArea = new GridArea(maxRowEnd, 1, maxRowEnd + 1, maxColumnEnd);
    const dataValueGridArea = new GridArea(maxRowEnd, maxColumnEnd, maxRowEnd + 1, maxColumnEnd + 1);
    divs.push(
      <PivotTableCell type={["header"]} key={totalGridArea.toString()} endRow={true} gridArea={totalGridArea}>
        TOTAL
      </PivotTableCell>,
      <PivotTableCell
        type={["total", "value"]}
        key={dataValueGridArea.toString()}
        endColumn
        endRow
        gridArea={dataValueGridArea}
      >
        {numberFormatter(data.value)}
      </PivotTableCell>
    );
  }

  divs.push(
    <PivotTableCell
      type={["header"]}
      key={totaisGridArea.toString()}
      endColumn={mixedTable === undefined}
      endRow={mixedTable !== undefined}
      gridArea={totaisGridArea}
    >
      TOTAIS
    </PivotTableCell>
  );

  cellPosition.add(totaisGridArea.toString());
  return [divs, rowTotalValues, maxRowEnd, cellPosition];
}

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
  const cellPositions = mixedTable?.cellPosition || new Set<string>();

  for (let result of results) {
    const value = result.value;
    const columnSpan = result.span.value;
    let rowStart = result.row || 0;
    let columnStart = getIni(result.ini) + columnHeaderSpace;
    if (mixedTable) {
      if (result.key === mixedTable.totalKey) {
        mixedTableColumnTotals.set(columnStart, result.total || 0);
      }
      if (!keys.includes(result.key) && result.key !== RESULT_PATH_KEY) {
        continue;
      }
      if (mixedTable.rowResult && result.key === RESULT_PATH_KEY) {
        const rows = mixedTable.rowResult.filter((rx) => result.path.indexOf(rx.path) !== -1);
        rowStart = getIni(rows[rows.length - 1].ini) + keys.length + 1;
        columnStart = getIni(result.ini.iniPai) + columnHeaderSpace;
        mixedTableStartRowCache.set(rows[rows.length - 1].path, rowStart);
      }
    }
    const lastKey = mixedTable && result.key === keys[keys.length - 1];
    const rowEnd = lastKey ? rowStart + 2 : rowStart + 1;
    const columnEnd = columnStart + columnSpan;
    maxRowEnd = rowEnd > maxRowEnd ? rowEnd : maxRowEnd;
    maxColumnEnd = columnEnd > maxColumnEnd ? columnStart : maxColumnEnd;
    const gridArea = new GridArea(rowStart, columnStart, rowEnd, columnEnd);
    if (result.key === RESULT_PATH_KEY) {
      divs.push(
        <PivotTableCell
          type={["value"]}
          key={gridArea.toString()}
          endRow={mixedTable === undefined}
          gridArea={gridArea}
        >
          {value}
        </PivotTableCell>
      );
    } else {
      divs.push(
        <PivotTableCell type={["header"]} key={gridArea.toString()} gridArea={gridArea}>
          {value}
        </PivotTableCell>
      );
    }
    cellPositions.add(gridArea.toString());
  }
  divs.push(
    ...keys.map((k, i) => {
      const gridArea = new GridArea(i + 1, columnHeaderSpace, i + 2, columnHeaderSpace + 1);
      return (
        <PivotTableCell type={["header"]} key={gridArea.toString()} gridArea={gridArea}>
          {keysMapping.get(k)?.toUpperCase()}
        </PivotTableCell>
      );
    })
  );

  let totaisGridArea;
  let dataValueGridArea;
  if (mixedTable) {
    const totalRowNumber = mixedTable.totalRowNumber;
    totaisGridArea = new GridArea(1, maxColumnEnd + 1, keys.length + 2, maxColumnEnd + 2);
    dataValueGridArea = new GridArea(totalRowNumber, maxColumnEnd + 1, totalRowNumber + 1, maxColumnEnd + 2);

    mixedTableColumnTotals.forEach((value, key) => {
      const gridArea = new GridArea(totalRowNumber, key, totalRowNumber + 1, key + 1);
      divs.push(
        <PivotTableCell type={["total", "value"]} endRow key={gridArea.toString()} gridArea={gridArea}>
          {numberFormatter(value)}
        </PivotTableCell>
      );
      cellPositions.add(gridArea.toString());
    });

    mixedTable.rowTotalValues.forEach((value, key) => {
      const rowNumber = mixedTableStartRowCache.get(key);
      if (rowNumber) {
        const gridArea = new GridArea(rowNumber, maxColumnEnd + 1, rowNumber + 1, maxColumnEnd + 2);
        divs.push(
          <PivotTableCell type={["total", "value"]} endColumn key={gridArea.toString()} gridArea={gridArea}>
            {numberFormatter(value)}
          </PivotTableCell>
        );
        cellPositions.add(gridArea.toString());
      }
    });

    const gridArea = new GridArea(keys.length + 1, columnHeaderSpace, keys.length + 2, columnHeaderSpace + 1);
    divs.push(
      <PivotTableCell type={["value"]} key={gridArea.toString()} gridArea={gridArea}></PivotTableCell>,
      <PivotTableCell
        type={["header"]}
        key={totaisGridArea.toString()}
        endRow={false}
        endColumn={true}
        gridArea={totaisGridArea}
      >
        TOTAIS
      </PivotTableCell>,
      <PivotTableCell
        type={["total", "value"]}
        key={dataValueGridArea.toString()}
        endColumn
        endRow
        gridArea={dataValueGridArea}
      >
        {numberFormatter(data.value)}
      </PivotTableCell>
    );
    cellPositions.add(dataValueGridArea.toString());

    for (let column = columnHeaderSpace + 1; column < maxColumnEnd + 2; column++) {
      for (let row = keys.length + 2; row < totalRowNumber + 1; row++) {
        const gridArea = new GridArea(row, column, row + 1, column + 1);
        if (!cellPositions.has(gridArea.toString())) {
          divs.push(
            <PivotTableCell
              type={["value"]}
              key={gridArea.toString()}
              endRow={row === totalRowNumber}
              endColumn={column === maxColumnEnd + 1}
              gridArea={gridArea}
            ></PivotTableCell>
          );
        }
      }
    }
  } else {
    totaisGridArea = new GridArea(maxRowEnd - 1, 1, maxRowEnd, 2);
    dataValueGridArea = new GridArea(maxRowEnd - 1, maxColumnEnd + 1, maxRowEnd, maxColumnEnd + 2);
    const totalGridArea = new GridArea(1, maxColumnEnd + 1, maxRowEnd - 1, maxColumnEnd + 2);
    divs.push(
      <PivotTableCell type={["header"]} key={totalGridArea.toString()} endColumn gridArea={totalGridArea}>
        TOTAL
      </PivotTableCell>,
      <PivotTableCell
        type={["header"]}
        key={totaisGridArea.toString()}
        endRow={true}
        endColumn={false}
        gridArea={totaisGridArea}
      >
        TOTAIS
      </PivotTableCell>,
      <PivotTableCell
        type={["total", "value"]}
        key={dataValueGridArea.toString()}
        endColumn
        endRow
        gridArea={dataValueGridArea}
      >
        {numberFormatter(data.value)}
      </PivotTableCell>
    );
  }
  return divs;
}

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
          const path = obj.path ? obj.path + (PATH_SEPARATOR + key) : key;

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
              path: path + PATH_SEPARATOR + RESULT_PATH_KEY,
              value: numberFormatter(obj.data[key].value),
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

const numberFormatter = (num?: number): string => {
  if (!num) {
    return "0";
  }
  if (num % 1 !== 0) {
    return num.toFixed(2);
  } else {
    return num.toString();
  }
};

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
