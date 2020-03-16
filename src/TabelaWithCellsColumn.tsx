import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "./Testes";
import { Dictionary } from "lodash";

export type TabelaWithCellsColumnProps<T> = {
  chavesLinhas: Array<keyof T>;
  chavesColunas?: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaWithCellsColumn<T>(props: TabelaWithCellsColumnProps<T>) {
  const { mapa } = props;

  const [items] = getRow(mapa, []);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        {props.chavesLinhas.map(v => (
          <span>{v}</span>
        ))}
        <span>valor</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto auto",
          gridGap: "10px",
          placeContent: "stretch stretch",
        }}
      >
        {items}
      </div>
    </>
  );
}

function getRow(
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
      const [children, childColumnSpan] = getRow(obj[key], [], row + 1, column);
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
