/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTheme } from "bold-ui";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../../types/ItemTypes";
import { Draggable } from "./Draggable";

interface DropableProps<T> {
  id: number;
  type: ItemTypes;
  keys: Map<keyof T, Array<string>>;
  keyMapping: Map<keyof T, string>;
  keyState: Array<keyof T>;
  filterState: Map<keyof T, Set<string>>;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
  handleKeyUpdate: (values: Array<keyof T>) => void;
  onKeyNav: (key: keyof T, dir: "left" | "right", origin: number) => void;
}
export interface DragItem<T> {
  type: ItemTypes;
  name: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { id, keyState, keyMapping, type, handleKeyUpdate, onKeyNav } = props;

  const theme = useTheme();
  const handleFilterUpdate = (key: keyof T, filtro: Set<string>) => {
    props.handleFilterUpdate(key, filtro);
  };
  const [{ isOver }, drag] = useDrop({
    accept: type,
    drop(item: DragItem<T>) {
      if (!keyState.includes(item.name)) {
        const newKeys = [...keyState, item.name];
        handleKeyUpdate && handleKeyUpdate(newKeys);
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
    let tempKeys = [...keyState];
    const index = tempKeys.indexOf(id);
    if (index > -1) {
      tempKeys.splice(index, 1);
    }
    handleKeyUpdate && handleKeyUpdate(tempKeys);
  }

  const draggableButtons = keyState.map((key) => (
    <Draggable<T>
      key={key as string}
      type={type}
      name={key}
      value={keyMapping.get(key) || (key as string)}
      origin={id}
      filterValues={props.keys.get(key) as Array<string>}
      filterState={props.filterState.get(key) || new Set<string>()}
      handleFilterUpdate={handleFilterUpdate}
      onDragEnd={() => deleteByKey(key)}
      onKeyNav={onKeyNav}
    />
  ));
  const hasKeys = keyState.length > 0;
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
