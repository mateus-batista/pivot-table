import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "./Testes";
import { Dictionary } from "lodash";

export type TabelaVerticalProps<T> = {
  colunas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaVertical<T>(props: TabelaVerticalProps<T>) {
  const { mapa } = props;

  const [items] = getColumn(mapa, []);
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto auto",
          gridGap: "10px",
          placeContent: "stretch stretch",
        }}
        className="table"
      >
        {items}
      </div>
    </>
  );
}

function getColumn(
  obj: any & Countable,
  rows: ReactElement[],
  row = 1,
  column = 1
): [ReactElement[], number] {
  if (obj instanceof Array) {
    rows.push(
      <div style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }}>
        {obj.length}
      </div>
    );
    return [rows, column + 1];
  }

  let columnSpan: number = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childColumnSpan] = getColumn(obj[key], [], row + 1, column);
      columnSpan = childColumnSpan;
      const root = (
        <div
          style={{
            gridArea: `${row} / ${column} / ${row + 1} / ${childColumnSpan}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {key}
        </div>
      );

      column = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  return [rows, columnSpan];
}
