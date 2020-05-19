import { VFlow } from "bold-ui";
import React from "react";
import {
  AtendimentoProfissional,
  AtendimentoProfissonalKeyMapping,
  atendimentos,
} from "../types/AtendimentoProfissional";
import { PivotTable } from "./PivotTable";

export function Home(props: any) {
  return (
    <div style={{ width: "90%", margin: "auto" }}>
      <VFlow vSpacing={4}>
        <PivotTable<AtendimentoProfissional> data={atendimentos} keyMapping={AtendimentoProfissonalKeyMapping} />
      </VFlow>
    </div>
  );
}
