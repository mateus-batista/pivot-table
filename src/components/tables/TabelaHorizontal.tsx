import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";

export type TabelaHorizontalProps<T> = {
  linhas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaHorizontal<T>(props: TabelaHorizontalProps<T>) {
  const { mapa } = props;

  const linhas = [...props.linhas];

  const [children, , headerSection] = getRow(mapa, [], linhas);

  children.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{children}</div>
    </>
  );
}

function getRow<T>(
  obj: any & Countable,
  rows: ReactElement[],
  filterKeys: Array<keyof T>,
  headerSection: Map<string, ReactElement> = new Map(),
  startRow = 2,
  startColumn = 1
): [ReactElement[], number, Map<string, ReactElement>] {
  if (obj instanceof Array) {
    rows.push(
      <div style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}>
        {obj.length}
      </div>
    );
    headerSection.set(
      "totais",
      <div style={{ gridArea: `1 / ${startColumn} / 2 / ${startColumn + 1}` }}>
        <b>Totais</b>
      </div>
    );
    return [rows, startRow + 1, headerSection];
  }

  let rowSpan = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childrenRowSpan] = getRow(obj[key], [], filterKeys, headerSection, startRow, startColumn + 1);
      rowSpan = childrenRowSpan;

      const root = (
        <div
          style={{
            gridArea: `${startRow} / ${startColumn} / ${childrenRowSpan} / ${startColumn + 1}`
          }}
        >
          {key}
        </div>
      );

      headerSection.set(
        obj.key,
        <div
          style={{
            gridArea: `1 / ${startColumn} / 2 / ${startColumn + 1}`
          }}
        >
          <b>{obj.key}</b>
        </div>
      );
      filterKeys = filterKeys.filter(k => k !== obj.key);

      startRow = childrenRowSpan + 1;

      rows.push(root);
      rows.push(...children);
    });

  return [rows, rowSpan, headerSection];
}
