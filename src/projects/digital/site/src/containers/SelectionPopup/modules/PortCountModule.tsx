// import {SetPortConfig}    from "shared/api/circuit/actions/compositions/SetPortConfig";
import {Circuit, Component}          from "shared/api/circuit/public";
// import {AllPortInfo}      from "shared/api/circuit/views/portinfo";
// import {CalcPortConfigID} from "shared/api/circuit/views/portinfo/utils";

// import {GroupAction} from "shared/api/circuit/actions/GroupAction";

// import {AnyComponent} from "shared/api/circuit/models/types";
import React from "react";

import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

type Props = {
    circuit: Circuit;
}
export const PortCountModule = ({ circuit }: Props) => {
    // TODO: this
    return null;
    // const [props, cs] = useSelectionProps(
    //     circuit,
    //     (c): c is Component => (
    //         (c.baseKind === "Component") &&
    //         // Only allow components that allow changes to their port config
    //         (c.info.defaultPortConfig)
    //     ),
    //     (c) => (() => {
    //         const info = AllPortInfo[c.kind];
    //         if (!info.AllowChanges)
    //             return {};
    //         return { [info.ChangeGroup]: CalcPortConfigID(circuit, c) } as Record<string, number>;
    //     })(),
    // );

    // if (!props)
    //     return null;

    // return (<>{Object.entries(props)
    //     .map(([group, inputs]) => {
    //         // Get all possible values for this group (from component 0)
    //         const options = AllPortInfo[cs[0].kind].PositionConfigs
    //             .map((config, i) => [`${config[group].length}`, i] as const);

    //         const label = labels?.[group] ?? "Port";

    //         return (
    //             <div key={group}>
    //                 {label} Count
    //                 <label>
    //                     <SelectModuleInputField
    //                         kind="number[]" options={options}
    //                         props={inputs}
    //                         getAction={
    //                             (newConfigs) =>
    //                             new GroupAction(
    //                                 newConfigs.map((newConfigID, i) =>
    //                                     SetPortConfig(circuit, cs[i], newConfigID)),
    //                                 "Port Count Change"
    //                             )}
    //                         onSubmit={({ isFinal, action }) => {
    //                             renderer.render();
    //                             if (isFinal)
    //                                 history.add(action);
    //                         }}
    //                         />
    //                 </label>
    //             </div>
    //         );
    //     })}</>);
}
