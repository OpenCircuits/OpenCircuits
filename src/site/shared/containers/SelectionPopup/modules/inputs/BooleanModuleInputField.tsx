import {SwitchToggle} from "shared/components/SwitchToggle";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<boolean> & {
    text?: string;
}
export const BooleanModuleInputField = ({ text, ...props }: Props) => {
    const [state, setState] = useBaseModule<boolean>({
        ...props,

        parseVal: (val) => (val === "true"),
        isValid:  (_)  => true,
    });

    const isOn = (state.value === "true" || state.value === true);
    return (
        <SwitchToggle
            isOn={state.allSame ? isOn : false}
            height="35px"
            onChange={() => {
                setState.onFocus();
                setState.onChange(isOn ? "false" : "true");
                setState.onBlur();
            }}>
            {text}
        </SwitchToggle>
    );
}
