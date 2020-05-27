/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ReactElement } from "react";
import { Button, Cell, Grid, HFlow, VFlow, Tag, useTheme } from "bold-ui";
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
  handleSubmit: (values: [Array<keyof T>, Array<keyof T>], filterValues: Map<keyof T, Set<string>>) => void;
  handleAggregatorChange: (aggregator: ((values: number[]) => number) | undefined) => void;
  handleAggregatorKeyChange: (key: keyof T) => void;
}

export function Board<T extends any>(props: BoardProps<T>) {
  const { keys, keyMapping, handleSubmit, sample, handleAggregatorChange, handleAggregatorKeyChange } = props;

  const deepCopy = new Map<keyof T, Set<string>>();

  for (let [key, value] of keys) {
    deepCopy.set(key, new Set(value));
  }

  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([]);
  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([]);
  const [filterState, setFilterState] = useState<Map<keyof T, Set<string>>>(new Map<keyof T, Set<string>>(deepCopy));
  const theme = useTheme();

  console.log("keys", keys);

  const onClick = (event: any) => {
    handleSubmit([rowKeys, columnKeys], filterState);
  };
  const handleUpdateRowKeys = (rowKeys: Array<keyof T>) => {
    setRowKeys(rowKeys);
  };
  const handleUpdateColumnKeys = (columnKeys: Array<keyof T>) => {
    setColumnKeys(columnKeys);
  };
  const handleFilterUpdate = (key: keyof T, filtro: Set<string>) => {
    if (filtro.size < 1) {
      filterState.delete(key);
    } else {
      filterState.set(key, filtro);
    }
    setFilterState(new Map(filterState));
  };

  const handleTagFilterRemove = (key: keyof T, value: string) => {
    const values = filterState.get(key) || new Set<string>();
    values?.delete(value);
    handleFilterUpdate(key, values);
  };

  const handleLimparFiltros = () => {
    setFilterState(new Map<keyof T, Set<string>>());
  };

  const filterValuesTags: ReactElement[] = [];

  for (let [key, values] of filterState) {
    const tags: ReactElement[] = [];

    if (keys.get(key)?.size === values.size) {
      continue;
    }

    let idx = 0;
    for (let value of values) {
      if (idx < 3) {
        tags.push(
          <Tag
            key={value}
            removable
            onRemove={() => handleTagFilterRemove(key, value)}
            type="info"
            style={{ marginLeft: "0.5rem", marginBottom: "0.25rem" }}
          >
            {value}
          </Tag>
        );
      } else {
        break;
      }
      idx++;
    }

    if (values.size > 3) {
      tags.push(
        <Tag key={key as string} type="info" style={{ marginLeft: "0.5rem", marginBottom: "0.25rem" }}>
          {`+ ${values.size - 3} ${keyMapping.get(key)}`}
        </Tag>
      );
    }

    filterValuesTags.push(
      <HFlow hSpacing={0.25} alignItems="center" key={key as string}>
        <div>{`${keyMapping.get(key)}`}</div>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
          `}
        >
          {tags}
        </div>
      </HFlow>
    );
  }

  const filterValuesBox = <VFlow>{filterValuesTags}</VFlow>;

  return (
    <DndProvider backend={Backend}>
      <Grid>
        <Cell md={6} sm={12} xs={12}>
          <Box label="Campos disponíveis">
            <Dropable<T>
              filterState={filterState}
              type={ItemTypes.FILTER}
              keyMapping={keyMapping}
              keys={keys}
              initialState={Array.from(keys.keys())}
              handleFilterUpdate={handleFilterUpdate}
              id={0}
            />
          </Box>
        </Cell>
        <Cell md={6} sm={12} xs={12}>
          <Box label="Colunas" icon="hamburguerMenu" rotation="90">
            <Dropable<T>
              id={2}
              filterState={filterState}
              keyMapping={keyMapping}
              keys={keys}
              handleKeyUpdate={handleUpdateColumnKeys}
              handleFilterUpdate={handleFilterUpdate}
              type={ItemTypes.FILTER}
            />
          </Box>
        </Cell>
        <Cell md={6} sm={12} xs={12}>
          <Box label="Linhas" icon="hamburguerMenu">
            <Dropable<T>
              filterState={filterState}
              handleKeyUpdate={handleUpdateRowKeys}
              handleFilterUpdate={handleFilterUpdate}
              type={ItemTypes.FILTER}
              keyMapping={keyMapping}
              keys={keys}
              id={1}
            />
          </Box>
        </Cell>
        <Cell md={6} sm={12} xs={12}>
          <VFlow>
            <Box label="Valor">
              <div
                css={css`
                  padding: 0.75rem;
                  margin: 0.25rem;
                  min-height: 7.18rem;
                `}
              >
                <Aggregators
                  sample={sample}
                  keyMapping={keyMapping}
                  handleAggregatorChange={handleAggregatorChange}
                  handleAggregatorKeyChange={handleAggregatorKeyChange}
                />
              </div>
            </Box>
            <HFlow justifyContent="flex-end">
              <Button kind="primary" size="medium" onClick={onClick}>
                Gerar tabela
              </Button>
            </HFlow>
          </VFlow>
        </Cell>
        <Cell sm={12}>
          <div
            css={css`
              border: 1px solid ${theme.pallete.gray.c80};
              padding: 0.75rem 1.25rem;
            `}
          >
            <Grid wrap alignItems="center">
              <Cell size={10}>
                <HFlow alignItems="center">
                  <b>Valores filtrados</b>
                  {filterValuesBox}
                </HFlow>
              </Cell>
              <Cell size={2}>
                <HFlow></HFlow>
                <Button
                  onClick={handleLimparFiltros}
                  size="small"
                  kind="normal"
                  skin="outline"
                  style={{ float: "right" }}
                >
                  Limpar filtros
                </Button>
              </Cell>
            </Grid>
          </div>
        </Cell>
      </Grid>
    </DndProvider>
  );
}
