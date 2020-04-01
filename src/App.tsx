import React, { useState, useEffect } from "react";
import { PivotTable } from "./components/PivotTable";
import { PivotTableRef } from "./components/PivotTableRef";
import {
  atendimentos,
  AtendimentoProfissonalKeyMapping,
  AtendimentoProfissional
} from "./types/AtendimentoProfissional";
import axios, { AxiosResponse } from "axios";
const App: React.FC = () => {
  const [data, setData] = useState();

  useEffect(() => {
    axios.get("http://localhost:8080/api/atendimentos").then((response: AxiosResponse<AtendimentoProfissional[]>) => {
      setData(response.data);
    });
  }, []);

  if (data) {
    return (
      <>
        <PivotTable<AtendimentoProfissional> data={data} keyMapping={AtendimentoProfissonalKeyMapping} />
        <PivotTableRef />
      </>
    );
  } else {
    return null;
  }
};

export default App;
