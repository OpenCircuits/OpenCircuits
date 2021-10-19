type Props = {
    isOn: boolean;
    onChange?: () => void;
    text: string;
    className?: string;
    condition?: boolean;
}

export const SwitchToggle = ({isOn, onChange, text, className, condition}: Props) => (
    <div className={className} onClick={onChange}>
        <img src="img/items/switchDown.svg"
             style={{display: ((text == "Auto Save" ? condition : isOn) ? "" : "none")}}
             height="100%" alt="Switch on" />
        <img src="img/items/switchUp.svg"
             style={{display: ((text == "Auto Save" ? condition : isOn) ? "none" : "")}}
             height="100%" alt="Switch off" />
        <span title="Toggle-Switch">
            {text} : {(text == "Auto Save" ? condition : isOn) ? "On" : "Off"}
        </span>
    </div>
);
