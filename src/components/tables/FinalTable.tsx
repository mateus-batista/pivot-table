import React from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";

export type FinalTableProps<T> = {
  keysMapping: Map<keyof T, string>;
  rowKeys?: Array<keyof T>;
  columnKeys?: Array<keyof T>;
  rowData?: Dictionary<T, keyof T> & TreeRoot;
  columnData?: Dictionary<T, keyof T> & TreeRoot;
};

export function FinalTable<T>(props: FinalTableProps<T>) {
  const { rowKeys, columnKeys, rowData, columnData, keysMapping } = props;

  const divs: any[] = [];
  let columnResult, rowResult;

  if (rowData && rowKeys && columnData && columnKeys) {
    rowResult = getResult(rowData, "column", rowKeys);
    const [hDivs, mixedTotals, totalRowNumber] = getHorizontal(
      rowResult,
      rowKeys,
      rowData,
      keysMapping,
      columnKeys.length + 1,
      true,
      columnKeys[0]
    );
    divs.push(hDivs);
    columnResult = getResult(columnData, "row", columnKeys);
    divs.push(
      getVertical(
        columnResult,
        columnKeys,
        columnData,
        keysMapping,
        rowKeys.length + 1,
        true,
        rowResult,
        mixedTotals,
        rowKeys[0],
        totalRowNumber
      )
    );
  } else if (rowData && rowKeys) {
    rowResult = getResult(rowData, "column");
    const [hDvis] = getHorizontal(rowResult, rowKeys, rowData, keysMapping, 2);
    divs.push(hDvis);
  } else if (columnData && columnKeys) {
    columnResult = getResult(columnData, "row");
    divs.push(getVertical(columnResult, columnKeys, columnData, keysMapping));
  }
  return (
    <>
      <div className="table result-table">{divs}</div>
    </>
  );
}

function getHorizontal<T>(
  result: any[],
  keys: Array<keyof T>,
  data: Dictionary<T, keyof T> & TreeRoot,
  keysMapping: Map<keyof T, string>,
  headerSpace: number = 1,
  mixedTable: boolean = false,
  mixedTableTotalKey?: keyof T
): [any[], Map<string, string>, number] {
  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs: any[] = [];
  const mixedTableTotals = new Map<string, string>();

  for (let i = 0; i < result.length; i++) {
    const r = result[i];
    if (mixedTable && r.key === mixedTableTotalKey) {
      mixedTableTotals.set(r.path.replace(r.name, ""), r.value);
    }
    if (mixedTable && !keys.includes(r.key)) {
      continue;
    }
    const lastKey = mixedTable && r.key === keys[keys.length - 1];
    const value = r.name;
    const rowSpan = r.span.value;
    const startColumn = r.column;
    const endColumn = lastKey ? startColumn + 2 : startColumn + 1;
    const startRow = getIni(r.ini) + headerSpace;
    const endRow = startRow + rowSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    divs.push(<div style={{ gridArea: `${startRow} / ${startColumn} / ${endRow} / ${endColumn} ` }}>{value}</div>);
  }
  divs.push(
    keys.map((k, i) => {
      const gridArea = `${headerSpace} / ${i + 1} / ${headerSpace + 1} / ${i + 2} `;
      return (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          {keysMapping.get(k)}
        </div>
      );
    })
  );
  if (!mixedTable) {
    const totaisGridArea = `${headerSpace} / ${maxEndColumn} / ${headerSpace + 1} / ${maxEndColumn + 1} `;
    const totalGridArea = `${maxEndRow} / 1 / ${maxEndRow + 1} / ${maxEndColumn} `;
    const totalValueGridArea = `${maxEndRow} / ${maxEndColumn} / ${maxEndRow + 1} / ${maxEndColumn + 1} `;
    divs.push(
      <div key={totaisGridArea} style={{ gridArea: totaisGridArea }}>
        Totais
      </div>,
      <div key={totalGridArea} style={{ gridArea: totalGridArea }}>
        Total
      </div>,
      <div key={totalValueGridArea} style={{ gridArea: totalValueGridArea }}>
        {data.value}
      </div>
    );
  } else {
    const gridArea = `${maxEndRow} / 1 / ${maxEndRow + 1} / ${keys.length + 2} `;
    divs.push(
      <div key={gridArea} style={{ gridArea: gridArea }}>
        TOTAIS
      </div>
    );
  }

  return [divs, mixedTableTotals, maxEndRow];
}

