import React from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";

export type VerticalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

export function VerticalTable<T>(props: VerticalTableProps<T>) {
  const { data, keysMapping } = props;

  const keys = [...props.keys];

  const stack: any[] = [];

  stack.push({ data: data, row: 1 });

  const result: any[] = [];

  while (stack.length) {
    const obj = stack.shift();
    if (obj) {
      let spanAux: any;
      let iniAux: any;
      Object.keys(obj.data)
        .filter((k) => !TreeRootKeys.includes(k))
        .forEach((key) => {
          let span = { value: 1 };
          let spanTree = [span];
          if (obj.spanTree) {
            const myKeys = Object.keys(obj.data).filter((k) => !TreeRootKeys.includes(k));
            const lastSpan = obj.spanTree[0];
            if (myKeys.length > lastSpan.value) {
              for (let i = 0; i < obj.spanTree.length; i++) {
                obj.spanTree[i].value++;
              }
            }
            spanTree.push(...obj.spanTree);
          }

          const row = obj.row;
          const iniPai = obj.iniPai;

          const ini = { iniPai, spanAux, iniAux };

          result.push({
            span: span,
            name: key,
            ini: ini,
            row: row,
          });

          if (!(obj.data[key] instanceof GroupResult)) {
            const newObj: any = {
              data: obj.data[key],
              spanTree: spanTree,
              row: row + 1,
              iniPai: ini,
            };
            stack.push(newObj);
          } else {
            result.push({ span: span, row: row + 1, ini: ini, name: obj.data[key] });
          }
          iniAux = ini;
          spanAux = span;
        });
    }
  }
  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs = result.map((r) => {
    const value = r.name.value || r.name;
    const columnSpan = r.span.value;
    const startRow = r.row;
    const endRow = startRow + 1;
    const startColumn = getIni(r.ini) + 1;
    const endColumn = startColumn + columnSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    return <div style={{ gridArea: `${startRow} / ${startColumn} / ${endRow} / ${endColumn} ` }}>{value}</div>;
  });
  divs.push(
    ...keys.map((k, i) => <div style={{ gridArea: `${i} / 1 / ${i + 1} / 2 ` }}>{keysMapping.get(k)}</div>),
    <div style={{ gridArea: `${maxEndRow} / 1 / ${maxEndRow + 1} / 2 ` }}>Totais</div>,
    <div style={{ gridArea: `1 / ${maxEndColumn} / ${maxEndRow - 1} / ${maxEndColumn + 1} ` }}>Total</div>,
    <div style={{ gridArea: `${maxEndRow - 1} / ${maxEndColumn} / ${maxEndRow} / ${maxEndColumn + 1} ` }}>
      {data.value}
    </div>
  );

  return (
    <>
      <div className="table result-table">{divs}</div>
    </>
  );
}

function getIni(ini: any) {
  const stack: any[] = [];

  stack.push(ini);

  let result = 1;

  while (stack.length) {
    const i = stack.pop();
    if (i.spanAux) {
      result += i.spanAux.value;
    }
    if (i.iniAux) {
      stack.push(i.iniAux);
    } else if (i.iniPai) {
      stack.push(i.iniPai);
    }
  }
  return result;
}
