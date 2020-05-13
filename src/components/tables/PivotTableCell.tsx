/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { SerializedStyles } from "@emotion/serialize";
import { useTheme } from "bold-ui";
import { ReactNode } from "react";

export class GridArea {
  rowStart: number;
  columnStart: number;
  rowEnd: number;
  columnEnd: number;
  constructor(rowStart: number, columnStart: number, rowEnd: number, columnEnd: number) {
    if (rowStart > rowEnd || columnStart > columnEnd) {
      throw new SyntaxError("Valores de fim devem ser maiores que valores de inicio.");
    }
    this.rowStart = rowStart;
    this.columnStart = columnStart;
    this.rowEnd = rowEnd;
    this.columnEnd = columnEnd;
  }
  toString() {
    return `${this.rowStart}/${this.columnStart}/${this.rowEnd}/${this.columnEnd}`;
  }
}

export type PivotTableCellProps = {
  gridArea: GridArea;
  children?: ReactNode;
  endColumn?: boolean;
  endRow?: boolean;
  styles?: SerializedStyles;
};
export function PivotTableCell(props: PivotTableCellProps) {
  const { endColumn, endRow, styles, gridArea } = props;

  const theme = useTheme();

  const handleMouseEnter = () => {
    document
      .querySelectorAll(`div[data-rownumber="${gridArea.rowStart}"]`)
      .forEach((n) => n.setAttribute("style", `background-color: ${theme.pallete.gray.c90}`));
  };

  const handleMouseLeave = () => {
    document.querySelectorAll(`div[data-rownumber="${gridArea.rowStart}"]`).forEach((n) => n.setAttribute("style", ""));
  };
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-rownumber={gridArea.rowStart}
      key={gridArea.toString()}
      css={css([
        `
      grid-area: ${gridArea.toString()};
      border-top: 1px solid ${theme.pallete.divider};
      border-left: 1px solid ${theme.pallete.divider};
      display: flex;
      justify-content: flex-start;
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
      {props.children}
    </div>
  );
}
