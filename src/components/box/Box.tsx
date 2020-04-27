/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTheme } from "bold-ui";
import { SerializedStyles } from "@emotion/serialize";

export type BoxProps = {
  styles?: SerializedStyles;
};

export function Box(props: any) {
  const theme = useTheme();
  const { styles } = props;
  return (
    <div
      css={css`
        border: 1px solid ${theme.pallete.divider};
      `}
    >
      <div
        css={css`
          background-color: #f0f0f5;
          text-align: center;
          padding: 1rem 0.62rem;
          border-bottom: 1px solid ${theme.pallete.divider};
        `}
      >
        <h4>{props.label}</h4>
      </div>
      <div
        css={css`
          padding: 1rem;
          min-height: 3rem;
          ${styles}
        `}
      >
        {props.children}
      </div>
    </div>
  );
}
