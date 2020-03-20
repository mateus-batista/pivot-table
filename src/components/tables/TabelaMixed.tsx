import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";

export type TabelaMixedProps<T> = {
  linhas: Array<keyof T>;
  colunas: Array<keyof T>;
  mapaLinhas: Dictionary<T> & Countable;
  mapaColunas: Dictionary<T> & Countable;
};

export function TabelaMixed<T>(props: TabelaMixedProps<T>) {
  const { mapaLinhas, mapaColunas, linhas, colunas } = props;

  const countLinhas = linhas.length;
  const countColunas = colunas.length;

  const [rows, , rowMap] = getRow(mapaLinhas, [], linhas, new Map<string, number>(), countColunas + 1);
  const [table] = getColumn(mapaColunas, rows, colunas, rowMap, 1, countLinhas + 1);

  console.log(rowMap);
  const l: ReactElement[] = [];
  const c: ReactElement[] = [];
  var cont = 0;
  linhas.forEach(linha => {
    cont = cont + 1;
    l.push(
      <div
        style={{
          gridArea: colunas.length + 1 + "/" + cont + "/" + (colunas.length + 2) + "/" + (cont + 1)
        }}
      >
        {linha}
      </div>
    );
  });
  cont = 0;
  colunas.forEach(coluna => {
    cont = cont + 1;
    l.push(
      <div style={{ gridArea: cont + "/" + (linhas.length + 1) + "/" + (cont + 1) + "/" + (linhas.length + 2) }}>
        {coluna}
      </div>
    );
  });
  const temp = (
    <div
      style={{ display: "grid", gridArea: "1/1/" + (colunas.length + 1) + "/" + (linhas.length + 1) }}
      className="table"
      id="mini-table"
    >
      {l}
      {c}
    </div>
  );
  return (
    <>
      <div className="table result-table">
        {temp}
        {table}
      </div>
    </>
  );
}

function getRow<T>(
  obj: any & Countable,
  rows: ReactElement[],
  rowKeys: Array<keyof T>,
  rowMap: Map<string, number>,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
): [ReactElement[], number, Map<string, number>] {
  const linha = rowKeys[0];

  if (!linha) {
    return [rows, startRow + 1, rowMap];
  }

  let rowSpan = 0;
  rowKeys = [...rowKeys].splice(1, rowKeys.length);
  Object.keys(obj).forEach(key => {
    if (!CountableKeys.includes(key)) {
      const [children, childrenRowSpan] = getRow(
        obj[key],
        [],
        rowKeys,
        rowMap,
        startRow,
        startColumn + 1,
        rowPath + key
      );
      rowSpan = childrenRowSpan;

      const root = (
        <div
          style={{
            gridArea: `${startRow} / ${startColumn} / ${childrenRowSpan} / ${startColumn + 1}`
          }}
        >
          {key}
        </div>
      );
      rowMap.set(rowPath + key, startRow.valueOf());

      startRow = childrenRowSpan + 1;

      rows.push(root);
      rows.push(...children);
    }
  });

  return [rows, rowSpan, rowMap];
}

function getColumn<T>(
  obj: any & Countable,
  rows: ReactElement[],
  columnKeys: Array<keyof T>,
  rowMap: Map<string, number>,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
): [ReactElement[], number] {
  if (obj instanceof Array) {
    const r = rowMap.get(rowPath) || 0;
    rows.push(<div style={{ gridArea: `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}` }}>{obj.length}</div>);
    return [rows, startColumn + 1];
  }

  let columnSpan: number = 0;

  const rootKey = columnKeys.includes(obj.key);
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childColumnSpan] = getColumn(
        obj[key],
        [],
        columnKeys,
        rowMap,
        rootKey ? startRow + 1 : startRow,
        startColumn,
        !rootKey ? rowPath + key : rowPath
      );
      columnSpan = childColumnSpan;
      const root = (
        <div
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`
          }}
        >
          {key}
        </div>
      );

      if (rootKey) {
        startColumn = childColumnSpan;
      }

      if (rootKey) {
        rows.push(root);
      }
      rows.push(...children);
    });

  return [rows, columnSpan];
}
