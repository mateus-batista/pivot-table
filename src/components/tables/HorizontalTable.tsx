import React, { ReactElement } from "react";
/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTheme, Theme } from "bold-ui";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";
import { TableWrapper, HeaderWrapper } from "./ElementWrappers";

export type HorizontalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

type GetRowInputProps<T> = {
  data: any & TreeRoot;
  rows: ReactElement[];
  theme: Theme;
  startRow?: number;
  startColumn?: number;
};
type GetRowReturnProps<T> = {
  elements: ReactElement[];
  rowSpan: number;
  columnSpan: number;
};

export function HorizontalTable<T>(props: HorizontalTableProps<T>) {
  const theme = useTheme();
  const { data, keysMapping } = props;
  const keys = [...props.keys];
  const { elements, rowSpan, columnSpan } = getRow({ data, rows: [], theme });

  elements.push(...getHeader(data, keys, keysMapping, rowSpan, columnSpan, theme));

  return <TableWrapper>{elements}</TableWrapper>;
}

function getRow<T>({ data, rows, startRow = 2, startColumn = 1, theme }: GetRowInputProps<T>): GetRowReturnProps<T> {
  if (data instanceof GroupResult) {
    const gridArea = `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}`;
    rows.push(
      <div
        key={gridArea}
        style={{ gridArea: gridArea }}
        css={css`
          border-right: 1px solid ${theme.pallete.divider};
        `}
      >
        {data.value}
      </div>
    );
    return {
      elements: rows,
      rowSpan: startRow + 1,
      columnSpan: startColumn + 1,
    };
  }

  let rowSpan = 0;
  let columnSpan = 0;

  Object.keys(data)
    .filter((k) => !TreeRootKeys.includes(k))
    .forEach((key) => {
      const { elements: children, rowSpan: childrenRowSpan, columnSpan: childrenColumnSpan } = getRow({
        data: data[key],
        rows: [],
        startRow,
        startColumn: startColumn + 1,
        theme,
      });
      rowSpan = childrenRowSpan;
      columnSpan = childrenColumnSpan;

      const gridArea = `${startRow} / ${startColumn} / ${childrenRowSpan} / ${startColumn + 1}`;
      const root = (
        <div key={gridArea} style={{ gridArea: gridArea }}>
          <b>{key}</b>
        </div>
      );
      startRow = childrenRowSpan;

      rows.push(root);
      rows.push(...children);
    });

  return { elements: rows, rowSpan, columnSpan };
}

function getHeader<T>(
  data: any & TreeRoot,
  keys: Array<keyof T>,
  keysMapping: Map<keyof T, string>,
  rowSpan: number,
  columnSpan: number,
  theme: Theme
) {
  const headers = keys.map((k, i) => {
    const gridArea = `1 / ${i + 1} / 2 / ${i + 2}`;
    return (
      <div key={gridArea} style={{ gridArea: gridArea }}>
        <HeaderWrapper>{keysMapping.get(k)}</HeaderWrapper>
      </div>
    );
  });
  const totalGridArea = `${rowSpan} / 1 / ${rowSpan + 1} / ${columnSpan - 1}`;
  headers.push(
    <div
      key={totalGridArea}
      style={{ gridArea: totalGridArea }}
      css={css`
        border-bottom: 1px solid ${theme.pallete.divider};
      `}
    >
      <b>TOTAL</b>
    </div>
  );
  const totaisGridArea = `1 / ${columnSpan - 1} / 2 / ${columnSpan}`;
  headers.push(
    <div
      key={totaisGridArea}
      style={{ gridArea: totaisGridArea }}
      css={css`
        border-right: 1px solid ${theme.pallete.divider};
      `}
    >
      <b>TOTAL</b>
    </div>
  );
  const totalValueGridArea = `${rowSpan} / ${columnSpan - 1} / ${rowSpan + 1} / ${columnSpan}`;
  headers.push(
    <div
      key={totalValueGridArea}
      style={{ gridArea: totalValueGridArea }}
      css={css`
        border-bottom: 1px solid ${theme.pallete.divider};
        border-right: 1px solid ${theme.pallete.divider};
      `}
    >
      <b>{data.value}</b>
    </div>
  );

  return headers;
}
