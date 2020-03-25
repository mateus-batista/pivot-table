import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";
import { AtendimentoProfissional, Nomes } from "../../types/AtendimentoProfissional";

export type TabelaMixedProps<T> = {
  linhas: Array<keyof T>;
  colunas: Array<keyof T>;
  mapaLinhas: Dictionary<T> & Countable;
  mapaColunas: Dictionary<T> & Countable;
};

type GetRowInputProps<T> = {
  obj: any & Countable;
  rows: ReactElement[];
  rowKeys: Array<keyof T>;
  rowMap?: Map<string, number>;
  resultMap?: Map<string, number>;
  columnRootKey: keyof T;
  headerSection?: Map<string, ReactElement>;
  startHeader: number;
  startRow?: number;
  startColumn?: number;
  rowPath?: string;
};

type GetRowReturnProps<T> = {
  children: ReactElement[];
  rowSpan: number;
  columnSpan: number;
  rowMap: Map<string, number>;
  resultMap: Map<string, number>;
  headerSection: Map<string, ReactElement>;
};

type GetColumnInputProps<T> = {
  obj: any & Countable;
  rows: ReactElement[];
  columnKeys: Array<keyof T>;
  rowMap: Map<string, number>;
  rootRowKey: keyof T;
  headerSection?: Map<string, ReactElement>;
  startHeader: number;
  startRow?: number;
  startColumn?: number;
  rowPath?: string;
};

type GetColumnReturnProps<T> = {
  children: ReactElement[];
  columnSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function TabelaMixed<T>(props: TabelaMixedProps<T>) {
  const { mapaLinhas, mapaColunas, linhas, colunas } = props;

  const countLinhas = linhas.length;
  const countColunas = colunas.length;

  const { children, rowMap, resultMap, headerSection } = getRow({
    obj: mapaLinhas,
    rows: [],
    rowKeys: linhas,
    columnRootKey: colunas[0],
    startHeader: countColunas + 1,
    startRow: countColunas + 2
  });
  const { children: table, headerSection: columnHeaderSection, columnSpan } = getColumn({
    obj: mapaColunas,
    rows: children,
    columnKeys: colunas,
    rowMap,
    rootRowKey: linhas[0],
    startHeader: countLinhas + 1,
    startRow: 1,
    startColumn: countLinhas + 2
  });

  const totaisColunasRowNumber = rowMap.get("totaisColunas") || 0;
  table.push(
    <div
      key={`${totaisColunasRowNumber} / ${columnSpan} / ${totaisColunasRowNumber + 1} / ${columnSpan + 1}`}
      style={{
        gridArea: `${totaisColunasRowNumber} / ${columnSpan} / ${totaisColunasRowNumber + 1} / ${columnSpan + 1}`
      }}
    >
      <b>{mapaColunas.count}</b>
    </div>
  );
  table.push(
    <div
      key={`1 / ${columnSpan} / ${colunas.length + 1} / ${columnSpan + 1}`}
      style={{ gridArea: `1 / ${columnSpan} / ${colunas.length + 2} / ${columnSpan + 1}` }}
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
  obj,
  rows,
  rowKeys,
  rowMap = new Map<string, number>(),
  columnRootKey,
  headerSection = new Map(),
  resultMap = new Map<string, number>(),
  startHeader,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
}: GetRowInputProps<T>): GetRowReturnProps<T> {
  const linha = rowKeys[0];

  if (obj.key === columnRootKey) {
    resultMap.set(rowPath, obj.count);
  }

  if (!linha) {
    return {
      children: rows,
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
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const { children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        obj: obj[key],
        rows: [],
        rowKeys: rowKeys,
        rowMap: rowMap,
        resultMap,
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
      var titulos:keyof AtendimentoProfissional = obj.key
      headerSection.set(
        obj.key,
        <div
          key={`${startHeader}/${startColumn}/${startHeader + 1}/${startColumn + 1}${obj.key}`}
          style={{
            gridArea: `${startHeader} / ${startColumn} / ${startHeader + 1} / ${startColumn + 1}`
          }}
        >
          <b>{Nomes[titulos]}</b>
        </div>
      );

      rowMap.set(rowPath + key, startRow.valueOf());

      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (obj.key === linha) {
    headerSection.set(
      "totaisColunas",
      <div
        key={`${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan}`}
        style={{
          gridArea: `${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan}`
        }}
      >
        <b>Totais</b>
      </div>
    );
    rowMap.set("totaisColunas", rowSpan);
  }

  return { children: rows, rowSpan, columnSpan, rowMap, resultMap, headerSection };
}

function getColumn<T>({
  obj,
  rows,
  columnKeys,
  rowMap,
  rootRowKey,
  headerSection = new Map(),
  startHeader,
  startRow = 1,
  startColumn = 1,
  rowPath = ""
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
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
    return { children: rows, columnSpan: startColumn + 1, headerSection };
  }

  let columnSpan: number = 0;
  const rootKey = columnKeys.includes(obj.key);
  columnKeys = [...columnKeys].splice(1, columnKeys.length);
  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const lastChild = columnKeys.length === 0;
      const { children, columnSpan: childColumnSpan } = getColumn({
        obj: obj[key],
        rows: [],
        columnKeys,
        rowMap,
        rootRowKey,
        headerSection,
        startHeader,
        startRow: rootKey ? startRow + 1 : startRow,
        startColumn,
        rowPath: !rootKey ? rowPath + key : rowPath
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
        var titulos:keyof AtendimentoProfissional = obj.key
        headerSection.set(
          obj.key,
          <div
            key={`${startRow}/${startHeader}/${startRow + 1}/${startHeader + 1}${obj.key}`}
            style={{
              gridArea: `${startRow} / ${startHeader} / ${startRow + 1} / ${startHeader + 1}`
            }}
          >
            <b>{Nomes[titulos]}</b>
          </div>
        );
      }

      if (obj.key === rootRowKey) {
        const r = rowMap.get("totaisColunas") || 0;
        headerSection.set(
          obj.key + startColumn + "total",
          <div
            key={`${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}${obj.key}`}
            style={{
              gridArea: `${r} / ${startColumn} / ${r + 1} / ${startColumn + 1}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <b>{obj.count}</b>
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

  return { children: rows, columnSpan, headerSection };
}
