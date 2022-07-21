import {useRef} from "react";

import {InputField} from "shared/components/InputField";

import {DefaultConfig, SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<string>;
// TODO: Add regex prop to pass into `isValid` maybe
export const TextModuleInputField = ({
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
            type="text"
            value={state.values}
            placeholder={state.allSame[0] ? "" : (placeholder ?? "-")}
            alt={alt}
            onChange={(ev) => setState.onChange(ev.target.value)}
            onFocus={() => setState.onFocus()}
            onBlur={() => setState.onBlur()} />
    );
}
