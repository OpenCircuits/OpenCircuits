import {useRef} from "react";

import {Action} from "core/actions/Action";

import {InputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps & {
    props: string[];
    getAction: (newVal: string) => Action;
}
export const ColorModuleInputField = ({ props, getAction, onSubmit,
                                        placeholder, ...otherProps }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const [state, setState] = useBaseModule<string>({
        props, getAction, onSubmit,

        parseVal:      (val) => val,
        parseFinalVal: (val) => val,
        isValid:        (_)  => true,
    });

    return (
        <InputField
            ref={ref}
            type="color"
            value={state.value}
            placeholder={state.allSame ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            {...otherProps} />
    )
}
