import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { PivotTable } from "./PivotTable";
import { PivotTableRef } from "./PivotTableRef";
import { AtendimentoProfissional, AtendimentoProfissonalKeyMapping } from "../types/AtendimentoProfissional";

export function Home(props: any) {
  const [data, setData] = useState<AtendimentoProfissional[]>();

  useEffect(() => {
    axios.get("http://localhost:8080/api/atendimentos").then((response: AxiosResponse<AtendimentoProfissional[]>) => {
      setData(response.data);
    });
  }, []);

  if (data) {
    return (
      <>
        <PivotTable<AtendimentoProfissional> data={data} keyMapping={AtendimentoProfissonalKeyMapping} />
        {/* <PivotTableRef /> */}
      </>
    );
  } else {
    return <div>NO DATA</div>;
  }
}
