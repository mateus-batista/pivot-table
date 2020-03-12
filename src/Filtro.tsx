import React, { useState } from "react";

export type FiltroProps = {
  handleSubmit: (value: any) => void;
};

export function Filtro(props: FiltroProps) {
  const [values, setValues] = useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;

    if (target.checked) {
      setValues([...values, target.name]);
    } else {
      setValues(values.filter(v => v !== target.name));
    }
  };

  const onSubmit = (event: any) => {
    props.handleSubmit(values);
  };

  return (
    <>
      <input
        type="checkbox"
        name="unidadeSaude"
        id="unidadeSaude"
        onChange={handleChange}
      />
      Unidade saúde
      <input
        type="checkbox"
        name="tipoAtendimento"
        id="tipoAtendimento"
        onChange={handleChange}
      />
      Tipo atendimento
      <input type="checkbox" name="sexo" id="sexo" onChange={handleChange} />
      Sexo
      <input
        type="checkbox"
        name="nomeProfissional"
        id="nomeProfissional"
        onChange={handleChange}
      />
      Nome profissional
      <button type="button" onClick={onSubmit}>
        Aplicar
      </button>
    </>
  );
}
