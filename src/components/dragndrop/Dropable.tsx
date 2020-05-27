/** @jsx jsx */
import { useState } from "react";
import { useDrop } from "react-dnd";
import { Draggable } from "./Draggable";
import { ItemTypes } from "../../types/ItemTypes";
import { jsx, css } from "@emotion/core";
import { useTheme } from "bold-ui";

interface DropableProps<T> {
  id: number;
  type: ItemTypes;
  keyMapping: Map<keyof T, string>;
  initialState?: Array<keyof T>;
  keys: Map<keyof T, Set<string>>;
  filterState: Map<keyof T, Set<string>>;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
  handleKeyUpdate?: (values: Array<keyof T>) => void;
}
export interface DragItem<T> {
  type: ItemTypes;
  name: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { id, initialState, keyMapping, type, handleKeyUpdate: handleUpdate } = props;

  const [keys, setKeys] = useState<Array<keyof T>>(initialState || []);
  const theme = useTheme();
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
      key={key as string}
      type={type}
      name={key}
      value={keyMapping.get(key) || (key as string)}
      origin={id}
      filterValues={props.keys.get(key) as Set<string>}
      filterState={props.filterState.get(key) || new Set<string>()}
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
      border: dashed 2px ${theme.pallete.gray.c70};
    `,
    box: css`
      display: flex;
      min-height: 7.18rem;
      margin: 0.25rem;
      padding: 0.75rem;
      justify-content: ${hasKeys ? "flex-start" : "center"};
    `,
  };

  return (
    <div ref={drag} css={[styles.box, isOver && styles.hoverBorder]}>
      {hasKeys ? (
        <div>{draggableButtons}</div>
      ) : (
        <div css={styles.placeholder}>
          <i>{isOver ? "Solte aqui o item para inserir na tabela" : "Arraste os itens para inserir na tabela"}</i>
        </div>
      )}
    </div>
  );
}
