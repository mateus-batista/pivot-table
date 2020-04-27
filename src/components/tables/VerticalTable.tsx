import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { GroupResult } from "../../classes/GroupResult";
import { HeaderWrapper, TableWrapper } from "./ElementWrappers";

export type VerticalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

type GetColumnInputProps<T> = {
  data: any & TreeRoot;
  rows: ReactElement[];
  startRow?: number;
  startColumn?: number;
};
type paranaue2<T> = {
  data: any;
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
};
type paranaueReturns = {
  headerSection?: Map<string, ReactElement>;
  elements: ReactElement[];
};
type stack = {
  data: any;
  depth: number;
  key?: string;
  done: boolean;
};
type rowspan = {
  row: number;
  span: number;
};

type GetColumnReturnProps<T> = {
  elements: ReactElement[];
  columnSpan: number;
  rowSpan: number;
};

export function VerticalTable<T>(props: VerticalTableProps<T>) {
  const { data, keysMapping } = props;
  const keys = [...props.keys];
  const { elements, columnSpan, rowSpan } = getColumn({ data, rows: [] });

  elements.push(...getHeader(data, keys, keysMapping, columnSpan, rowSpan));

  return <TableWrapper>{elements}</TableWrapper>;
}

function getColumn<T>({ data, rows, startRow = 1, startColumn = 2 }: GetColumnInputProps<T>): GetColumnReturnProps<T> {
  if (data instanceof GroupResult) {
    const gridArea = `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}`;
    rows.push(
      <div key={gridArea} style={{ gridArea: gridArea }}>
        {data.value}
      </div>
    );
    return { elements: rows, columnSpan: startColumn + 1, rowSpan: startRow + 1 };
  }

  let columnSpan = 0;
  let rowSpan = 0;

  Object.keys(data)
    .filter((k) => !TreeRootKeys.includes(k))
    .forEach((key) => {
      const { elements: children, columnSpan: childColumnSpan, rowSpan: childRowSpan } = getColumn({
        data: data[key],
        rows: [],
        startColumn,
        startRow: startRow + 1,
      });
      columnSpan = childColumnSpan;
      rowSpan = childRowSpan;
      const gridArea = `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`;
      const root = (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          <b>{key}</b>
        </div>
      );

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  return { elements: rows, columnSpan: columnSpan, rowSpan: rowSpan };
}

function getHeader<T>(
  data: any & TreeRoot,
  keys: Array<keyof T>,
  keysMapping: Map<keyof T, string>,
  columnSpan: number,
  rowSpan: number
) {
  const headers = keys.map((k, i) => {
    const gridArea = `${i + 1} / 1 / ${i + 2} / 2`;
    return (
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <HeaderWrapper>{keysMapping.get(k)}</HeaderWrapper>
      </div>
    );
  });
  const totalValueGridArea = `${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`;
  headers.push(
    <div key={totalValueGridArea} style={{ gridArea: totalValueGridArea }}>
      <b>{data.value}</b>
    </div>
  );
  const totalLabelGridArea = `1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`;
  headers.push(
    <div key={totalLabelGridArea} style={{ gridArea: totalLabelGridArea }}>
      <b>Total</b>
    </div>
  );
  const totaisLabelGridArea = `${rowSpan - 1} / 1 / ${rowSpan} / 2 `;
  headers.push(
    <div key={totaisLabelGridArea} style={{ gridArea: totaisLabelGridArea }}>
      <b>Totais</b>
    </div>
  );

  return headers;
}
