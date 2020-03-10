import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "./Testes";

export type TabelaProps<T> = {
  chaves: Array<keyof T>;
  mapa: any & Countable;
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
            <th rowSpan={children.length + 1}>{key}</th>
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
