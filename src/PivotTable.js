import React, { useState, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import * as axios from "axios";
import TableRenderers from "react-pivottable/TableRenderers";
import Plot from "react-plotly.js";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";

const PlotlyRenderers = createPlotlyRenderers(Plot);

export function PivotTable(props) {
  const [tableState, setTableState] = useState();

  const [data, setDate] = useState();

  useEffect(() => {
    axios.default
      .get("http://localhost:8080/api/atendimentos")
      .then(response => {
        setDate(response.data);
      });
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
