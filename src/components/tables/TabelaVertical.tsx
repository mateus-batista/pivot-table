import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";
import { AtendimentoProfissional, Nomes } from "../../types/AtendimentoProfissional";

export type TabelaVerticalProps<T> = {
  colunas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

type GetColumnInputProps<T> = {
  obj: any & Countable;
  rows: ReactElement[];
  filterKeys: Array<keyof T>;
  headerSection?: Map<string, ReactElement>;
  startRow?: number;
  startColumn?: number;
};

type GetColumnReturnProps<T> = {
  children: ReactElement[];
  columnSpan: number;
  rowSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function TabelaVertical<T>(props: TabelaVerticalProps<T>) {
  const { mapa } = props;

  const colunas = [...props.colunas];

  const { children, headerSection } = getColumn({ obj: mapa, rows: [], filterKeys: colunas });

  children.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{children}</div>
    </>
  );
}

function getColumn<T>({
  obj,
  rows,
  filterKeys,
  headerSection = new Map(),
  startRow = 1,
  startColumn = 2
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
  if (obj instanceof Array) {
    rows.push(
      <div
        key={`${startRow}/${startColumn}/${startRow + 1}/${startColumn + 1}`}
        style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}
      >
        {obj.length}
      </div>
    );
    headerSection.set(
      "totais",
      <div key={`${startRow}/1/${startRow + 1}/2`} style={{ gridArea: `${startRow} / 1 / ${startRow + 1} / 2 ` }}>
        <b>Totais</b>
      </div>
    );
    return { children: rows, columnSpan: startColumn + 1, rowSpan: startRow + 1, headerSection: headerSection };
  }

  let columnSpan = 0;
  let rowSpan = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const { children, columnSpan: childColumnSpan, rowSpan: childRowSpan } = getColumn({
        obj: obj[key],
        rows: [],
        filterKeys: filterKeys,
        headerSection: headerSection,
        startRow: startRow + 1,
        startColumn: startColumn
      });
      columnSpan = childColumnSpan;
      rowSpan = childRowSpan;
      const root = (
        <div
          key={`${startRow}/${startColumn}/${startRow + 1}/${childColumnSpan}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`
          }}
        >
          <b>{key}</b>
        </div>
      );
      var titulos:keyof AtendimentoProfissional = obj.key
      headerSection.set(
        obj.key,
        <div
          key={`${startRow}/1/${startRow + 1}/2`}
          style={{
            gridArea: `${startRow} / 1 / ${startRow + 1} / 2`
          }}
        >
          <b>{Nomes[titulos]}</b>
        </div>
      );

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (obj.key === filterKeys[0]) {
    headerSection.set(
      "totalLabel",
      <div
        key={`1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`}
        style={{
          gridArea: `1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`
        }}
      >
        <b>Total</b>
      </div>
    );
    headerSection.set(
      "totalValue",
      <div
        key={`${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`}
        style={{
          gridArea: `${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`
        }}
      >
        <b>{obj.count}</b>
      </div>
    );
  }

  return { children: rows, columnSpan: columnSpan, rowSpan: rowSpan, headerSection: headerSection };
}
