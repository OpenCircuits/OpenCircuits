import buttonDown from "./buttonDown.svg";
import buttonUp   from "./buttonUp.svg";

import "./index.scss";


type Props = {
    readonly className?: string;

    readonly isOn: boolean;
    readonly height?: string;
    readonly disabled?: boolean;

    readonly children?: React.ReactNode;

    readonly onChange?: () => void;
    readonly onFocus?: () => void;
    readonly onBlur?: () => void;
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
