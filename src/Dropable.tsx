import React, { ReactElement, useState, Children, FunctionComponent } from "react";
import { useDrop } from "react-dnd";
import { Draggable } from "./Draggable";
import { AtendimentoProfissional } from "./AtendimentoProfissional";
//import { Draggable } from "./Draggable";

interface DropableProps {
  handleUpdate: (values: Array<keyof AtendimentoProfissional>) => void;
  id: number;
  types: string[];
  initialState?: Array<keyof AtendimentoProfissional>;
  children?: ReactElement;
}
export interface DragItem {
  type: string;
  id: keyof AtendimentoProfissional;
  origin: number;
}

export function Dropable(props: DropableProps) {
  const { initialState } = props;

  const [ids, setIds] = useState<Array<keyof AtendimentoProfissional>>(
    initialState || []
  );

  const [{ isOver }, drag] = useDrop({
    accept: props.types,
    drop(item: DragItem) {
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
      isOver: monitor.isOver() ? monitor.getItem().origin !== props.id : monitor.isOver(),
    }),
  });
  const c: ReactElement[] = [];
  ids.forEach(id => {
    c.push(
      <Draggable
        type={props.types[0]}
        id={id}
        origin={props.id}
        func={() => deleteById(id)}
      >
        <div id={props.id + "-" + id}>
          <input type="hidden" name={props.id + "[]"} value={id}></input>
          {id}
        </div>
      </Draggable>
    );
  });

  return (
    <div
      ref={drag}
      style={{ backgroundColor: isOver ? "#888888" : "#FFFFFF" }}
      className="dnd-container"
    >
      {props.children}
      {c}
    </div>
  );
  function deleteById(id: keyof AtendimentoProfissional) {
    var temp = [...ids];
    var index = temp.indexOf(id);
    if (index > -1) {
      temp.splice(index, 1);
    }
    setIds(temp);
    props.handleUpdate(temp);
  }
}
