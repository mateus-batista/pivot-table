import { Dictionary } from "../PivotTable";
import React, { ReactElement } from "react";
import { Countable, CountableKeys } from "../../types/Countable";

export type VerticalTableProps<T> = {
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  data: Dictionary<T, keyof T> & Countable;
};

type GetColumnInputProps<T> = {
  data: any & Countable;
  rows: ReactElement[];
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
  headerSection?: Map<string, ReactElement>;
  startRow?: number;
  startColumn?: number;
};
type paranaue2<T> = {
  data: any & Countable;
  keys: Array<keyof T>;
  keysMapping: Map<keyof T, string>;
};
type paranaueReturns = {
  headerSection?: Map<string, ReactElement>;
  elements: ReactElement[];
};
type stack = {
  data: any & Countable;
  depth: number;
  key?: string;
  done: boolean;
};
type rowspan = {
  row: number;
  span: number;
};

type GetColumnReturnProps<T> = {
  elements: ReactElement[];
  columnSpan: number;
  rowSpan: number;
  headerSection: Map<string, ReactElement>;
};

export function VerticalTable<T>(props: VerticalTableProps<T>) {
  const { data, keysMapping } = props;

  const keys = [...props.keys];

  //const { elements, headerSection } = getColumn({ data, rows: [], keys, keysMapping });
  const { elements, headerSection } = getColumn2({ data, keys, keysMapping });

  elements.push(...Array.from(headerSection.values()));
  return (
    <>
      <div className="table result-table">{elements}</div>
    </>
  );
}

function getColumn2<T>({ data, keys, keysMapping }: paranaue2<T>): GetColumnReturnProps<T> {
  const headerSection: Map<string, ReactElement> = new Map<string, ReactElement>();
  const map = new Map<string, rowspan>();
  const rows: ReactElement[] = [];
  var stack: stack[] = [{ data: data, depth: 0, done: false }];
  const maxDepth = keys.length;
  var actualDepth = 0;
  var sequence: string[] = [];
  var count = 0;
  while (stack.length > 0) {
    const item = stack.pop();
    if (item !== undefined) {
      if (!item.done) {
        stack.push({ data: item.data, depth: item.depth, key: item.key, done: true });
      } else if (actualDepth > item.depth) {
        let x = Object.keys(item.data).filter((k) => !CountableKeys.includes(k));
        for (let index = 0; index < x.length; index++) {
          if (sequence.length >= item.depth) {
            sequence.pop();
          }
          console.log(x.length);
        }
      }
      actualDepth = item.depth;

      if (!item.done) {
        if (item.key !== undefined) {
          sequence.push(item.key);
        }

        if (actualDepth <= maxDepth) {
          Object.keys(item.data)
            .filter((k) => !CountableKeys.includes(k))
            .forEach((key) => {
              if (!(item.data instanceof Array)) {
                stack.push({ data: item.data[key], depth: item.depth + 1, key: key, done: false });
              }
            });
        }
        if (actualDepth === maxDepth) {
          count = count + 1;
          for (let index = 0; index < sequence.length; index++) {
            let temp = [...sequence];
            const element = temp.slice(0, sequence.length - index);
            let str = element.toString();
            let tc: rowspan | undefined = map.get(str);
            if (tc === undefined) {
              tc = { span: 0, row: 0 };
            }
            map.set(str, { span: tc.span + 1, row: element.length });
          }
          sequence.pop();
        }
      }
    }
  }
  //daqui pra baixo o print
  const columnSpan = count + 2;
  const rowSpan = maxDepth + 1;
  count = 0;
  var z = 0;
  var stack2: stack[] = [{ data: data, depth: 0, done: false, key: data.key }];
  sequence = [];
  actualDepth = 0;
  while (stack2.length > 0) {
    const item = stack2.pop();
    if (data.key === keys[0]) {
      headerSection.set(
        "totalLabel",
        <div
          key={`1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`}
          style={{
            gridArea: `1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`,
          }}
        >
          <b>Total</b>
        </div>
      );
      headerSection.set(
        "totalValue",
        <div
          key={`${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`}
          style={{
            gridArea: `${rowSpan} / ${columnSpan} / ${rowSpan + 1} / ${columnSpan + 1}`,
          }}
        >
          <b>{data.count}</b>
        </div>
      );
    }
    if (item !== undefined) {
      if (!item.done) {
        //stack2.push({ data: item.data, depth: item.depth, key: item.key, done: true });
      } else if (actualDepth > item.depth) {
        let x = Object.keys(item.data).filter((k) => !CountableKeys.includes(k));
        for (let index = 0; index < x.length; index++) {
          if (sequence.length >= item.depth) {
            sequence.pop();
          }
        }
      }
      if (item.depth === actualDepth) {
        z = z + 1;
      }
      actualDepth = item.depth;
      console.log(actualDepth + "aaaaa" + count);
      if (!item.done) {
        if (item.key !== undefined) {
          sequence.push(item.key);
        }
        const c = z;
        const a = actualDepth;

        if (actualDepth <= maxDepth) {
          Object.keys(item.data)
            .filter((k) => !CountableKeys.includes(k))
            .forEach((key, i) => {
              let startRow = a;
              let startColumn = i + 1;
              if (!(item.data instanceof Array)) {
                console.log(a + key + c);
                stack2.push({ data: item.data[key], depth: item.depth + 1, key: key, done: false });
                if (a !== maxDepth) {
                  console.log("aaaaaaaa");
                  rows.push(
                    <div
                      key={`${startRow + 1}/${startColumn + 1}/${startRow + 2}/${startColumn + 2}`}
                      style={{
                        gridArea: `${startRow + 1}/${startColumn + 1}/${startRow + 2}/${startColumn + 2}`,
                      }}
                    >
                      <b>{key}</b>
                    </div>
                  );
                  headerSection.set(
                    data.key,
                    <div
                      key={`1/ ${startRow}/${startRow + 1}/2`}
                      style={{
                        gridArea: `1/ ${startRow}  / ${startRow + 1} / 2`,
                      }}
                    >
                      <b>a{keysMapping.get(data.key)}</b>
                    </div>
                  );
                }
              }
            });
        }
        if (actualDepth === maxDepth) {
          count = count + 1;
          let startRow = rowSpan;
          let startColumn = count;
          rows.push(
            <div
              key={`${startRow}/${startColumn + 1}/${startRow + 1}/${startColumn + 2}`}
              style={{ gridArea: `${startRow} / ${startColumn + 1} / ${startRow + 1} / ${startColumn + 2}` }}
            >
              {item.data.length}
            </div>
          );
          headerSection.set(
            "totais",
            <div key={`${startRow}/1/${startRow + 1}/2`} style={{ gridArea: `${startRow} / 1 / ${startRow + 1} / 2 ` }}>
              <b>Totais</b>
            </div>
          );

          for (let index = 0; index < sequence.length; index++) {
            let temp = [...sequence];
            const element = temp.slice(0, sequence.length - index);
            let str = element.toString();
            let tc: rowspan | undefined = map.get(str);
            if (tc === undefined) {
              tc = { span: 0, row: 0 };
            }
            map.set(str, { span: tc.span + 1, row: element.length });
          }
          sequence.pop();
        }
      }
    }
  }
  //
  console.log(map);
  return { elements: rows, columnSpan: columnSpan, rowSpan: rowSpan, headerSection: headerSection };
}

