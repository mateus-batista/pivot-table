import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
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
          placeContent: "stretch stretch"
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
  startRow = 1,
  startColumn = 1
): [ReactElement[], number] {
  if (obj instanceof Array) {
    rows.push(
      <div style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}>
        {obj.length}
      </div>
    );
    return [rows, startColumn + 1];
  }

  let columnSpan: number = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childColumnSpan] = getColumn(obj[key], [], startRow + 1, startColumn);
      columnSpan = childColumnSpan;
      const root = (
        <div
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {key}
        </div>
      );

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  return [rows, columnSpan];
}
