/** @jsx jsx */
import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Draggable } from "./Draggable";
import { ItemTypes } from "../../types/ItemTypes";
import { jsx, css } from "@emotion/core";

interface DropableProps<T> {
  id: number;
  type: ItemTypes;
  keyMapping: Map<keyof T, string>;
  initialState?: Array<keyof T>;
  keys: Map<keyof T, Set<string>>;
  filtroLocal: Map<keyof T, Set<string>>;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
  handleUpdate?: (values: Array<keyof T>) => void;
}
export interface DragItem<T> {
  type: ItemTypes;
  id: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { id, initialState, keyMapping, type, handleUpdate } = props;

  const [keys, setKeys] = useState<Array<keyof T>>(initialState || []);

  const handleFilterUpdate = (key: keyof T, filtro: Set<string>) => {
    props.handleFilterUpdate(key, filtro);
  };
  const [{ isOver, isDragging }, drag] = useDrop({
    accept: type,
    drop(item: DragItem<T>) {
      if (!keys.includes(item.id)) {
        var temp = [...keys, item.id];
        setKeys(temp);
        handleUpdate && handleUpdate(temp);
        return { result: id };
      }
      return { result: -1 };
    },
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
      isOver: monitor.isOver() ? monitor.getItem().origin !== id : monitor.isOver(),
      isDragging: monitor.getItem() !== null,
    }),
  });

  function deleteByKey(id: keyof T) {
    var temp = [...keys];
    var index = temp.indexOf(id);
    if (index > -1) {
      temp.splice(index, 1);
    }
    setKeys(temp);
    handleUpdate && handleUpdate(temp);
  }
  const textSpanCss = css`
    display: block;
    text-align: center;
    padding-top: 11px;
    padding-bottom: 10px;
  `;
  const hoverBorderCss = css`
    min-height: inherit;
    border: 2px dotted black;
    padding: 2px;
  `;
  const boxCss = css`
    min-height: inherit;
    padding: 2px;
  `;
  const filtros = keys.map((key) => (
    <Draggable<T>
      key={key as string}
      type={type}
      id={key}
      value={keyMapping.get(key) as string}
      origin={id}
      filterSet={props.keys.get(key) as Set<string>}
      previousFilter={props.filtroLocal.get(key) as Set<string>}
      handleFilterUpdate={handleFilterUpdate}
      onDragEnd={() => deleteByKey(key)}
    />
  ));

  const hoverSpan = <div css={textSpanCss}>Solte aqui o item para inserir na tabela</div>;
  const placeholderSpan = <div css={textSpanCss}>Arraste os itens para inserir na tabela</div>;

  return (
    <div ref={drag} css={boxCss}>
      {isOver ? (
        <div css={hoverBorderCss}>{keys.length < 1 ? hoverSpan : filtros}</div>
      ) : (
        <div css={boxCss}>{keys.length < 1 ? placeholderSpan : filtros}</div>
      )}
    </div>
  );
}
