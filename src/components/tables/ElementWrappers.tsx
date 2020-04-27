/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTheme } from "bold-ui";
import { SerializedStyles } from "@emotion/serialize";

export type TableWrapperProps = {
  styles?: SerializedStyles;
};
export function TableWrapper(props: any) {
  const { styles } = props;
  const theme = useTheme();
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: auto auto auto auto;
        place-items: center center;
        place-content: start start;
        div,
        span {
          border-top: 1px solid ${theme.pallete.divider};
          border-left: 1px solid ${theme.pallete.divider};
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 0.5rem 1rem;
        }
        ${styles}
      `}
    >
      {props.children}
    </div>
  );
}

export type HeaderWrapperProps = {
  children: string | undefined;
};
export function HeaderWrapper(props: HeaderWrapperProps) {
  return <h4>{props.children?.toUpperCase()}</h4>;
}
