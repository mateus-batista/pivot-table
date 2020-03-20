import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { AtendimentoProfissional } from "../../types/AtendimentoProfissional";
import { Dropable } from "../dragndrop/Dropable";
import ItemTypes from "../../types/ItemTypes";

interface BoardProps {
  handleSubmit: (values: [Array<keyof AtendimentoProfissional>, Array<keyof AtendimentoProfissional>]) => void;
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
      position={"topleft"}
      handleUpdate={handleUpdateVazio}
      types={[ItemTypes.FILTER]}
      initialState={["duracao", "unidadeSaude", "sexo", "nomeProfissional", "tipoAtendimento"]}
      id={0}
    >
      <div>
        <span>Filtros</span>
        <hr />
      </div>
    </Dropable>
  );
  drops.push(
    <Dropable position={"bottomleft"} handleUpdate={handleUpdateLinhas} types={[ItemTypes.FILTER]} initialState={[]} id={1}>
      <div>
        <span>Linhas</span>
        <hr />
      </div>
    </Dropable>
  );
  drops.push(
    <Dropable position={"topright"} handleUpdate={handleUpdateColunas} types={[ItemTypes.FILTER]} initialState={[]} id={2}>
      <div>
        <span>Colunas</span>
        <hr />
      </div>
    </Dropable>
  );
  return (
    <DndProvider backend={Backend}>
      {drops}
      <button onClick={handleSubmit}>Aplicar</button>
    </DndProvider>
  );
}
