import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { GroupResult } from "../../classes/GroupResult";

export type HorizontalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

type GetRowInputProps<T> = {
  data: any & TreeRoot;
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
  if (data instanceof GroupResult) {
    rows.push(
      <div
        key={`${startRow}/${startColumn}/${startRow + 1}/${startColumn + 1}`}
        style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}
      >
        {data.value.toFixed(2)}
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
    .filter(k => !TreeRootKeys.includes(k))
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
        <b>{data.value.toFixed(2)}</b>
      </div>
    );
  }

  return { elements: rows, rowSpan: rowSpan, columnSpan: columnSpan, headerSection: headerSection };
}
