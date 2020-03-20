import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { AtendimentoProfissional } from "../../types/AtendimentoProfissional";
import { Dropable } from "../dragndrop/Dropable";
import ItemTypes from "../../types/ItemTypes";
import "../../css/Tabela.css";

interface BoardProps {
  handleSubmit: (values: [Array<keyof AtendimentoProfissional>, Array<keyof AtendimentoProfissional>]) => void;
}

export function Board(props: BoardProps) {
  const [linhas, setLinhas] = useState<Array<keyof AtendimentoProfissional>>([]);
  const [colunas, setColunas] = useState<Array<keyof AtendimentoProfissional>>([]);
  const handleSubmit = (event: any) => {
    props.handleSubmit([linhas, colunas]);
  };
  const handleUpdateLinhas = (linhas: Array<keyof AtendimentoProfissional>) => {
    setLinhas(linhas);
  };
  const handleUpdateColunas = (colunas: Array<keyof AtendimentoProfissional>) => {
    setColunas(colunas);
  };
  const handleUpdateVazio = (colunas: Array<keyof AtendimentoProfissional>) => {};

  return (
    <DndProvider backend={Backend}>
      <Dropable
        position={"table-topleft"}
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
      <Dropable
        position={"table-bottomleft"}
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
      <Dropable
        position={"table-topright"}
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
      <button onClick={handleSubmit}>Aplicar</button>
    </DndProvider>
  );
}
