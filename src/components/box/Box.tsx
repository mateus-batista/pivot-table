/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTheme, Icon } from "bold-ui";
import { SerializedStyles } from "@emotion/serialize";

export type BoxProps = {
  styles?: SerializedStyles;
  icon?: string;
  rotation?: number;
};

export function Box(props: any) {
  const theme = useTheme();
  const { styles, icon, rotation } = props;
  return (
    <div
      css={css`
        border: 1px solid ${theme.pallete.divider};
      `}
    >
      <div
        css={css`
          background-color: ${theme.pallete.gray.c90};
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid ${theme.pallete.divider};
        `}
      >
        <h4
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          {icon && (
            <Icon
              icon={icon}
              style={css`
                transform: rotate(${rotation}deg);
              `}
            />
          )}
          {props.label}
        </h4>
      </div>
      <div
        css={css`
          min-height: 7.18rem;
          ${styles}
        `}
      >
        {props.children}
      </div>
    </div>
  );
}
