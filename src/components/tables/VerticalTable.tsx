import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { GroupResult } from "../../classes/GroupResult";

export type VerticalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

type GetColumnInputProps<T> = {
  data: any & TreeRoot;
  rows: ReactElement[];
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  headerSection?: Map<string, ReactElement>;
  startRow?: number;
  startColumn?: number;
};

type GetColumnReturnProps<T> = {
  elements: ReactElement[];
  columnSpan: number;
  rowSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function VerticalTable<T>(props: VerticalTableProps<T>) {
  const { data, keysMapping } = props;

  const keys = [...props.keys];

  const { elements, headerSection } = getColumn({ data, rows: [], keys, keysMapping });

  elements.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{elements}</div>
    </>
  );
}

function getColumn<T>({
  data,
  rows,
  keys,
  keysMapping,
  headerSection = new Map(),
  startRow = 1,
  startColumn = 2
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
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
      <div key={`${startRow}/1/${startRow + 1}/2`} style={{ gridArea: `${startRow} / 1 / ${startRow + 1} / 2 ` }}>
        <b>Totais</b>
      </div>
    );
    return { elements: rows, columnSpan: startColumn + 1, rowSpan: startRow + 1, headerSection: headerSection };
  }

  let columnSpan = 0;
  let rowSpan = 0;

  Object.keys(data)
    .filter(k => !TreeRootKeys.includes(k))
    .forEach(key => {
      const { elements: children, columnSpan: childColumnSpan, rowSpan: childRowSpan } = getColumn({
        data: data[key],
        rows: [],
        keys,
        keysMapping,
        headerSection,
        startColumn,
        startRow: startRow + 1
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
      headerSection.set(
        data.key,
        <div
          key={`${startRow}/1/${startRow + 1}/2`}
          style={{
            gridArea: `${startRow} / 1 / ${startRow + 1} / 2`
          }}
        >
          <b>{keysMapping.get(data.key)}</b>
        </div>
      );

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (data.key === keys[0]) {
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
        <b>{data.value.toFixed(2)}</b>
      </div>
    );
  }

  return { elements: rows, columnSpan: columnSpan, rowSpan: rowSpan, headerSection: headerSection };
}
