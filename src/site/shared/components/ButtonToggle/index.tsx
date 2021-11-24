import "./index.scss";


type Props = {
    isOn: boolean;
    className?: string;
    height?: string;
    onChange?: () => void;
    text?: string;
    disabled?: boolean;
}

export const ButtonToggle = ({isOn, className, height, onChange, text, disabled}: Props) => (
    <div className={`buttontoggle ${disabled ? "disabled" : ''} ${className}`}
         onClick={onChange}
         style={{ height }}>
        <img src="img/items/buttonDown.svg"
             style={{display: (!disabled && isOn ? "" : "none")}}
             height="100%" alt="Button on" />
        <img src="img/items/buttonUp.svg"
             style={{display: (!disabled && isOn ? "none" : "")}}
             height="100%" alt="Button off" />
        <span>{text}</span>
    </div>
);
