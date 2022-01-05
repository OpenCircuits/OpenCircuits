import "./index.scss";


type Props = {
    isOn: boolean;
    className?: string;
    height?: string;
    onChange?: () => void;
    text?: string;
    disabled?: boolean;
}
export const SwitchToggle = ({isOn, className, height, onChange, text, disabled}: Props) => (
    <div className={`switchtoggle ${disabled ? "disabled" : ""} ${className ?? ""}`}
         onClick={onChange}
         style={{ height }}>
        <img src="img/items/switchDown.svg"
             style={{display: (!disabled && isOn ? "" : "none")}}
             height="100%" alt="Switch on" />
        <img src="img/items/switchUp.svg"
             style={{display: (!disabled && isOn ? "none" : "")}}
             height="100%" alt="Switch off" />
        <span>{text}</span>
    </div>
);
