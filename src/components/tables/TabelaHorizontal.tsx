import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";

export type TabelaHorizontalProps<T> = {
  linhas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

type GetRowInputProps<T> = {
  obj: any & Countable;
  rows: ReactElement[];
  filterKeys: Array<keyof T>;
  headerSection?: Map<string, ReactElement>;
  startRow?: number;
  startColumn?: number;
};
type GetRowReturnProps<T> = {
  children: ReactElement[];
  rowSpan: number;
  columnSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function TabelaHorizontal<T>(props: TabelaHorizontalProps<T>) {
  const { mapa } = props;

  const linhas = [...props.linhas];

  const { children, headerSection } = getRow({ obj: mapa, rows: [], filterKeys: linhas });

  children.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{children}</div>
    </>
  );
}

function getRow<T>({
  obj,
  rows,
  filterKeys,
  headerSection = new Map(),
  startRow = 2,
  startColumn = 1
}: GetRowInputProps<T>): GetRowReturnProps<T> {
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
      <div
        key={`1/${startColumn}/2/${startColumn + 1}`}
        style={{ gridArea: `1 / ${startColumn} / 2 / ${startColumn + 1}` }}
      >
        <b>Totais</b>
      </div>
    );
    return {
      children: rows,
      rowSpan: startRow + 1,
      columnSpan: startColumn + 1,
      headerSection: headerSection
    };
  }

  let rowSpan = 0;
  let columnSpan = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const { children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        obj: obj[key],
        rows: [],
        filterKeys: filterKeys,
        headerSection: headerSection,
        startRow: startRow,
        startColumn: startColumn + 1
      });
      rowSpan = childrenRowSpan;
      columnSpan = childrenColumnSpan;

      const root = (
        <div
          key={`${startRow}/${startColumn}/${childrenRowSpan}/${startColumn + 1}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${childrenRowSpan} / ${startColumn + 1}`
          }}
        >
          <b>{key}</b>
        </div>
      );

      headerSection.set(
        obj.key,
        <div
          key={`1/${startColumn}/2/${startColumn + 1}`}
          style={{
            gridArea: `1 / ${startColumn} / 2 / ${startColumn + 1}`
          }}
        >
          <b>{obj.key}</b>
        </div>
      );
      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (obj.key === filterKeys[0]) {
    headerSection.set(
      "totalLabel",
      <div
        key={`${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan - 1}`}
        style={{
          gridArea: `${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan - 1}`
        }}
      >
        <b>Total</b>
      </div>
    );
    headerSection.set(
      "totalValue",
      <div
        key={`${rowSpan} / ${columnSpan - 1} / ${rowSpan + 1} / ${columnSpan}`}
        style={{
          gridArea: `${rowSpan} / ${columnSpan - 1} / ${rowSpan + 1} / ${columnSpan}`
        }}
      >
        <b>{obj.count}</b>
      </div>
    );
  }

  return { children: rows, rowSpan: rowSpan, columnSpan: columnSpan, headerSection: headerSection };
}
