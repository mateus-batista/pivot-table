/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, Dropdown, Icon, TextField } from "bold-ui";
import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import "../../css/Dnd.css";
import { ItemTypes } from "../../types/ItemTypes";

interface DraggableProps<T> {
  id: keyof T;
  type: ItemTypes;
  origin: number;
  value: string;
  filterSet: Set<string>;
  previousFilter: Set<string>;
  onDragEnd: () => void;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const { id, type, origin, value, filterSet, previousFilter, onDragEnd, handleFilterUpdate } = props;

  console.log(previousFilter);

  const [filter, setFilter] = useState<Set<string>>(previousFilter || new Set([]));
  const [{ isDragging }, drag] = useDrag({
    item: { type, id, origin },
    end: (_item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult != null && dropResult.result !== -1) {
        onDragEnd();
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  const buttonRef: any = useRef<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSelect = (element: string) => {
    return () => {
      //const element = document.getElementById(id);
      //element && element.classList.toggle("selected");
      filter.has(element) ? filter.delete(element) : filter.add(element);
      setFilter(new Set(filter));
      handleFilterUpdate(id as keyof T, filter);
    };
  };
  const handleSearch = () => {
    return function e(event: any) {
      const txt: string = event.currentTarget.value;
      filter.forEach((element) => {
        //if (element.search(txt)) {
        //}
      });
    };
  };

  const filterList: ReactElement[] = [];

  filterSet.forEach((element) => {
    const key = id + element;

    const item: ReactElement = (
      <div
        key={key}
        id={key}
        css={[styles.dropdownItem, filter.has(element) && styles.selectedItem]}
        onClick={handleSelect(element)}
      >
        <span>{element}</span>
      </div>
    );
    filterList.push(item);
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
      css={styles.dndBox}
    >
      <React.Fragment>
        <Button
          style={styles.button}
          innerRef={buttonRef}
          onClick={handleClick}
          size="small"
          kind="primary"
          skin="outline"
        >
          <Icon icon="dots" />
          {value}
        </Button>
        <Dropdown
          anchorRef={buttonRef}
          open={open}
          autoclose={false}
          onClose={handleClose}
          popperProps={{ placement: "bottom" }}
        >
          <TextField
            name="iconized"
            id="iconized"
            placeholder="Search for anything. Ex: Hercílio Luz"
            icon="zoomOutline"
            onChange={handleSearch()}
          />
          <div css={styles.dropdown}>{filterList}</div>
        </Dropdown>
      </React.Fragment>
    </div>
  );
}

const styles = {
  button: css`
    border: 1px solid black;
    border-radius: 2px;
    color: #24252e;
    padding-left: 0px;
    font-size: 13px;
  `,
  dndBox: css`
    display: inline-block;
    padding: 2px 4px;
    margin: 1px 1px 1px 1px;
  `,
  dropdownItem: css`
    width: 100%;
    cursor: pointer;
    border-bottom: 1px solid black;
    padding: 2px;
  `,
  selectedItem: css`
    text-decoration: line-through;
  `,
  dropdown: css`
    height: 120px;
    max-width: 300px;
    overflow: auto;
  `,
};
