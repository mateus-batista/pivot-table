import React from "react";
import { GroupResult } from "../../classes/GroupResult";
import { TreeRoot, TreeRootKeys } from "../../types/TreeRoot";
import { Dictionary } from "../PivotTable";

export type HorizontalTableNovoProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & TreeRoot;
};

export function HorizontalTable<T>(props: HorizontalTableNovoProps<T>) {
  const { data, keysMapping } = props;

  const keys = [...props.keys];

  const stack: any[] = [];

  stack.push({ data: data, column: 1 });

  const result: any[] = [];

  while (stack.length) {
    const obj = stack.shift();
    if (obj) {
      let spanAux: any;
      let iniAux: any;
      Object.keys(obj.data)
        .filter((k) => !TreeRootKeys.includes(k))
        .forEach((key, idx) => {
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

          const column = obj.column;
          const iniPai = obj.iniPai;

          const ini = { iniPai, spanAux, idx, iniAux };

          result.push({
            span: span,
            name: key,
            ini: ini,
            column: column,
          });

          if (!(obj.data[key] instanceof GroupResult)) {
            const newObj: any = {
              data: obj.data[key],
              spanTree: spanTree,
              column: column + 1,
              iniPai: ini,
            };
            stack.push(newObj);
          } else {
            result.push({ span: span, column: column + 1, ini: ini, name: obj.data[key].value });
          }
          iniAux = ini;
          spanAux = span;
        });
    }
  }

  let maxEndRow = 0;
  let maxEndColumn = 0;
  const divs: any[] = [];

  for (let i = 0; i < result.length; i++) {
    const r = result[i];
    const value = r.name;
    const rowSpan = r.span.value;
    const startColumn = r.column;
    const endColumn = startColumn + 1;
    const startRow = getIni(r.ini) + 1;
    const endRow = startRow + rowSpan;
    maxEndRow = endRow > maxEndRow ? endRow : maxEndRow;
    maxEndColumn = endColumn > maxEndColumn ? startColumn : maxEndColumn;
    divs.push(<span style={{ gridArea: `${startRow} / ${startColumn} / ${endRow} / ${endColumn} ` }}>{value}</span>);
  }
  const keyDivs = keys.map((k, i) => <div style={{ gridArea: `1 / ${i} / 2 / ${i + 1} ` }}>{keysMapping.get(k)}</div>);
  divs.push(...keyDivs);
  divs.push(
    <div style={{ gridArea: `1 / ${maxEndColumn} / 2 / ${maxEndColumn + 1} ` }}>Totais</div>,
    <div style={{ gridArea: `${maxEndRow} / 1 / ${maxEndRow + 1} / ${maxEndColumn} ` }}>Total</div>,
    <div style={{ gridArea: `${maxEndRow} / ${maxEndColumn} / ${maxEndRow + 1} / ${maxEndColumn + 1} ` }}>
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
