import {ComponentInfo} from "../ComponentInfo";

import {CircuitState, CircuitTypes} from "./CircuitState";


export function ComponentInfoImpl<T extends CircuitTypes>(
    state: CircuitState<T>,
    kind: string,
) {
    const info = state.internal.doc.getComponentInfo(kind);
    if (!info)
        throw new Error(`Failed to find component info for ${kind}!`);

    return {
        kind,
        portGroups:        info.portGroups,
        defaultPortConfig: info.defaultPortConfig,
    } satisfies ComponentInfo;
}
