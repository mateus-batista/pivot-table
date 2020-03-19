import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "./Testes";
import { Dictionary } from "lodash";

export type TabelaHorizontalProps<T> = {
  linhas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaHorizontal<T>(props: TabelaHorizontalProps<T>) {
  const { mapa } = props;

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
        {getRow(mapa, [])}
      </div>
    </>
  );
}

function getRow(obj: any & Countable, rows: ReactElement[], startRow = 1, startColumn = 1): ReactElement[] {
  if (obj instanceof Array) {
    rows.push(
      <div style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}>
        {obj.length}
      </div>
    );
    return rows;
  }

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const children = getRow(obj[key], [], startRow, startColumn + 1);

      const root = (
        <div
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + children.length} / ${startColumn + 1}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {key}
        </div>
      );

      startRow += children.length + 1;

      rows.push(root);
      rows.push(...children);
    });

  return rows;
}
