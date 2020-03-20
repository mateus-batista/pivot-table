import { Dictionary, groupBy } from "lodash";
import React, { useEffect, useState } from "react";
import { AtendimentoProfissional, atendimentos } from "../types/AtendimentoProfissional";
import { Board } from "./filter/Board";
import { TabelaHorizontal } from "./tables/TabelaHorizontal";
import { TabelaMixed } from "./tables/TabelaMixed";
import { TabelaVertical } from "./tables/TabelaVertical";
import { Countable, CountableKeys } from "../types/Countable";
import "../css/Tabela.css";

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

type KeyType = keyof Omit<SubType<Teste, number>, "id">;

export function Home(props: any) {
  const [data, setData] = useState<AtendimentoProfissional[]>();

  const [linhas, setLinhas] = useState<Array<keyof AtendimentoProfissional>>([]);

  const [colunas, setColunas] = useState<Array<keyof AtendimentoProfissional>>([]);

  const [agrupadoUnico, setAgrupadoUnico] = useState<Dictionary<AtendimentoProfissional> & Countable>();

  const [agrupadoMisto, setAgrupadoMisto] = useState<Dictionary<AtendimentoProfissional> & Countable>();

  useEffect(() => {
    // console.log("fetching...");
    // axios
    //   .get("http://150.162.18.178:8080/api/atendimentos")
    //   .then((response: AxiosResponse<AtendimentoProfissional[]>) => {
    //     console.log("fetched");
    //     setData(response.data);
    // });
    setData(atendimentos);
  }, []);

  useEffect(() => {
    if (data) {
      const inicio = new Date().getTime();
      console.log("grouping...");
      setAgrupadoUnico(
        group<AtendimentoProfissional>(data, [...linhas, ...colunas])
      );
      if (linhas.length > 0 && colunas.length > 0) {
        setAgrupadoMisto(
          group<AtendimentoProfissional>(data, [...colunas, ...linhas])
        );
      }
      console.log("grouped", (new Date().getTime() - inicio) / 1000);
    }
  }, [data, linhas, colunas]);

  const handleSubmit = (values: [Array<keyof AtendimentoProfissional>, Array<keyof AtendimentoProfissional>]) => {
    const [linhas, colunas] = values;

    setLinhas(linhas);
    setColunas(colunas);
  };

  console.log(agrupadoUnico);
  console.log(agrupadoMisto);

  return (
    <>
      <div className={"filter-table table"}>
        <Board handleSubmit={handleSubmit} />
        <div className="table-bottomright">
          {agrupadoUnico && agrupadoMisto ? (
            <TabelaMixed mapaLinhas={agrupadoUnico} mapaColunas={agrupadoMisto} colunas={colunas} linhas={linhas} />
          ) : agrupadoUnico && linhas.length > 0 && colunas.length === 0 ? (
            <TabelaHorizontal mapa={agrupadoUnico} linhas={linhas} />
          ) : agrupadoUnico && linhas.length === 0 && colunas.length > 0 ? (
            <TabelaVertical<AtendimentoProfissional> mapa={agrupadoUnico} colunas={colunas} />
          ) : null}
        </div>
      </div>
    </>
  );
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
