import React, { useState } from "react";
import { AtendimentoProfissional } from "../../types/AtendimentoProfissional";

export type FiltroProps = {
  handleSubmit: (
    values: [Array<keyof AtendimentoProfissional>, Array<keyof AtendimentoProfissional>]
  ) => void;
};

export function Filtro(props: FiltroProps) {
  const [linhas, setLinhas] = useState<Array<keyof AtendimentoProfissional>>([]);
  const [colunas, setColunas] = useState<Array<keyof AtendimentoProfissional>>([]);

  const handleLinhas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;

    if (target.checked) {
      setLinhas([...linhas, target.name as keyof AtendimentoProfissional]);
    } else {
      setLinhas(linhas.filter(v => v !== target.name));
    }
  };

  const handleColunas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;

    if (target.checked) {
      setColunas([...colunas, target.name as keyof AtendimentoProfissional]);
    } else {
      setColunas(colunas.filter(v => v !== target.name));
    }
  };

  const handleLimpar = (event: any) => {
    setColunas([]);
    setLinhas([]);
  };

  const onSubmit = (event: any) => {
    props.handleSubmit([linhas, colunas]);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ margin: "0 10px 0 10px" }}>
          <div>
            <b>Linhas</b>
          </div>
          <input
            type="checkbox"
            name="unidadeSaude"
            id="unidadeSaude"
            onChange={handleLinhas}
            disabled={colunas.includes("unidadeSaude")}
            checked={linhas.includes("unidadeSaude")}
          />
          <label htmlFor="unidadeSaude">Unidade saúde</label>
          <input
            type="checkbox"
            name="tipoAtendimento"
            id="tipoAtendimento"
            onChange={handleLinhas}
            disabled={colunas.includes("tipoAtendimento")}
            checked={linhas.includes("tipoAtendimento")}
          />
          <label htmlFor="tipoAtendimento">Tipo atendimento</label>
          <input
            type="checkbox"
            name="sexo"
            id="sexo"
            onChange={handleLinhas}
            disabled={colunas.includes("sexo")}
            checked={linhas.includes("sexo")}
          />
          <label htmlFor="sexo">Sexo</label>
          <input
            type="checkbox"
            name="nomeProfissional"
            id="nomeProfissional"
            onChange={handleLinhas}
            disabled={colunas.includes("nomeProfissional")}
            checked={linhas.includes("nomeProfissional")}
          />
          <label htmlFor="nomeProfissional">Nome profissional</label>
        </div>
        <div style={{ margin: "0 10px 0 10px" }}>
          <div>
            <b>Colunas</b>
          </div>
          <input
            type="checkbox"
            name="unidadeSaude"
            id="unidadeSaude2"
            onChange={handleColunas}
            disabled={linhas.includes("unidadeSaude")}
            checked={colunas.includes("unidadeSaude")}
          />
          <label htmlFor="unidadeSaude2">Unidade saúde</label>
          <input
            type="checkbox"
            name="tipoAtendimento"
            id="tipoAtendimento2"
            onChange={handleColunas}
            disabled={linhas.includes("tipoAtendimento")}
            checked={colunas.includes("tipoAtendimento")}
          />
          <label htmlFor="tipoAtendimento2">Tipo atendimento</label>
          <input
            type="checkbox"
            name="sexo"
            id="sexo2"
            onChange={handleColunas}
            disabled={linhas.includes("sexo")}
            checked={colunas.includes("sexo")}
          />
          <label htmlFor="sexo2">Sexo</label>
          <input
            type="checkbox"
            name="nomeProfissional"
            id="nomeProfissional2"
            onChange={handleColunas}
            disabled={linhas.includes("nomeProfissional")}
            checked={colunas.includes("nomeProfissional")}
          />
          <label htmlFor="nomeProfissional2">Nome profissional</label>
        </div>
      </div>
      <div>
        <button type="button" onClick={onSubmit}>
          Aplicar
        </button>
        <button type="button" onClick={handleLimpar}>
          Limpar
        </button>
      </div>
    </>
  );
}
