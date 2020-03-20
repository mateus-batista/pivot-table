import React from "react";
import "./App.css";
import { Home } from "./components/Home";
import { PivotTable } from "./components/PivotTable";

const App: React.FC = () => {
  return (
    <div className="App">
      <Home />
      <PivotTable />
    </div>
  );
};

export default App;
