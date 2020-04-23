/* eslint-disable */
import React from "react";

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

function media<T>(list: T[], key: keyof Omit<SubType<T, number>, "id">, lista: T[]) {
  let x = 0;
  lista.forEach((value) => (x += Number(value[key])));
  return x / list.length;
}

function soma<T>(key: keyof Omit<SubType<T, number>, "id">, lista: T[]) {
  let x = 0;
  lista.forEach((value) => (x += Number(value[key])));
  return x;
}

function average<T>(accumulator: number, curr: T | number): number {
  const aggregatorKey = "duracao" as keyof T;
  let value: any;
  if (typeof curr === "number") {
    value = curr;
  } else {
    value = curr[aggregatorKey];
  }
  return (accumulator + value) / 2;
}
