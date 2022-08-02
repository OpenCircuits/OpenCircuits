import {useRef} from "react";

import {InputField} from "shared/components/InputField";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<string>;
export const ColorModuleInputField = ({
    placeholder, alt, ...props
}: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const [state, setState] = useBaseModule<[string]>({
        parseVal: (val) => val,
        ...DefaultConfig(props),
    });

    return (
        <InputField
            ref={ref}
            type="color"
            value={state.values}
            placeholder={state.allSame[0] ? "" : (placeholder ?? "-")}
            alt={alt}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()} />
    );
}
