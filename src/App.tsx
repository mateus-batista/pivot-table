import React from "react";
import { PivotTable } from "./components/PivotTable";
import { PivotTableRef } from "./components/PivotTableRef";
import {
  atendimentos,
  AtendimentoProfissonalKeyMapping,
  AtendimentoProfissional
} from "./types/AtendimentoProfissional";

const App: React.FC = () => {
  return (
    <>
      <PivotTable<AtendimentoProfissional> data={atendimentos} keyMapping={AtendimentoProfissonalKeyMapping} />
      <PivotTableRef />
    </>
  );
};

export default App;
