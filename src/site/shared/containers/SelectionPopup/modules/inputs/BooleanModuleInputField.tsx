import {Action} from "core/actions/Action";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";
import {SwitchToggle} from "shared/components/SwitchToggle";


type Props = SharedModuleInputFieldProps & {
    props: boolean[];
    text?: string;
    getAction: (newVal: boolean) => Action;
}
export const BooleanModuleInputField = ({ props, text, getAction, onSubmit }: Props) => {
    const [state, setState] = useBaseModule<boolean>({
        props, getAction, onSubmit,

        parseVal:      (val) => (val === "true"),
        parseFinalVal: (val) => val,
        isValid:        (_)  => true,
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
