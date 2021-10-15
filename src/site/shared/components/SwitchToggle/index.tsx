type Props = {
    isOn: boolean;
    onChange?: () => void;
    text: string;
}

export const SwitchToggle = ({isOn, onChange, text}: Props) => {
    return (
        <div onClick={onChange}>
            <img src="img/items/switchDown.svg" style={{display: (isOn ? "" : "none")}}
                height="100%" alt="Switch on" />
            <img src="img/items/switchUp.svg" style={{display: (isOn ? "none" : "")}}
                height="100%" alt="Switch off" />
            <span title="Toggle-Switch">
                {text} : {isOn ? "On" : "Off"}
            </span>
        </div>
    );
};
