import {ComponentInfo} from "../ComponentInfo";

import {CircuitState, CircuitTypes} from "./CircuitState";


export function ComponentInfoImpl<T extends CircuitTypes>(
    state: CircuitState<T>,
    kind: string,
) {
    const result = state.internal.getComponentInfo(kind);
    if (!result.ok)
        throw new Error(`Failed to find component info for ${kind}!`);
    const info = result.unwrap();

    return {
        kind,
        portGroups:        info.portGroups,
        defaultPortConfig: info.defaultPortConfig,
    } satisfies ComponentInfo;
}
