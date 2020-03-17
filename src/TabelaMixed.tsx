import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "./Testes";
import { Dictionary } from "lodash";

export type TabelaMixedProps<T> = {
  linhas: Array<keyof T>;
  colunas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaMixed<T>(props: TabelaMixedProps<T>) {
  const { mapa, linhas, colunas } = props;

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
        {getRow(mapa, [], linhas)}
      </div>
    </>
  );
}

function getRow<T>(
  obj: any & Countable,
  rows: ReactElement[],
  linhas: Array<keyof T>,
  row = 1,
  column = 1
): ReactElement[] {
  const linha = linhas[0];

  if (!linha) {
    return rows;
  }

  if (obj instanceof Array) {
    rows.push(
      <div style={{ gridArea: `${row} / ${column} / ${row + 1} / ${column + 1}` }}>
        {obj.length}
      </div>
    );
    return rows;
  }

  linhas = linhas.splice(1, linhas.length);

  Object.keys(obj).forEach(key => {
    if (!CountableKeys.includes(key)) {
      const children = getRow(obj[key], [], linhas, row, column + 1);

      const root = (
        <div
          style={{
            gridArea: `${row} / ${column} / ${row + children.length} / ${column + 1}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {key}
        </div>
      );

      row += children.length + 1;

      rows.push(root);
      rows.push(...children);
    }
  });

  return rows;
}
