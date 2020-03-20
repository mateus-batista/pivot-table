import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";
import { Dictionary } from "lodash";

export type TabelaProps<T> = {
  chaves: Array<keyof T>;
  mapa: Dictionary<T> & Countable;
};

export function Tabela<T>(props: TabelaProps<T>) {
  const { mapa } = props;

  function getRow(obj: any & Countable, rows: ReactElement[]): ReactElement[] {
    if (obj instanceof Array) {
      rows.push(
        <tr>
          <td>{obj.length}</td>
        </tr>
      );
      return rows;
    }

    Object.keys(obj).forEach(key => {
      if (!CountableKeys.includes(key)) {
        const children = getRow(obj[key], []);

        const root = (
          <tr>
            <th rowSpan={children.length}>{key}</th>
          </tr>
        );

        rows.push(root);
        rows.push(...children);
      }
    });

    return rows;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            {props.chaves.map(k => (
              <th>{k}</th>
            ))}
            <th>valor</th>
          </tr>
        </thead>
        <tbody>{getRow(mapa, [])}</tbody>
      </table>
    </div>
  );
}
