import {useRef} from "react";

import {Action} from "core/actions/Action";

import {InputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps & {
    props: string[];
    getAction: (newVal: string) => Action;
}
// TODO: Add regex prop to pass into `isValid` maybe
export const TextModuleInputField = ({ props, getAction, onSubmit,
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
            type="text"
            value={state.value}
            placeholder={state.allSame ? "" : (placeholder ?? "-")}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            {...otherProps} />
    )
}
