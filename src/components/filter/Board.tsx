import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import "../../css/Tabela.css";
import { ItemTypes } from "../../types/ItemTypes";
import { Dropable } from "../dragndrop/Dropable";
interface BoardProps<T> {
  keys: Map<keyof T, Set<string>>;
  keyMapping: Map<keyof T, string>;
  handleSubmit: (values: [Array<keyof T>, Array<keyof T>], ignoredFilter: Map<keyof T, Set<string>>) => void;
}

export function Board<T>(props: BoardProps<T>) {
  const { keys, keyMapping, handleSubmit } = props;
  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);
  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);
  const [ignoredFilter, setIgnoredFilter] = useState<Map<keyof T, Set<string>>>(new Map<keyof T, Set<string>>());
  const onClick = (event: any) => {
    handleSubmit([rowKeys, columnKeys], ignoredFilter);
  };
  const handleUpdateRowKeys = (rowKeys: Array<keyof T>) => {
    setRowKeys(rowKeys);
  };
  const handleUpdateColumnKeys = (columnKeys: Array<keyof T>) => {
    setColumnKeys(columnKeys);
  };
  const handleFilterUpdate = (key: keyof T, filtro: Set<string>) => {
    ignoredFilter.set(key, filtro);
  };

  return (
    <DndProvider backend={Backend}>
      <Dropable<T>
        position={"table-topleft"}
        titulo={"filtros"}
        type={ItemTypes.FILTER}
        keyMapping={keyMapping}
        keys={keys}
        initialState={Array.from(keys.keys())}
        handleFilterUpdate={handleFilterUpdate}
        id={0}
      />
      <Dropable<T>
        position={"table-bottomleft"}
        titulo={"linhas"}
        handleUpdate={handleUpdateRowKeys}
        handleFilterUpdate={handleFilterUpdate}
        type={ItemTypes.FILTER}
        keyMapping={keyMapping}
        keys={keys}
        id={1}
      />
      <Dropable<T>
        id={2}
        titulo={"colunas"}
        keyMapping={keyMapping}
        keys={keys}
        position={"table-topright"}
        handleUpdate={handleUpdateColumnKeys}
        handleFilterUpdate={handleFilterUpdate}
        type={ItemTypes.FILTER}
      />
      <button onClick={onClick}>Aplicar</button>
    </DndProvider>
  );
}
