import { Button, Cell, Grid, VFlow } from "bold-ui";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import "../../css/Tabela.css";
import { ItemTypes } from "../../types/ItemTypes";
import { Box } from "../box/Box";
import { Dropable } from "../dragndrop/Dropable";
import { css } from "@emotion/core";
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
    return ignoredFilter;
  };

  const style = css`
    padding: 4px;
  `;

  return (
    <DndProvider backend={Backend}>
      <Grid>
        <Cell xs={4}>
          <Box label="Campos disponíveis" styles={style}>
            <Dropable<T>
              filtroLocal={ignoredFilter}
              type={ItemTypes.FILTER}
              keyMapping={keyMapping}
              keys={keys}
              initialState={Array.from(keys.keys())}
              handleFilterUpdate={handleFilterUpdate}
              id={0}
            />
          </Box>
        </Cell>
        <Cell xs={8}>
          <VFlow>
            <Box label="Linhas" styles={style}>
              <Dropable<T>
                filtroLocal={ignoredFilter}
                handleUpdate={handleUpdateRowKeys}
                handleFilterUpdate={handleFilterUpdate}
                type={ItemTypes.FILTER}
                keyMapping={keyMapping}
                keys={keys}
                id={1}
              />
            </Box>
            <Box label="Colunas" styles={style}>
              <Dropable<T>
                id={2}
                filtroLocal={ignoredFilter}
                keyMapping={keyMapping}
                keys={keys}
                handleUpdate={handleUpdateColumnKeys}
                handleFilterUpdate={handleFilterUpdate}
                type={ItemTypes.FILTER}
              />
            </Box>
            <Button kind="primary" size="small" onClick={onClick}>
              Gerar tabela
            </Button>
          </VFlow>
        </Cell>
      </Grid>
    </DndProvider>
  );
}
