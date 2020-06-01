export class GridArea {
  readonly rowStart: number;
  readonly columnStart: number;
  readonly rowEnd: number;
  readonly columnEnd: number;
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
