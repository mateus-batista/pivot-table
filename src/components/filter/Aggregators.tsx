import { Select } from "bold-ui";
import React, { useState } from "react";
import { Box } from "../box/Box";

export type AggregatorsProps<T extends any> = {
  sample: T;
  keyMapping: Map<keyof T, string>;
  handleAggregatorChange: (aggregator: ((values: number[]) => number) | undefined) => void;
  handleAggregatorKeyChange: (key: keyof T) => void;
};

type ItemType = { label: string; value: ((values: number[]) => number) | undefined };

export function Aggregators<T extends any>(props: AggregatorsProps<T>) {
  const { sample, keyMapping, handleAggregatorKeyChange, handleAggregatorChange } = props;

  const [aggregator, setAggregator] = useState<ItemType>(functionArr[0]);
  const [key, setKey] = useState<keyof T>();

  const numberKeys = Object.keys(sample).filter((k) => typeof sample[k] === "number");
  // .map(n => ({label: keyMapping.get(n) || n, value: n}))

  const itemToString = (item: keyof T | null) => (item ? keyMapping.get(item) || (item as string) : "");

  const handleKeySelect = (item: keyof T) => {
    setKey(item);
    handleAggregatorKeyChange(item);
  };

  const handleAggregatorSelect = (item: ItemType) => {
    setAggregator(item);
    handleAggregatorChange(item.value);
  };

  const outroItemToString = (item: ItemType | null) => (item ? item.label : "");

  return (
    <Box label="Funções">
      <Select<ItemType>
        items={functionArr}
        label="Função"
        itemToString={outroItemToString}
        value={aggregator}
        onChange={handleAggregatorSelect}
      />
      {aggregator?.value && (
        <Select<keyof T>
          items={numberKeys}
          label="Chaves"
          itemToString={itemToString}
          value={key}
          onChange={handleKeySelect}
        />
      )}
    </Box>
  );
}
const functionArr: ItemType[] = [
  { label: "Contagem", value: undefined },
  {
    label: "Média",
    value: (values: number[]): number => values.reduce((prev, curr) => prev + curr) / values.length,
  },
  {
    label: "Máximo",
    value: (values: number[]): number => values.reduce((prev, curr) => (prev > curr ? prev : curr)),
  },
  {
    label: "Mínimo",
    value: (values: number[]): number => values.reduce((prev, curr) => (prev < curr ? prev : curr)),
  },
];
