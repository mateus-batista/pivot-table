/** @jsx jsx */
import { useState } from "react";
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
  name: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { id, initialState, keyMapping, type, handleUpdate } = props;

  const [keys, setKeys] = useState<Array<keyof T>>(initialState || []);

  const handleFilterUpdate = (key: keyof T, filtro: Set<string>) => {
    props.handleFilterUpdate(key, filtro);
  };
  const [{ isOver }, drag] = useDrop({
    accept: type,
    drop(item: DragItem<T>) {
      if (!keys.includes(item.name)) {
        const newKeys = [...keys, item.name];
        setKeys(newKeys);
        handleUpdate && handleUpdate(newKeys);
        return { result: 0 };
      }
      return { result: -1 };
    },
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
      isOver: monitor.isOver() ? monitor.getItem().origin !== id : monitor.isOver(),
    }),
  });

  function deleteByKey(id: keyof T) {
    let tempKeys = [...keys];
    const index = tempKeys.indexOf(id);
    if (index > -1) {
      tempKeys.splice(index, 1);
    }
    setKeys(tempKeys);
    handleUpdate && handleUpdate(tempKeys);
  }

  const draggableButtons = keys.map((key) => (
    <Draggable<T>
      type={type}
      name={key}
      value={keyMapping.get(key) || (key as string)}
      origin={id}
      filterSet={props.keys.get(key) as Set<string>}
      previousFilter={props.filtroLocal.get(key) as Set<string>}
      handleFilterUpdate={handleFilterUpdate}
      onDragEnd={() => deleteByKey(key)}
    />
  ));
  const hasKeys = keys.length > 0;
  const styles = {
    placeholder: css`
      align-self: center;
    `,
    hoverBorder: css`
      border: 2px dotted black;
    `,
    box: css`
      display: flex;
      justify-content: ${hasKeys ? "flex-start" : "center"};
      min-height: inherit;
    `,
  };

  return (
    <div ref={drag} css={[styles.box, isOver && styles.hoverBorder]}>
      {hasKeys ? (
        <div>{draggableButtons}</div>
      ) : (
        <div css={styles.placeholder}>
          {isOver ? "Solte aqui o item para inserir na tabela" : "Arraste os itens para inserir na tabela"}
        </div>
      )}
    </div>
  );
}
