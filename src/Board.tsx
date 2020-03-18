import React, { useState } from "react";
import { Draggable } from "./Draggable";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { Dropable, DragItem } from "./Dropable";
import ItemTypes from "./ItemTypes";
import { AtendimentoProfissional } from "./AtendimentoProfissional";

interface BoardProps {
  handleSubmit: (
    values: [Array<keyof AtendimentoProfissional>, Array<keyof AtendimentoProfissional>]
  ) => void;
}

export function Board(props: BoardProps) {
  const drops = [];

  const [linhas, setLinhas] = useState<Array<keyof AtendimentoProfissional>>([]);
  const [colunas, setColunas] = useState<Array<keyof AtendimentoProfissional>>([]);
  const handleSubmit = (event: any) => {
    console.log(linhas);
    props.handleSubmit([linhas, colunas]);
  };
  const handleUpdateLinhas = (linhas: Array<keyof AtendimentoProfissional>) => {
    setLinhas(linhas);
  };
  const handleUpdateColunas = (colunas: Array<keyof AtendimentoProfissional>) => {
    setColunas(colunas);
  };
  const handleUpdateVazio = (colunas: Array<keyof AtendimentoProfissional>) => {};

  drops.push(
    <Dropable
      handleUpdate={handleUpdateVazio}
      types={[ItemTypes.FILTER]}
      initialState={[
        "duracao",
        "unidadeSaude",
        "sexo",
        "nomeProfissional",
        "tipoAtendimento",
      ]}
      id={0}
    >
      <div>
        <span>Filtros</span>
        <hr />
      </div>
    </Dropable>
  );
  drops.push(
    <Dropable
      handleUpdate={handleUpdateLinhas}
      types={[ItemTypes.FILTER]}
      initialState={[]}
      id={1}
    >
      <div>
        <span>Linhas</span>
        <hr />
      </div>
    </Dropable>
  );
  drops.push(
    <Dropable
      handleUpdate={handleUpdateColunas}
      types={[ItemTypes.FILTER]}
      initialState={[]}
      id={2}
    >
      <div>
        <span>Colunas</span>
        <hr />
      </div>
    </Dropable>
  );
  return (
    <DndProvider backend={Backend}>
      <div
        style={{
          width: "500px",
          height: "300",
          flexWrap: "wrap",
          display: "flex",
        }}
      >
        {drops}
      </div>
      <button onClick={handleSubmit}>batata</button>
      <div>{linhas}</div>
    </DndProvider>
  );
}
