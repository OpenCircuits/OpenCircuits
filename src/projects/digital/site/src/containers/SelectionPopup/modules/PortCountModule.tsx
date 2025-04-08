import React from "react";

import {Circuit, Component} from "shared/api/circuit/public";

import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/SelectModuleInputField";


type Props = {
    circuit: Circuit;
    kinds: Set<string>;
    basisPortGroup: string;
    label: string;
}
export const PortCountModule = ({ circuit, kinds, basisPortGroup, label }: Props) => {
    // TODO: this
    const [props, comps] = useSelectionProps(
        circuit,
        (c): c is Component => (
            (c.baseKind === "Component")
            && (kinds.has(c.kind))
        ),
        (c) => ({
            "configIndex": c.info.portConfigs.findIndex((config) =>
                config[basisPortGroup] === c.ports[basisPortGroup]?.length),
        }),
    );

    if (!props || comps.length === 0)
        return null;

    const cfgIndices = props["configIndex"];

    // ASSUMES ALL PORT CONFIGS ARE THE SAME FOR NOW
    // Get all possible values for this group (from component 0)
    const options = comps[0].info.portConfigs.map((config, i) =>
        [`${config[basisPortGroup]}`, i] as const);

    return (
        <div>
            {label} Count
            <label>
                <SelectModuleInputField
                    kind="number[]"
                    circuit={circuit}
                    options={options}
                    props={cfgIndices}
                    doChange={(newVals) => {
                        comps.forEach((comp, i) =>
                            comp.setPortConfig(comp.info.portConfigs[newVals[i]]));
                    }} />
            </label>
        </div>
    );
}
