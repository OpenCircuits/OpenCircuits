import {useRef} from "react";

import {InputField} from "shared/components/InputField";

import {SharedModuleInputFieldProps, useBaseModule} from "./ModuleInputField";


type Props = SharedModuleInputFieldProps<string>;
// TODO: Add regex prop to pass into `isValid` maybe
export const TextModuleInputField = ({ placeholder, alt, ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    const [state, setState] = useBaseModule<string>({
        ...props,

        parseVal:      (val) => val,
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
            alt={alt} />
    )
}
