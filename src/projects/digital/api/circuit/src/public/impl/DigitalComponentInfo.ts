import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";

import {extend} from "shared/api/circuit/utils/Functions";

import {DigitalComponentInfo as DigitalComponentInfoInternal} from "digital/api/circuit/internal/DigitalComponents";

import {DigitalComponentInfo} from "../DigitalComponentInfo";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export function DigitalComponentInfoImpl(state: DigitalCircuitState, kind: string) {
    const info = state.internal.doc.getComponentInfo(kind).unwrap();
    if (!(info instanceof DigitalComponentInfoInternal))
        throw new Error(`Received non-digital component info for ${kind}!`);

    const base = ComponentInfoImpl<DigitalTypes>(state, kind);

    return extend(base, {
        get inputPortGroups(): readonly string[] {
            return info.inputPortGroups;
        },
        get outputPortGroups(): readonly string[] {
            return info.outputPortGroups;
        },
    } as const) satisfies DigitalComponentInfo;
}
