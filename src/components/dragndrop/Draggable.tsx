import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import "../../css/Dnd.css";
import { ItemTypes } from "../../types/ItemTypes";

import { Button, Dropdown, DropdownItem } from "bold-ui";

interface DraggableProps<T> {
  id: keyof T;
  className: string;
  type: ItemTypes;
  origin: number;
  value: string;
  filterSet: Set<string>;
  onDragEnd: () => void;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
}

function updateFilter(filter: string) {}

export function Draggable<T>(props: DraggableProps<T>) {
  const [filter, setFilter] = useState<Set<string>>(new Set([]));
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
  const buttonRef: any = useRef<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    buttonRef.current.focus();
  };
  const handleSelect = (content: string, id: string) => {
    return function e() {
      var element = document.getElementById(id);
      element && element.classList.toggle("selected");
      filter.has(content) ? filter.delete(content) : filter.add(content);
      setFilter(filter);
      props.handleFilterUpdate(props.id as keyof T, filter);
    };
  };
  const filterList: ReactElement[] = [];

  props.filterSet.forEach(element => {
    var id = props.id + element;
    var selected = filter.has(element) ? "" : "selected";
    var span: ReactElement = (
      <span id={id} className={selected}>
        {element}
      </span>
    );
    filterList.push(<DropdownItem onClick={handleSelect(element, id)}>{span}</DropdownItem>);
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
      className={props.className}
    >
      <>
        <Button innerRef={buttonRef} onClick={handleClick} size="small" kind="primary" skin="outline">
          {props.value}
        </Button>
        <Dropdown
          anchorRef={buttonRef}
          open={open}
          autoclose={false}
          onClose={handleClose}
          popperProps={{ placement: "bottom" }}
        >
          {filterList}
        </Dropdown>
      </>
    </div>
  );
}
