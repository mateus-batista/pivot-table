import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import "../../css/Tabela.css";
import { AtendimentoProfissional, AtendimentoProfissonalKeyMapping } from "../../types/AtendimentoProfissional";
import { Dropable } from "../dragndrop/Dropable";
import { ItemTypes } from "../../types/ItemTypes";
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
      <Dropable<AtendimentoProfissional>
        position={"table-topleft"}
        handleUpdate={handleUpdateVazio}
        type={ItemTypes.FILTER}
        keyMapping={AtendimentoProfissonalKeyMapping}
        initialState={["duracao", "unidadeSaude", "sexo", "nomeProfissional", "tipoAtendimento"]}
        id={0}
      >
        <div>
          <span>Filtros</span>
          <hr />
        </div>
      </Dropable>
      <Dropable<AtendimentoProfissional>
        position={"table-bottomleft"}
        handleUpdate={handleUpdateLinhas}
        type={ItemTypes.FILTER}
        keyMapping={AtendimentoProfissonalKeyMapping}
        id={1}
      >
        <div>
          <span>Linhas</span>
          <hr />
        </div>
      </Dropable>
      <Dropable<AtendimentoProfissional>
        id={2}
        keyMapping={AtendimentoProfissonalKeyMapping}
        position={"table-topright"}
        handleUpdate={handleUpdateColunas}
        type={ItemTypes.FILTER}
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
