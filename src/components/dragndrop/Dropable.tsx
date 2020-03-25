import React, { ReactElement, useState } from "react";
import { useDrop } from "react-dnd";
import { Draggable } from "./Draggable";

interface DropableProps<T> {
  id: number;
  types: string[];
  position: string;
  idMapping: Map<keyof T, string>;
  initialState?: Array<keyof T>;
  children?: ReactElement;
  handleUpdate: (values: Array<keyof T>) => void;
}
export interface DragItem<T> {
  type: string;
  id: keyof T;
  origin: number;
}

export function Dropable<T>(props: DropableProps<T>) {
  const { initialState, idMapping } = props;

  const [ids, setIds] = useState<Array<keyof T>>(initialState || []);

  const [{ isOver }, drag] = useDrop({
    accept: props.types,
    drop(item: DragItem<T>) {
      if (!ids.includes(item.id)) {
        var temp = [...ids, item.id];
        setIds(temp);
        props.handleUpdate(temp);
        return { id: props.id };
      }
      return { id: -1 };
    },
    collect: monitor => ({
      canDrop: !!monitor.canDrop(),
      isOver: monitor.isOver() ? monitor.getItem().origin !== props.id : monitor.isOver()
    })
  });

  return (
    <div ref={drag} style={{ backgroundColor: isOver ? "#888888" : "#FFFFFF" }} className={"border " + props.position}>
      {props.children}
      {ids.map(id => (
        <Draggable<T> type={props.types[0]} id={id} origin={props.id} func={() => deleteById(id)}>
          <div id={props.id + "-" + id}>{idMapping.get(id)}</div>
        </Draggable>
      ))}
    </div>
  );
  function deleteById(id: keyof T) {
    var temp = [...ids];
    var index = temp.indexOf(id);
    if (index > -1) {
      temp.splice(index, 1);
    }
    setIds(temp);
    props.handleUpdate(temp);
  }
}
