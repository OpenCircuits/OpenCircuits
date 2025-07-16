import {useRef} from "react";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props<T extends string|number> = SharedModuleInputFieldProps<T> & {
    kind: (T extends string ? "string[]" : "number[]");
    options: Array<readonly [string, T]>;
}
export const SelectModuleInputField = <T extends number|string>({
    kind, options, placeholder, ...props
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
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()}
            onChange={(ev) => {
                setState.onChange(ev.target.value);
                // Unfortunately, we need to immediately blur when selecting a value in
                // a select module. This is because of some weird, very hard to control
                // DOM behavior where the onBlur for a `select` fires after a normal
                // `input` elements, to the point where there's a race condition when
                // switching from the select to an input module where the input module
                // gets priority and cancels this transaction.
                // Would love to find a better solution if possible, but this is a fine
                // compromise since selecting from a dropdown is a pretty direct action.
                // Issue #1381.
                ref.current?.blur();
            }}>
            <option value="" disabled hidden>{placeholder ?? "-"}</option>
            {options.map((o) => (
                <option key={`select-module-${o}`} value={o[1]}>{o[0]}</option>
        ))}
        </select>
    );
}
