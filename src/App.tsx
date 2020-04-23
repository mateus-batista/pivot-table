import React from "react";
import { PivotTable } from "./components/PivotTable";
import { PivotTableRef } from "./components/PivotTableRef";
import {
  AtendimentoProfissional,
  AtendimentoProfissonalKeyMapping,
  atendimentos,
} from "./types/AtendimentoProfissional";
const App: React.FC = () => {
  // const [data, setData] = useState();

  // useEffect(() => {
  //   axios.get("http://localhost:8080/api/atendimentos").then((response: AxiosResponse<AtendimentoProfissional[]>) => {
  //     setData(response.data);
  //   });
  // }, []);

  return (
    <>
      <PivotTable<AtendimentoProfissional> data={atendimentos} keyMapping={AtendimentoProfissonalKeyMapping} />
      <PivotTableRef />
    </>
  );
};

export default App;
