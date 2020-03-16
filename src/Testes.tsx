import axios, { AxiosResponse } from "axios";
import { Dictionary, groupBy } from "lodash";
import React, { useEffect, useState } from "react";
import { AtendimentoProfissional } from "./AtendimentoProfissional";
import { Filtro } from "./Filtro";
import { TabelaWithCellsColumn } from "./TabelaWithCellsColumn";

type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

type Teste = {
  id: number;
  idade: number;
  peso: number;
  name: string;
};

export type Countable = {
  key?: string;
  count?: number;
};

export const CountableKeys = ["key", "count"];

type KeyType = keyof Omit<SubType<Teste, number>, "id">;

export function Tests(props: any) {
  const [data, setData] = useState<AtendimentoProfissional[]>();

  const [keys, setKeys] = useState<Array<keyof AtendimentoProfissional>>([]);

  const [result, setResult] = useState<Dictionary<AtendimentoProfissional> & Countable>();

  useEffect(() => {
    console.log("fetching...");
    axios
      .get("http://150.162.18.178:8080/api/atendimentos")
      .then((response: AxiosResponse<AtendimentoProfissional[]>) => {
        console.log("fetched");
        setData(response.data);
      });
  }, []);

  useEffect(() => {
    if (data) {
      const inicio = new Date().getTime();
      console.log("grouping...");
      setResult(group<AtendimentoProfissional>(data, keys));
      console.log("grouped", (new Date().getTime() - inicio) / 1000);
    }
  }, [data, keys]);

  const handleSubmit = (value: any) => setKeys(value);

  console.log(result);
  if (result) {
    return (
      <>
        <Filtro handleSubmit={handleSubmit} />
        <TabelaWithCellsColumn<AtendimentoProfissional>
          mapa={result}
          chavesLinhas={keys}
        />
      </>
    );
  } else {
    return null;
  }
}

function group<T>(arr: T[], keys: Array<keyof T>): any & Countable {
  let key = keys[0];

  if (!key) {
    return arr;
  }

  const obj: Dictionary<T[]> & Countable = groupBy(arr, key);

  obj.key = key as string;
  obj.count = arr.length;

  Object.keys(obj)
    .filter(k => !CountableKeys.includes(k))
    .forEach(k => {
      const arr = obj[k];
      obj[k] = group(arr, keys.slice(1, keys.length));
    });

  return obj;
}

function media<T>(list: T[], key: keyof Omit<SubType<T, number>, "id">, lista: T[]) {
  let x = 0;
  lista.forEach(value => (x += Number(value[key])));
  return x / list.length;
}

function soma<T>(key: keyof Omit<SubType<T, number>, "id">, lista: T[]) {
  let x = 0;
  lista.forEach(value => (x += Number(value[key])));
  return x;
}
