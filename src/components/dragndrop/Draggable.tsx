import React, { ReactElement } from "react";
import { useDrag } from "react-dnd";
import "../../css/Dnd.css";

interface DraggableProps<T> {
  id: keyof T;
  type: string;
  origin: number;
  func: () => void;
  children?: ReactElement;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const [{ isDragging }, drag] = useDrag({
    item: { type: props.type, id: props.id, origin: props.origin },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult == null) {
      } else {
        if (dropResult.id !== -1) {
          props.func();
        }
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
