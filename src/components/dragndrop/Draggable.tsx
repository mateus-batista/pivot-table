import React, { ReactElement } from "react";
import { useDrag } from "react-dnd";
import "../../css/Dnd.css";
import { ItemTypes } from "../../types/ItemTypes";

interface DraggableProps<T> {
  id: keyof T;
  type: ItemTypes;
  origin: number;
  children?: ReactElement;
  onDragEnd: () => void;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const [{ isDragging }, drag] = useDrag({
    item: { type: props.type, id: props.id, origin: props.origin },
    end: (_item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult != null && dropResult.id !== -1) {
        props.onDragEnd();
      }
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
      className="dnd-box"
    >
      {props.children}
    </div>
  );
}
