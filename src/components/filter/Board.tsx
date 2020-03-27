import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import "../../css/Tabela.css";
import { ItemTypes } from "../../types/ItemTypes";
import { Dropable } from "../dragndrop/Dropable";
interface BoardProps<T> {
  keys: Map<keyof T, Set<string>>;
  keyMapping: Map<keyof T, string>;
  handleSubmit: (values: [Array<keyof T>, Array<keyof T>]) => void;
}

export function Board<T>(props: BoardProps<T>) {
  const { keys, keyMapping, handleSubmit } = props;
  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);
  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);
  const onClick = (event: any) => {
    handleSubmit([rowKeys, columnKeys]);
  };
  const handleUpdateRowKeys = (rowKeys: Array<keyof T>) => {
    setRowKeys(rowKeys);
  };
  const handleUpdateColumnKeys = (columnKeys: Array<keyof T>) => {
    setColumnKeys(columnKeys);
  };

  return (
    <DndProvider backend={Backend}>
      <Dropable<T>
        position={"table-topleft"}
        type={ItemTypes.FILTER}
        keyMapping={keyMapping}
        initialState={Array.from(keys.keys())}
        id={0}
      >
        <div>
          <span>Filtros</span>
          <hr />
        </div>
      </Dropable>
      <Dropable<T>
        position={"table-bottomleft"}
        handleUpdate={handleUpdateRowKeys}
        type={ItemTypes.FILTER}
        keyMapping={keyMapping}
        id={1}
      >
        <div>
          <span>Linhas</span>
          <hr />
        </div>
      </Dropable>
      <Dropable<T>
        id={2}
        keyMapping={keyMapping}
        position={"table-topright"}
        handleUpdate={handleUpdateColumnKeys}
        type={ItemTypes.FILTER}
      >
        <div>
          <span>Colunas</span>
          <hr />
        </div>
      </Dropable>
      <button onClick={onClick}>Aplicar</button>
    </DndProvider>
  );
}
