import { Dictionary } from "lodash";
import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";

export type HorizontalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T> & Countable;
};

type GetRowInputProps<T> = {
  data: any & Countable;
  rows: ReactElement[];
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  headerSection?: Map<string, ReactElement>;
  startRow?: number;
  startColumn?: number;
};
type GetRowReturnProps<T> = {
  elements: ReactElement[];
  rowSpan: number;
  columnSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function HorizontalTable<T>(props: HorizontalTableProps<T>) {
  const { data, keysMapping } = props;

  const keys = [...props.keys];

  const { elements, headerSection } = getRow({ data, rows: [], keys, keysMapping });

  elements.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{elements}</div>
    </>
  );
}

function getRow<T>({
  data,
  rows,
  keys,
  keysMapping,
  headerSection = new Map(),
  startRow = 2,
  startColumn = 1
}: GetRowInputProps<T>): GetRowReturnProps<T> {
  if (data instanceof Array) {
    rows.push(
      <div
        key={`${startRow}/${startColumn}/${startRow + 1}/${startColumn + 1}`}
        style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}
      >
        {data.length}
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
      elements: rows,
      rowSpan: startRow + 1,
      columnSpan: startColumn + 1,
      headerSection: headerSection
    };
  }

  let rowSpan = 0;
  let columnSpan = 0;

  Object.keys(data)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const { elements: children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        data: data[key],
        rows: [],
        keys,
        keysMapping,
        headerSection,
        startRow,
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
        data.key,
        <div
          key={`1/${startColumn}/2/${startColumn + 1}`}
          style={{
            gridArea: `1 / ${startColumn} / 2 / ${startColumn + 1}`
          }}
        >
          <b>{keysMapping.get(data.key)}</b>
        </div>
      );
      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (data.key === keys[0]) {
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
        <b>{data.count}</b>
      </div>
    );
  }

  return { elements: rows, rowSpan: rowSpan, columnSpan: columnSpan, headerSection: headerSection };
}
