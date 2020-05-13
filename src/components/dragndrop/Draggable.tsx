/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, Dropdown, Icon, DropdownItem } from "bold-ui";
import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../types/ItemTypes";

interface DraggableProps<T> {
  name: keyof T;
  type: ItemTypes;
  origin: number;
  value: string;
  filterSet: Set<string>;
  previousFilter: Set<string>;
  onDragEnd: () => void;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const { name, type, origin, value, filterSet, previousFilter, onDragEnd, handleFilterUpdate } = props;

  const [filter, setFilter] = useState<Set<string>>(previousFilter || new Set([]));
  const [searchedFilterSet, setSearchedFilterSet] = useState<Set<string>>(filterSet);
  const [open, setOpen] = useState(false);
  const buttonRef: any = useRef<HTMLButtonElement>();

  const [{ isDragging }, drag] = useDrag({
    item: { type, name: name, origin },
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

  const handleClick = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchedFilterSet(filterSet);
  };
  const handleSelect = (element: string) => () => {
    filter.has(element) ? filter.delete(element) : filter.add(element);
    setFilter(new Set(filter));
    handleFilterUpdate(name as keyof T, filter);
  };
  const handleSearch = () => (event: any) => {
    const searchResults = new Set<string>();
    const txt: string = (event.currentTarget.value as string).toLocaleLowerCase();
    filterSet.forEach((element) => {
      const loweredElement = element.toLocaleLowerCase();
      const found = loweredElement.search(txt) !== -1;
      found && searchResults.add(element);
    });
    setSearchedFilterSet(searchResults);
  };

  const filterList: ReactElement[] = [];

  searchedFilterSet.forEach((element) => {
    const key = name + element;
    const item: ReactElement = (
      <div
        key={key}
        css={[styles.dropdownItem, filter.has(element) ? styles.selectedItem : styles.unselectedItem]}
        onClick={handleSelect(element)}
      >
        <span>{element}</span>
      </div>
    );
    filterList.push(item);
  });

  return (
    <div key={name as string} ref={drag} css={[styles.dndBox, isDragging && styles.dndBoxDragging]}>
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
          {filter.size > 0 && <Icon icon="filterFilled" />}
        </Button>
        <Dropdown
          anchorRef={buttonRef}
          open={open}
          autoclose={false}
          onClose={handleClose}
          popperProps={{ placement: "bottom" }}
          style={styles.dropdown}
        >
          <DropdownItem css={styles.noOutline}>
            <div css={styles.dropdownArea}>
              <div css={styles.search}>
                <input placeholder="Pesquisa" onChange={handleSearch()} />
              </div>
              {filterList}
            </div>
          </DropdownItem>
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
  dndBoxDragging: css`
    opacity: 0.5;
  `,
  dropdownItem: css`
    width: 100%;
    cursor: pointer;
    border-bottom: 1px solid white;
    padding: 2px;
  `,
  selectedItem: css`
    background-color: #ffffff;
  `,
  unselectedItem: css`
    background-color: #ebf0f8;
  `,
  dropdownArea: css`
    max-width: 300px;
    max-height: 300px;
    overflow: auto;
  `,
  dropdown: css`
    padding: 0px;
  `,
  search: css`
    padding: 4px;
  `,
  noOutline: css`
    outline-color: white;
  `,
};
