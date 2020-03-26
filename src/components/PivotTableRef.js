import React, { useEffect, useState } from "react";
import "react-pivottable/pivottable.css";
import PivotTableUI from "react-pivottable/PivotTableUI";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import TableRenderers from "react-pivottable/TableRenderers";
import Plot from "react-plotly.js";
import { atendimentos } from "../types/AtendimentoProfissional";

const PlotlyRenderers = createPlotlyRenderers(Plot);

export function PivotTableRef(props) {
  const [tableState, setTableState] = useState();

  const [data, setDate] = useState();

  useEffect(() => {
    setDate(atendimentos);
  }, []);

  if (data) {
    return (
      <PivotTableUI
        data={data}
        onChange={setTableState}
        {...tableState}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
      />
    );
  } else {
    return null;
  }
}
