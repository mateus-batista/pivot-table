/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { SerializedStyles } from "@emotion/serialize";
import { useTheme } from "bold-ui";
import { ReactNode, MouseEvent } from "react";
import { GridArea } from "../../classes/GridArea";

export type PivotTableCellProps = {
  gridArea: GridArea;
  type: Array<"header" | "value" | "total">;
  children?: ReactNode;
  endColumn?: boolean;
  endRow?: boolean;
  styles?: SerializedStyles;
};
export function PivotTableCell(props: PivotTableCellProps) {
  const { endColumn, endRow, styles, gridArea, type } = props;

  const theme = useTheme();

  const handleMouseEnter = (evt: MouseEvent<HTMLDivElement>) => {
    if (type.includes("value")) {
      document
        .querySelectorAll(
          `div[data-rownumber~="${gridArea.rowStart}"], div[data-columnnumber~="${gridArea.columnStart}"]`
        )
        .forEach((n) => {
          if (n !== evt.currentTarget) {
            n.setAttribute("style", `background-color: ${theme.pallete.gray.c90}; position: relative; z-index: -1`);
          }
        });
    }
  };

  const handleMouseLeave = () => {
    if (type.includes("value")) {
      document
        .querySelectorAll(
          `div[data-rownumber~="${gridArea.rowStart}"], div[data-columnnumber~="${gridArea.columnStart}"]`
        )
        .forEach((n) => n.removeAttribute("style"));
    }
  };
  const rowNumbers = [];
  for (let i = gridArea.rowStart; i < gridArea.rowEnd; i++) {
    rowNumbers.push(i);
  }

  const columnNumbers = [];
  for (let i = gridArea.columnStart; i < gridArea.columnEnd; i++) {
    columnNumbers.push(i);
  }
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-rownumber={rowNumbers.join(" ")}
      data-columnnumber={columnNumbers.join(" ")}
      key={gridArea.toString()}
      css={css([
        `
      grid-area: ${gridArea.toString()};
      border-top: 1px solid ${theme.pallete.divider};
      border-left: 1px solid ${theme.pallete.divider};
      display: flex;
      justify-content: ${type.includes("value") ? "flex-end" : "flex-start"};
      font-weight: ${type.includes("total") ? "bold" : "normal"};
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 0.5rem 1rem;
      `,
        endColumn && `border-right: 1px solid ${theme.pallete.divider};`,
        endRow && `border-bottom: 1px solid ${theme.pallete.divider};`,
        type.includes("value") &&
          `&: hover {
          background-color: ${theme.pallete.gray.c90}
        }`,
        styles,
      ])}
    >
      {type.includes("header") ? <h5>{props.children}</h5> : props.children}
    </div>
  );
}
