import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import "../../css/Dnd.css";
import { ItemTypes } from "../../types/ItemTypes";

import { Button, Dropdown, DropdownDivider, DropdownItem, Tooltip } from "bold-ui";

interface DraggableProps<T> {
  id: keyof T;
  className: string;
  type: ItemTypes;
  origin: number;
  value: string;
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
  const buttonRef: any = useRef<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    buttonRef.current.focus();
  };

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
          <DropdownItem onClick={console.log}>Item #1</DropdownItem>
          <DropdownDivider />
          <DropdownItem component="a" href="/">
            Link item
          </DropdownItem>
          <DropdownItem type="danger" onClick={console.log}>
            Item #3
          </DropdownItem>
        </Dropdown>
      </>
      {props.children}
    </div>
  );
}
