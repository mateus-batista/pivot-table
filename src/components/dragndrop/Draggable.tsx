/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, Checkbox, Dropdown, DropdownItem, HFlow, Icon, TextField, useTheme } from "bold-ui";
import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../types/ItemTypes";

interface DraggableProps<T> {
  name: keyof T;
  type: ItemTypes;
  origin: number;
  value: string;
  filterValues: Array<string>;
  filterState: Set<string>;
  onDragEnd: () => void;
  onKeyNav: (key: keyof T, dir: "left" | "right", origin: number) => void;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const { name, type, origin, value, filterValues, filterState, onDragEnd, handleFilterUpdate, onKeyNav } = props;

  const [searchedFilterSet, setSearchedFilterSet] = useState<Array<string>>(filterValues);
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState<0 | 1 | 2>(
    filterState.size === 0 ? 0 : filterState.size === filterValues.length ? 2 : 1
  );
  const buttonRef: any = useRef<HTMLButtonElement>();
  const theme = useTheme();

  const styles = {
    button: css`
      border: solid 1px ${theme.pallete.gray.c60};
      color: ${theme.pallete.gray.c10};
      border-radius: 2px;
      box-shadow: ${theme.shadows.outer[10]};
      padding-left: 0px;
      font-size: 13px;
    `,
    dndBox: css`
      display: inline-block;
      margin: 0.25rem 0.25rem;
    `,
    dndBoxDragging: css`
      box-shadow: ${theme.shadows.outer[10]};
    `,
    dropdownItem: css`
      width: 100%;
      cursor: pointer;
      border-top: 1px solid gray;
      padding: 0.25rem;
    `,
    dropdownArea: css`
      max-height: 10rem;
      overflow: auto;
    `,
    dropdown: css`
      padding: 0rem;
    `,
    search: css`
      padding: 0.5rem;
    `,
    noOutline: css`
      outline-color: ${theme.pallete.surface.main};
    `,
  };

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
    setSearchedFilterSet(filterValues);
  };
  const handleSelect = (element: string) => (event: any) => {
    if (event.nativeEvent.isTrusted) {
      filterState.has(element) ? filterState.delete(element) : filterState.add(element);
      handleFilterUpdate(name as keyof T, new Set<string>(filterState));
      if (filterState.size === 0) {
        setAll(0);
      } else if (filterState.size === filterValues.length) {
        setAll(2);
      } else {
        setAll(1);
      }
    }
  };
  const handleKeyDown = (filterKey: keyof T) => (event: any) => {
    const key = event.nativeEvent.key;
    if (key === "ArrowRight") {
      onKeyNav(filterKey, "right", origin);
      onDragEnd();
    } else if (key === "ArrowLeft") {
      onKeyNav(filterKey, "left", origin);
      onDragEnd();
    }
  };
  const handleSearch = () => (event: any) => {
    const searchResults = new Array<string>();
    const searchText: string = (event.currentTarget.value as string).toLocaleLowerCase();
    filterValues.forEach((element: string) => {
      const stringElement = element + "";
      const loweredElement = stringElement.toLocaleLowerCase();
      const found = loweredElement.search(searchText) !== -1;
      found && searchResults.push(element);
    });
    setSearchedFilterSet(searchResults);
  };
  const handleSelectAll = () => (event: any) => {
    if (event.nativeEvent.isTrusted) {
      if (all === 0) {
        setAll(2);
        handleFilterUpdate(name as keyof T, new Set<string>(filterValues));
      } else if (all === 2) {
        setAll(0);
        handleFilterUpdate(name as keyof T, new Set<string>(new Set<string>()));
      } else {
        setAll(2);
        handleFilterUpdate(name as keyof T, new Set<string>(filterValues));
      }
    }
  };

  const filterList: ReactElement[] = [];
  const checkboxAll: ReactElement = (
    <DropdownItem key="todos" css={styles.dropdownItem}>
      <Checkbox label="Todos" onChange={handleSelectAll()} checked={all === 2} indeterminate={all === 1} />
    </DropdownItem>
  );
  filterList.push(checkboxAll);
  searchedFilterSet.forEach((element) => {
    const key = name + element;
    const selected = filterState.has(element);

    const item: ReactElement = (
      <DropdownItem key={key} css={styles.dropdownItem}>
        <Checkbox label={element} onChange={handleSelect(element)} checked={selected} />
      </DropdownItem>
    );
    filterList.push(item);
  });

  return (
    <div ref={drag} css={[styles.dndBox, isDragging && styles.dndBoxDragging]}>
      <React.Fragment>
        <Button
          style={styles.button}
          innerRef={buttonRef}
          onClick={handleClick}
          onKeyDown={handleKeyDown(name)}
          size="small"
          kind="primary"
          skin="ghost"
        >
          <HFlow hSpacing={0.5}>
            <Icon icon="dots" />
            {value}
            {open ? <Icon icon="angleUp" /> : <Icon icon="angleDown" />}
          </HFlow>
        </Button>
        <Dropdown
          anchorRef={buttonRef}
          open={open}
          autoclose={false}
          onClose={handleClose}
          popperProps={{ placement: "bottom" }}
          style={styles.dropdown}
        >
          <div>
            <DropdownItem css={styles.noOutline}>
              <div css={styles.search}>
                <TextField
                  name="iconized"
                  id="iconized"
                  placeholder="Pesquisa"
                  icon="zoomOutline"
                  onChange={handleSearch()}
                />
              </div>
            </DropdownItem>
            <div css={styles.dropdownArea}>{filterList}</div>
          </div>
        </Dropdown>
      </React.Fragment>
    </div>
  );
}
