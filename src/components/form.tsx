import { ComponentProps, forwardRef } from "react";
import { IconArrowBack } from "@tabler/icons-react";
import cx from "@/utils/cx";

export interface Props extends ComponentProps<"form"> {
  inputProps: ComponentProps<"input">;
  buttonProps: ComponentProps<"button">;
}

const Form = ({ inputProps, buttonProps, onSubmit }: Props, ref: any) => {
  return (
    <form
      onSubmit={onSubmit}
      className="relative m-auto flex items-center gap-4 justify-center"
      ref={ref}
    >
      {/*<Avatar isUser={true} className="md:size-10 bg-gray-300" />*/}

      <input
        placeholder="Your question..."
        required
        {...inputProps}
        className={cx(
          "transition h-10 md:h-12 pl-4 pr-12 flex-1 rounded-xl",
          "border border-border-lite text-base bg-background-dark",
          "disabled:bg-gray-100",
          "placeholder-text-dark",
          inputProps.className,
        )}
        type="text"
      />

      <button
        {...buttonProps}
        type="submit"
        tabIndex={-1}
        className={cx(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "opacity-50 text-text-washed",
        )}
      >
        <IconArrowBack strokeWidth={1.5} />
      </button>
    </form>
  );
};

export default forwardRef(Form);
