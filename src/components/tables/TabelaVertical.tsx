import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";

export type TabelaVerticalProps<T> = {
  colunas: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function TabelaVertical<T>(props: TabelaVerticalProps<T>) {
  const { mapa } = props;

  const colunas = [...props.colunas];

  const [children, , headerSection] = getColumn(mapa, [], colunas);

  children.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{children}</div>
    </>
  );
}

function getColumn<T>(
  obj: any & Countable,
  rows: ReactElement[],
  filterKeys: Array<keyof T>,
  headerSection: Map<string, ReactElement> = new Map(),
  startRow = 1,
  startColumn = 2
): [ReactElement[], number, Map<string, ReactElement>] {
  if (obj instanceof Array) {
    rows.push(
      <div
        key={`${startRow}/${startColumn}/${startRow + 1}/${startColumn + 1}`}
        style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}
      >
        {obj.length}
      </div>
    );
    headerSection.set(
      "totais",
      <div key={`${startRow}/1/${startRow + 1}/2`} style={{ gridArea: `${startRow} / 1 / ${startRow + 1} / 2 ` }}>
        <b>Totais</b>
      </div>
    );
    return [rows, startColumn + 1, headerSection];
  }

  let columnSpan = 0;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(key => {
      const [children, childColumnSpan] = getColumn(obj[key], [], filterKeys, headerSection, startRow + 1, startColumn);
      columnSpan = childColumnSpan;
      const root = (
        <div
          key={`${startRow}/${startColumn}/${startRow + 1}/${childColumnSpan}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`
          }}
        >
          {key}
        </div>
      );

      headerSection.set(
        obj.key,
        <div
          key={`${startRow}/1/${startRow + 1}/2`}
          style={{
            gridArea: `${startRow} / 1 / ${startRow + 1} / 2`
          }}
        >
          <b>{obj.key}</b>
        </div>
      );
      filterKeys = filterKeys.filter(k => k !== obj.key);

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  return [rows, columnSpan, headerSection];
}
