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
          placeContent: "stretch stretch",
        }}
        className="table"
      >
        {getRow(mapa, [])}
      </div>
    </>
  );
}

function getRow(obj: any & Countable, rows: ReactElement[], nivel = 1): ReactElement[] {
  if (obj instanceof Array) {
    rows.push(<div style={{ gridRowStart: nivel }}>{obj.length}</div>);
    return rows;
  }

  Object.keys(obj).forEach(key => {
    if (!CountableKeys.includes(key)) {
      const children = getRow(obj[key], [], nivel);

      const root = (
        <div
          style={{
            gridRow: `${nivel} / span ${children.length}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {key}
        </div>
      );

      nivel += children.length + 1;

      rows.push(root);
      rows.push(...children);
    }
  });

  return rows;
}
