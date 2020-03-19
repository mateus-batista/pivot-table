import React from "react";
import "./App.css";
import { PivotTable } from "./PivotTable";
import { Tests } from "./Testes";
import { Board } from "./Board";

const App: React.FC = () => {
  return (
    <div className="App">
      <Tests />
    </div>
  );
};

export default App;