function getColumn<T>({
  data,
  rows,
  keys,
  keysMapping,
  headerSection = new Map(),
  startRow = 1,
  startColumn = 2,
}: GetColumnInputProps<T>): GetColumnReturnProps<T> {
  if (data instanceof Array) {
    rows.push(
      <div
        key={`${startRow}/${startColumn}/${startRow + 1}/${startColumn + 1}`}
        style={{ gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${startColumn + 1}` }}
      >
        {data.length}
      </div>
    );
    headerSection.set(
      "totais",
      <div key={`${startRow}/1/${startRow + 1}/2`} style={{ gridArea: `${startRow} / 1 / ${startRow + 1} / 2 ` }}>
        <b>Totais</b>
      </div>
    );
    return { elements: rows, columnSpan: startColumn + 1, rowSpan: startRow + 1, headerSection: headerSection };
  }

  let columnSpan = 0;
  let rowSpan = 0;

  Object.keys(data)
    .filter((k) => !CountableKeys.includes(k))
    .forEach((key) => {
      const { elements: children, columnSpan: childColumnSpan, rowSpan: childRowSpan } = getColumn({
        data: data[key],
        rows: [],
        keys,
        keysMapping,
        headerSection,
        startColumn,
        startRow: startRow + 1,
      });
      columnSpan = childColumnSpan;
      rowSpan = childRowSpan;
      const root = (
        <div
          key={`${startRow}/${startColumn}/${startRow + 1}/${childColumnSpan}`}
          style={{
            gridArea: `${startRow} / ${startColumn} / ${startRow + 1} / ${childColumnSpan}`,
          }}
        >
          <b>{key}</b>
        </div>
      );
      headerSection.set(
        data.key,
        <div
          key={`${startRow}/1/${startRow + 1}/2`}
          style={{
            gridArea: `${startRow} / 1 / ${startRow + 1} / 2`,
          }}
        >
          <b>a{keysMapping.get(data.key)}</b>
        </div>
      );

      startColumn = childColumnSpan;

      rows.push(root);
      rows.push(...children);
    });

  if (data.key === keys[0]) {
    headerSection.set(
      "totalLabel",
      <div
        key={`1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`}
        style={{
          gridArea: `1 / ${columnSpan} / ${rowSpan - 1} / ${columnSpan + 1}`,
        }}
      >
        <b>Total</b>
      </div>
    );
    headerSection.set(
      "totalValue",
      <div
        key={`${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`}
        style={{
          gridArea: `${rowSpan - 1} / ${columnSpan} / ${rowSpan} / ${columnSpan + 1}`,
        }}
      >
        <b>{data.count}</b>
      </div>
    );
  }

  return { elements: rows, columnSpan: columnSpan, rowSpan: rowSpan, headerSection: headerSection };
}
