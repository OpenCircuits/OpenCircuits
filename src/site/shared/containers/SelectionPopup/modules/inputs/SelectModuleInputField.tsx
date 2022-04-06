import {useRef} from "react";

import {Action} from "core/actions/Action";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props<T extends string|number> = SharedModuleInputFieldProps & {
    kind: (T extends string ? "string[]" : "number[]");
    props: T[];
    options: Array<[string, T]>;
    getAction: (newVal: T) => Action;
}
export const SelectModuleInputField = <T extends number|string>(
    { kind, props, options, getAction, onSubmit, placeholder }: Props<T>) => {
    const ref = useRef<HTMLSelectElement>(null);

    const [state, setState] = useBaseModule<T>({
        props, getAction, onSubmit,

        parseVal:      (val) => (kind === "string[]" ? val : Number(val)) as T,
        parseFinalVal: (val) => val,
        isValid:        (_)  => true,
    });

    return (
        <select
            ref={ref}
            value={state.value}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            placeholder={placeholder}>
        <option value="" disabled hidden>{placeholder ?? "-"}</option>
        {options.map(o => (
            <option key={`select-module-${o}`} value={o[1]}>{o[0]}</option>
        ))}
        </select>
    );
}
