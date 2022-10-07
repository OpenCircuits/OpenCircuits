import {useRef} from "react";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props<T extends string|number> = SharedModuleInputFieldProps<T> & {
    kind: (T extends string ? "string[]" : "number[]");
    options: Array<[string, T]>;
    updateImmediately?: boolean;
}
export const SelectModuleInputField = <T extends number|string>({
    kind, options, placeholder, updateImmediately, ...props
}: Props<T>) => {
    const ref = useRef<HTMLSelectElement>(null);

    const [state, setState] = useBaseModule<[T]>({
        parseVal: (val) => (kind === "string[]" ? val : Number(val)) as T,
        ...DefaultConfig(props),
    });

    return (
        <select
            ref={ref}
            value={state.values[0]}
            placeholder={placeholder}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            onChange={(ev) => {
                setState.onChange(ev.target.value);
                if (updateImmediately)
                    ref.current?.blur();
            }}>
            <option value="" disabled hidden>{placeholder ?? "-"}</option>
            {options.map((o) => (
                <option key={`select-module-${o}`} value={o[1]}>{o[0]}</option>
        ))}
        </select>
    );
}
