import "./index.scss";

type Props = {
    isOn: boolean;
    onChange?: () => void;
    text: string;
    disabled?: boolean;
    hideStateText?: boolean;
}

export const SwitchToggle = ({isOn, onChange, text, disabled, hideStateText}: Props) => (
    <div className={`switchtoggle ${disabled ? "disabled" : ''}`} onClick={onChange}>
        <img src="img/items/switchDown.svg"
             style={{display: (!disabled && isOn ? "" : "none")}}
             height="100%" alt="Switch on" />
        <img src="img/items/switchUp.svg"
             style={{display: (!disabled && isOn ? "none" : "")}}
             height="100%" alt="Switch off" />
        <span title="Toggle-Switch">
            {text}{!hideStateText && <> : {!disabled && isOn ? "On" : "Off"}</>}
        </span>
    </div>
);
