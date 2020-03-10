import React, { useState, useEffect } from "react";
import { groupBy, Dictionary } from "lodash";
import axios, { AxiosResponse } from "axios";
import { AtendimentoProfissional } from "./AtendimentoProfissional";
import { Tabela } from "./Tabela";

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
  const [data, setData] = useState();

  const keys: Array<keyof AtendimentoProfissional> = [
    "unidadeSaude",
    "tipoAtendimento",
    "sexo",
    "nomeProfissional"
  ];

  useEffect(() => {
    console.log("fetching...");
    axios
      .get("http://localhost:8080/api/atendimentos")
      .then((response: AxiosResponse<AtendimentoProfissional[]>) => {
        const inicio = new Date().getTime();
        console.log("fetched");
        console.log("grouping...");
        const grouped = group<AtendimentoProfissional>(response.data, keys);
        console.log("grouped", (new Date().getTime() - inicio) / 1000);
        console.log(grouped);
        setData(grouped);
      });
  }, []);

  if (data) {
    return <Tabela<AtendimentoProfissional> mapa={data} chaves={keys} />;
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

function media<T>(
  list: T[],
  key: keyof Omit<SubType<T, number>, "id">,
  lista: T[]
) {
  let x = 0;
  lista.forEach(value => (x += Number(value[key])));
  return x / list.length;
}

function soma<T>(key: keyof Omit<SubType<T, number>, "id">, lista: T[]) {
  let x = 0;
  lista.forEach(value => (x += Number(value[key])));
  return x;
}
