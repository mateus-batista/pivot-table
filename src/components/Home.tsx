import React from "react";
import {
  AtendimentoProfissional,
  AtendimentoProfissonalKeyMapping,
  atendimentos,
} from "../types/AtendimentoProfissional";
import { PivotTable } from "./PivotTable";

export function Home(props: any) {
  return (
    <>
      <PivotTable<AtendimentoProfissional> data={atendimentos} keyMapping={AtendimentoProfissonalKeyMapping} />
      {/* <PivotTableRef /> */}
    </>
  );
}
