import { type ReactNode } from "react";
import "@css/_theme.scss";

interface InputWrapperProps {
  title: ReactNode;
  error?: string;
  htmlFor?: string;
  labelClassName?: string;
  children: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
}

const InputWrapper = (props: InputWrapperProps) => (
  <div className={`flex form-group ${props.wrapperClassName} ${props.error ? "error-field" : ""}`}>
    <div className="form-label flex align-items-center">
      <label htmlFor={props.htmlFor} className={props.labelClassName}>
        {props.title}
      </label>
    </div>

    <div className={`form-input ${props.inputClassName}`}>
      <div className="input-field-wrapper">{props.children}</div>
      <small
        className={`max-w-full text-sm block ${props.error ? "mt-2" : "mt-0"}`}
        style={{
          minHeight: props.error ? "1.5rem" : "0.5rem",
          lineHeight: "1.5",
          overflow: "visible",
          color: props.error ? "#d32f2f" : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        {props.error ?? " "}
      </small>
    </div>
  </div>
);

export default InputWrapper;
export type { InputWrapperProps };
