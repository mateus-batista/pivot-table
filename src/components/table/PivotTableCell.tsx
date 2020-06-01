/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { SerializedStyles } from "@emotion/serialize";
import { useTheme } from "bold-ui";
import { ReactNode } from "react";
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

  const handleMouseEnter = () => {
    document
      .querySelectorAll(`div[data-rownumber="${gridArea.rowStart}"], div[data-columnnumber="${gridArea.columnStart}"]`)
      .forEach((n) => n.setAttribute("style", `background-color: ${theme.pallete.gray.c90}`));
  };

  const handleMouseLeave = () => {
    document
      .querySelectorAll(`div[data-rownumber="${gridArea.rowStart}"], div[data-columnnumber="${gridArea.columnStart}"]`)
      .forEach((n) => n.setAttribute("style", ""));
  };
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-rownumber={gridArea.rowStart}
      data-columnnumber={gridArea.columnStart}
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
      &hover: {
        background-color: ${theme.pallete.gray.c90}
      }
    `,
        endColumn && `border-right: 1px solid ${theme.pallete.divider};`,
        endRow && `border-bottom: 1px solid ${theme.pallete.divider};`,
        styles,
      ])}
    >
      {type.includes("header") ? <h5>{props.children}</h5> : props.children}
    </div>
  );
}
