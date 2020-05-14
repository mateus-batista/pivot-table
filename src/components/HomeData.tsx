import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { AtendimentoProfissional, AtendimentoProfissonalKeyMapping } from "../types/AtendimentoProfissional";
import { PivotTable } from "./PivotTable";

export function Home(props: any) {
  const [data, setData] = useState<AtendimentoProfissional[]>();

  useEffect(() => {
    axios.get("http://localhost:8080/api/atendimentos").then((response: AxiosResponse<AtendimentoProfissional[]>) => {
      setData(response.data);
    });
  }, []);

  if (data) {
    return (
      <div style={{ width: "90%", margin: "auto" }}>
        <PivotTable<AtendimentoProfissional> data={data} keyMapping={AtendimentoProfissonalKeyMapping} />
      </div>
    );
  } else {
    return <div>NO DATA</div>;
  }
}
