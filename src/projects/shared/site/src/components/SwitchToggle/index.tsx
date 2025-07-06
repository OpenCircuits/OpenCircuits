import switchDown from "./switchDown.svg";
import switchUp   from "./switchUp.svg";

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
export const SwitchToggle = ({ className, isOn, height, disabled, children, onChange, ...callbacks }: Props) => (
    <div className={`switchtoggle ${disabled ? "disabled" : ""} ${className ?? ""}`}
         role="switch" aria-checked={!disabled && isOn} tabIndex={0}
         style={{ height }} onClick={onChange} {...callbacks}>
        <img src={switchDown}
             style={{ display: (!disabled && isOn ? "" : "none") }}
             height="100%" alt="Switch on" />
        <img src={switchUp}
             style={{ display: (!disabled && isOn ? "none" : "") }}
             height="100%" alt="Switch off" />
        <span>
            {children}
        </span>
    </div>
);
