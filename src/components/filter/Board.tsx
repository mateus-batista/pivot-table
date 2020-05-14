import React from "react";
import { Button, Cell, Grid, HFlow, VFlow } from "bold-ui";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { ItemTypes } from "../../types/ItemTypes";
import { Box } from "../box/Box";
import { Dropable } from "../dragndrop/Dropable";
import { Aggregators } from "./Aggregators";
interface BoardProps<T extends any> {
  keys: Map<keyof T, Set<string>>;
  keyMapping: Map<keyof T, string>;
  sample: T;
  handleSubmit: (values: [Array<keyof T>, Array<keyof T>], ignoredFilter: Map<keyof T, Set<string>>) => void;
  handleAggregatorChange: (aggregator: ((values: number[]) => number) | undefined) => void;
  handleAggregatorKeyChange: (key: keyof T) => void;
}

export function Board<T extends any>(props: BoardProps<T>) {
  const { keys, keyMapping, handleSubmit, sample, handleAggregatorChange, handleAggregatorKeyChange } = props;
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
    setIgnoredFilter(new Map(ignoredFilter));
  };

  return (
    <DndProvider backend={Backend}>
      <Grid>
        <Cell md={6}>
          <Box label="Campos disponíveis">
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
        <Cell md={6}>
          <Box label="Linhas">
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
        </Cell>
        <Cell md={6}>
          <Box label="Colunas">
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
        </Cell>
        <Cell md={6}>
          <VFlow>
            <Box label="Valor">
              <Aggregators
                sample={sample}
                keyMapping={keyMapping}
                handleAggregatorChange={handleAggregatorChange}
                handleAggregatorKeyChange={handleAggregatorKeyChange}
              />
            </Box>
            <HFlow justifyContent="flex-end">
              <Button kind="primary" size="medium" onClick={onClick}>
                Gerar tabela
              </Button>
            </HFlow>
          </VFlow>
        </Cell>
      </Grid>
    </DndProvider>
  );
}
