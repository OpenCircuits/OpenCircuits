import {useRef} from "react";

import {InputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<string>;
// TODO: Add regex prop to pass into `isValid` maybe
export const TextModuleInputField = ({
    placeholder, alt, props, getAction, onSubmit, getCustomDisplayVal,
}: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const [state, setState] = useBaseModule<[string]>({
        props: props.map(v => [v]),

        isValid:  (_)  => true,
        parseVal: (val) => val,

        getAction: (newVals) => getAction(newVals.map(([v]) => v)),

        onSubmit,
        getCustomDisplayVal: (getCustomDisplayVal
            ? (([v]) => getCustomDisplayVal!(v))
            : undefined
        ),
    });

    return (
        <InputField
            ref={ref}
            type="text"
            value={state.values}
            placeholder={state.allSame[0] ? "" : (placeholder ?? "-")}
            alt={alt}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()} />
    )
}
