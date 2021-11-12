import "./index.scss";

type Props = {
    isOn: boolean;
    onChange?: () => void;
    text: string;
    disabled?: boolean;
}

export const SwitchToggle = ({isOn, onChange, text, disabled}: Props) => (
    <div className={`switchtoggle ${disabled ? "disabled" : ''}`} onClick={onChange}>
        <img src="img/items/switchDown.svg"
             style={{display: (!disabled && isOn ? "" : "none")}}
             height="100%" alt="Switch on" />
        <img src="img/items/switchUp.svg"
             style={{display: (!disabled && isOn ? "none" : "")}}
             height="100%" alt="Switch off" />
        <span title="Toggle-Switch">
            {text} : {!disabled && isOn ? "On" : "Off"}
        </span>
    </div>
);