function getVertical<T>(
  result: any[],
  keys: Array<keyof T>,
  data: Dictionary<T, keyof T> & TreeRoot,
  keysMapping: Map<keyof T, string>,
  columnHeaderSpace: number = 1,
  mixedTable: boolean = false,
  mixedTableRowResult?: any[],
  rowTotals?: Map<string, string>,
  mixedTableTotalKey?: keyof T,
  mixedTableTotalRowNumber?: number
) {
  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs: any[] = [];
  const mixedTableStartRowCache = new Map<string, number>();
  const mixedTableColumnTotals = new Map<number, number>();
  const cellPositions = new Set<string>();
  for (let i = 0; i < result.length; i++) {
    const r = result[i];
    let value = r.name;
    const columnSpan = r.span.value;
    let startRow = r.row;
    let startColumn = getIni(r.ini) + columnHeaderSpace;
    if (mixedTable && r.key === mixedTableTotalKey) {
      mixedTableColumnTotals.set(startColumn, r.value);
    }
    if (mixedTable && !keys.includes(r.key) && r.path.indexOf("result") === -1) {
      continue;
    }
    if (mixedTable && mixedTableRowResult && r.path.indexOf("result") !== -1) {
      const rows = mixedTableRowResult.filter((rx) => r.path.indexOf(rx.path) !== -1);
      startRow = getIni(rows[rows.length - 1].ini) + keys.length + 1;
      startColumn = getIni(r.ini.iniPai) + columnHeaderSpace;
      mixedTableStartRowCache.set(rows[rows.length - 1].path, startRow);
    }
    const lastKey = mixedTable && r.key === keys[keys.length - 1];
    const endRow = lastKey ? startRow + 2 : startRow + 1;
    const endColumn = startColumn + columnSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    const gridArea = `${startRow} / ${startColumn} / ${endRow} / ${endColumn}`;
    divs.push(<div style={{ gridArea: gridArea }}>{value}</div>);
    cellPositions.add(gridArea);
  }
  divs.push(
    ...keys.map((k, i) => (
      <div style={{ gridArea: `${i + 1} / ${columnHeaderSpace} / ${i + 2} / ${columnHeaderSpace + 1} ` }}>
        {keysMapping.get(k)}
      </div>
    ))
  );
  if (!mixedTable) {
    divs.push(
      <div style={{ gridArea: `${maxEndRow - 1} / 1 / ${maxEndRow} / 2 ` }}>Totais</div>,
      <div style={{ gridArea: `1 / ${maxEndColumn + 1} / ${maxEndRow - 1} / ${maxEndColumn + 2} ` }}>Total</div>,
      <div style={{ gridArea: `${maxEndRow - 1} / ${maxEndColumn + 1} / ${maxEndRow} / ${maxEndColumn + 2} ` }}>
        {data.value}
      </div>
    );
  } else {
    const totalRowNumber = mixedTableTotalRowNumber || 0;
    mixedTableColumnTotals.forEach((value, key) => {
      divs.push(
        <div style={{ gridArea: `${totalRowNumber} / ${key} / ${totalRowNumber + 1} / ${key + 1} ` }}>{value}</div>
      );
    });
    rowTotals?.forEach((value, key) => {
      const rowNumber = mixedTableStartRowCache.get(key) || 0;
      divs.push(
        <div style={{ gridArea: `${rowNumber} / ${maxEndColumn + 1} / ${rowNumber + 1} / ${maxEndColumn + 2} ` }}>
          {value}
        </div>
      );
    });
    divs.push(
      <div style={{ gridArea: `1 / ${maxEndColumn + 1} / ${keys.length + 2} / ${maxEndColumn + 2} ` }}>TOTAIS</div>,
      <div
        style={{ gridArea: `${totalRowNumber} / ${maxEndColumn + 1} / ${totalRowNumber + 1} / ${maxEndColumn + 2} ` }}
      >
        {data.value}
      </div>
    );
    for (let column = columnHeaderSpace + 1; column < maxEndColumn + 1; column++) {
      for (let row = keys.length + 2; row < totalRowNumber; row++) {
        const gridArea = `${row} / ${column} / ${row + 1} / ${column + 1}`;
        if (!cellPositions.has(gridArea)) {
          divs.push(<div style={{ gridArea: gridArea }}></div>);
        }
      }
    }
  }

  return divs;
}

function getResult<T>(
  data: Dictionary<T, keyof T> & TreeRoot,
  increment: "column" | "row",
  onlyIncreaseSpanOnKeys?: Array<keyof T>
) {
  const stack: any[] = [];

  stack.push({ data: data, [increment]: 1 });

  const result: any[] = [];

  while (stack.length) {
    const obj = stack.shift();
    if (obj) {
      let spanAux: any;
      let iniAux: any;
      const increaseSpan = !onlyIncreaseSpanOnKeys || onlyIncreaseSpanOnKeys.includes(obj.data.key);
      Object.keys(obj.data)
        .filter((k) => !TreeRootKeys.includes(k))
        .forEach((key, idx) => {
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

          const rowOrColumn = obj[increment];
          const iniPai = obj.iniPai;
          const path = obj.path ? obj.path + key : key;

          const ini = { iniPai, spanAux: increaseSpan ? spanAux : 0, idx, iniAux };

          result.push({
            span: span,
            name: key,
            ini: ini,
            [increment]: rowOrColumn,
            path,
            key: obj.data.key,
            value: obj.data.value,
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
              name: obj.data[key].value,
              path: path + "result",
            });
          }
          iniAux = ini;
          spanAux = span;
        });
    }
  }
  return result;
}

function getIni(ini: any) {
  const stack: any[] = [];

  stack.push(ini);

  let result = 1;

  while (stack.length) {
    const i = stack.pop();
    if (i.spanAux) {
      result += i.spanAux.value;
    }
    if (i.iniAux) {
      stack.push(i.iniAux);
    } else if (i.iniPai) {
      stack.push(i.iniPai);
    }
  }
  return result;
}
