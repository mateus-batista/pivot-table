import React, { ReactElement, useState, useRef } from "react";
import { useDrop } from "react-dnd";
import { Draggable } from "./Draggable";
import { ItemTypes } from "../../types/ItemTypes";

interface DropableProps<T> {
  id: number;
  type: ItemTypes;
  position: string;
  keyMapping: Map<keyof T, string>;
  initialState?: Array<keyof T>;
  children?: ReactElement;
  handleUpdate: (values: Array<keyof T>) => void;
}
export interface DragItem<T> {
  type: ItemTypes;
  id: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { id, initialState, keyMapping, type, handleUpdate } = props;

  const [keys, setKeys] = useState<Array<keyof T>>(initialState || []);

  const [{ isOver }, drag] = useDrop({
    accept: type,
    drop(item: DragItem<T>) {
      if (!keys.includes(item.id)) {
        var temp = [...keys, item.id];
        setKeys(temp);
        handleUpdate(temp);
        return { id: id };
      }
      return { id: -1 };
    },
    collect: monitor => ({
      canDrop: !!monitor.canDrop(),
      isOver: monitor.isOver() ? monitor.getItem().origin !== id : monitor.isOver()
    })
  });

  function deleteByKey(id: keyof T) {
    var temp = [...keys];
    var index = temp.indexOf(id);
    if (index > -1) {
      temp.splice(index, 1);
    }
    setKeys(temp);
    handleUpdate(temp);
  }

  const draglist: ReactElement[] = [];

  return (
    <div ref={drag} style={{ backgroundColor: isOver ? "#888888" : "#FFFFFF" }} className={"border " + props.position}>
      {props.children}
      {keys.map(key => (
        <Draggable<T>
          key={key as string}
          type={type}
          className={"dnd-box"}
          id={key}
          value={keyMapping.get(key) as string}
          origin={id}
          onDragEnd={() => deleteByKey(key)}
        ></Draggable>
      ))}
    </div>
  );
}
