import {ButtonToggle} from "shared/components/ButtonToggle";
import {SwitchToggle} from "shared/components/SwitchToggle";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<boolean> & {
    type?: "button" | "switch";
    text?: string;
}
export const BooleanModuleInputField = ({ text, type, ...props }: Props) => {
    const [state, setState] = useBaseModule<[boolean]>({
        parseVal: (val) => (val === "true"),
        ...DefaultConfig(props),
    });

    const isOn = (state.values[0] === "true" || state.values[0] === true);

    const onClick = async () => {
        setState.onFocus();
        setState.onChange(isOn ? "false" : "true");
        setState.onBlur();
    }

    if (type === "button") {
        return (
            <ButtonToggle
                isOn={state.allSame ? isOn : false}
                height="35px"
                onChange={onClick}>
                {text}
            </ButtonToggle>
        );
    }

    return (
        <SwitchToggle
            isOn={state.allSame ? isOn : false}
            height="35px"
            onChange={onClick}>
            {text}
        </SwitchToggle>
    );
}
