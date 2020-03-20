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

  const [rows, , rowMap, headerSection] = getRow(
    mapaLinhas,
    [],
    linhas,
    new Map<string, number>(),
    new Map(),
    countColunas + 1,
    countColunas + 2
  );
  const [table, , columnHeaderSection] = getColumn(
    mapaColunas,
    rows,
    colunas,
    rowMap,
    new Map(),
    countLinhas + 1,
    1,
    countLinhas + 2
  );

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

function getRow<T>(
  obj: any & Countable,
  rows: ReactElement[],
  rowKeys: Array<keyof T>,
  rowMap: Map<string, number>,
  headerSection: Map<string, ReactElement> = new Map(),
  startHeader: number,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
): [ReactElement[], number, Map<string, number>, Map<string, ReactElement>] {
  const linha = rowKeys[0];

  if (!linha) {
    return [rows, startRow + 1, rowMap, headerSection];
  }

  let rowSpan = 0;
  rowKeys = [...rowKeys].splice(1, rowKeys.length);
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childrenRowSpan] = getRow(
        obj[key],
        [],
        rowKeys,
        rowMap,
        headerSection,
        startHeader,
        startRow,
        startColumn + 1,
        rowPath + key
      );

      const lastChild = rowKeys.length === 0;

      rowSpan = childrenRowSpan;

      const root = (
        <div
          key={`${startRow}/${startColumn}/${childrenRowSpan}/${lastChild ? startColumn + 2 : startColumn + 1}${key}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${childrenRowSpan} / ${
              lastChild ? startColumn + 2 : startColumn + 1
            }`
          }}
        >
          {key}
        </div>
      );
      headerSection.set(
        obj.key,
        <div
          key={`${startHeader}/${startColumn}/${startHeader + 1}/${startColumn + 1}${obj.key}`}
          style={{
            gridArea: `${startHeader} / ${startColumn} / ${startHeader + 1} / ${startColumn + 1}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <b>{obj.key}</b>
        </div>
      );
      rowMap.set(rowPath + key, startRow.valueOf());

      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  return [rows, rowSpan, rowMap, headerSection];
}

function getColumn<T>(
  obj: any & Countable,
  rows: ReactElement[],
  columnKeys: Array<keyof T>,
  rowMap: Map<string, number>,
  headerSection: Map<string, ReactElement> = new Map(),
  startHeader: number,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
): [ReactElement[], number, Map<string, ReactElement>] {
  if (obj instanceof Array) {
    const r = rowMap.get(rowPath) || 0;
    rows.push(
      <div
        key={`${r}/${startColumn}/${r + 1}/${startColumn + 1}${obj.length}`}
        style={{ gridArea: `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}` }}
      >
        {obj.length}
      </div>
    );
    return [rows, startColumn + 1, headerSection];
  }

  let columnSpan: number = 0;
  const rootKey = columnKeys.includes(obj.key);
  columnKeys = [...columnKeys].splice(1, columnKeys.length);
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childColumnSpan] = getColumn(
        obj[key],
        [],
        columnKeys,
        rowMap,
        headerSection,
        startHeader,
        rootKey ? startRow + 1 : startRow,
        startColumn,
        !rootKey ? rowPath + key : rowPath
      );
      columnSpan = childColumnSpan;
      const lastChild = columnKeys.length === 0;
      const root = (
        <div
          key={`${startRow}/${startColumn}/${lastChild ? startRow + 2 : startRow + 1}/${childColumnSpan}- ${key}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${lastChild ? startRow + 2 : startRow + 1} / ${childColumnSpan}`
          }}
        >
          {key}
        </div>
      );
      if (rootKey) {
        headerSection.set(
          obj.key,
          <div
            key={`${startRow}/${startHeader}/${startRow + 1}/${startHeader + 1}${obj.key}`}
            style={{
              gridArea: `${startRow} / ${startHeader} / ${startRow + 1} / ${startHeader + 1}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <b>{obj.key}</b>
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

  return [rows, columnSpan, headerSection];
}
