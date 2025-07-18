import buttonDown from "./buttonDown.svg";
import buttonUp   from "./buttonUp.svg";

import "./index.scss";


type Props = {
    className?: string;

    isOn: boolean;
    height?: string;
    disabled?: boolean;

    children?: React.ReactNode;

    onChange?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export const ButtonToggle = ({ className, isOn, height, disabled, children, onChange, ...callbacks }: Props) => (
    <div className={`buttontoggle ${disabled ? "disabled" : ""} ${className ?? ""}`}
         role="switch" aria-checked={!disabled && isOn} tabIndex={0}
         style={{ height }} onClick={onChange} {...callbacks}>
        <img src={buttonDown}
             style={{ display: (!disabled && isOn ? "" : "none") }}
             height="100%" alt="Button on" />
        <img src={buttonUp}
             style={{ display: (!disabled && isOn ? "none" : "") }}
             height="100%" alt="Button off" />
        <span>
            {children}
        </span>
    </div>
);
