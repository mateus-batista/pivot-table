import { HFlow, Radio, Select, VFlow } from "bold-ui";
import React, { useState } from "react";

export type AggregatorsProps<T extends any> = {
  sample: T;
  keyMapping: Map<keyof T, string>;
  handleAggregatorChange: (aggregator: ((values: number[]) => number) | undefined) => void;
  handleAggregatorKeyChange: (key: keyof T) => void;
};

type ItemType = { label: string; value: ((values: number[]) => number) | undefined; default?: boolean };

export function Aggregators<T extends any>(props: AggregatorsProps<T>) {
  const { sample, keyMapping, handleAggregatorKeyChange, handleAggregatorChange } = props;

  const [aggregator, setAggregator] = useState<ItemType>(functionArr[0]);
  const [key, setKey] = useState<keyof T>();

  const numberKeys = Object.keys(sample).filter((k) => typeof sample[k] === "number");

  const itemToString = (item: keyof T | null) => (item ? keyMapping.get(item) || (item as string) : "");

  const handleKeySelect = (item: keyof T) => {
    setKey(item);
    handleAggregatorKeyChange(item);
  };

  const handleAggregatorSelect = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(evt.target.value);
    const agg = functionArr[idx];
    setAggregator(agg);
    handleAggregatorChange(agg.value);
  };

  return (
    <VFlow>
      <HFlow>
        {functionArr.map((f, idx) => (
          <Radio
            key={idx}
            name="aggregator"
            checked={f.default}
            label={f.label}
            value={idx}
            onChange={handleAggregatorSelect}
          />
        ))}
      </HFlow>
      {aggregator?.value && (
        <Select<keyof T> items={numberKeys} itemToString={itemToString} value={key} onChange={handleKeySelect} />
      )}
    </VFlow>
  );
}
const functionArr: ItemType[] = [
  { label: "Contagem", value: undefined, default: true },
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
