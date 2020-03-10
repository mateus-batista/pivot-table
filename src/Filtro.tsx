import React from "react";

export type FiltroProps = {
  handleSubmit: (value: any) => void;
};

export function Filtro(props: FiltroProps) {
  let values: string[] = [];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    target.checked
      ? values.push(target.name)
      : (values = values.filter(v => v !== target.name));
  };

  const onSubmit = (event: any) => props.handleSubmit(values);

  return (
    <form onSubmit={onSubmit}>
      Unidade saúde
      <input
        type="checkbox"
        name="unidadeSaude"
        id="unidadeSaude"
        onChange={handleChange}
      />
      Tipo atendimento
      <input
        type="checkbox"
        name="tipoAtendimento"
        id="tipoAtendimento"
        onChange={handleChange}
      />
      Sexo
      <input type="checkbox" name="sexo" id="sexo" onChange={handleChange} />
      Nome profissional
      <input
        type="checkbox"
        name="nomeProfissional"
        id="nomeProfissional"
        onChange={handleChange}
      />
      <button type="submit">Aplicar</button>
    </form>
  );
}
