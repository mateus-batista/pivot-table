/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, Checkbox, Dropdown, DropdownItem, HFlow, Icon, Tag, TextField, useTheme } from "bold-ui";
import React, { ReactElement, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../types/ItemTypes";

interface DraggableProps<T> {
  name: keyof T;
  type: ItemTypes;
  origin: number;
  value: string;
  filterSet: Set<string>;
  filterValues: Set<string>;
  onDragEnd: () => void;
  handleFilterUpdate: (key: keyof T, filtro: Set<string>) => void;
}

export function Draggable<T>(props: DraggableProps<T>) {
  const { name, type, origin, value, filterSet, filterValues, onDragEnd, handleFilterUpdate } = props;

  const [searchedFilterSet, setSearchedFilterSet] = useState<Set<string>>(filterSet);
  const [open, setOpen] = useState(false);
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
    setSearchedFilterSet(filterSet);
  };
  const handleSelect = (element: string) => (event: any) => {
    if (event.nativeEvent.isTrusted) {
      filterValues.has(element) ? filterValues.delete(element) : filterValues.add(element);
      handleFilterUpdate(name as keyof T, new Set<string>(filterValues));
    }
  };
  const handleSearch = () => (event: any) => {
    const searchResults = new Set<string>();
    const searchText: string = (event.currentTarget.value as string).toLocaleLowerCase();
    filterSet.forEach((element: string) => {
      const stringElement = element + "";
      const loweredElement = stringElement.toLocaleLowerCase();
      const found = loweredElement.search(searchText) !== -1;
      found && searchResults.add(element);
    });
    setSearchedFilterSet(searchResults);
  };

  const filterList: ReactElement[] = [];

  searchedFilterSet.forEach((element) => {
    const key = name + element;
    const selected = filterValues.has(element);
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
          size="small"
          kind="primary"
          skin="ghost"
        >
          <HFlow hSpacing={0.5}>
            <Icon icon="dots" />
            {value}
            {filterValues.size > 0 && <Tag type="normal">{filterValues.size}</Tag>}
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
