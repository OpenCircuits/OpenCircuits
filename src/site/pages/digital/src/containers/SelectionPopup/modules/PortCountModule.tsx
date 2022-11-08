import {AllPortInfo}      from "core/views/portinfo";
import {CalcPortConfigID} from "core/views/portinfo/utils";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetPortConfig} from "core/actions/compositions/SetPortConfig";

import {AnyComponent} from "core/models/types";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";


type Props = {
    info: CircuitInfo;
    labels?: Record<string, string>;
}
export const PortCountModule = ({ info, labels }: Props) => {
    const { circuit, history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is AnyComponent => (
            (c.baseKind === "Component") &&
            // Only allow components that allow changes to their port config
            (AllPortInfo[c.kind].AllowChanges)
        ),
        (c) => (() => {
            const info = AllPortInfo[c.kind];
            if (!info.AllowChanges)
                return {};
            return { [info.ChangeGroup]: CalcPortConfigID(circuit, c) } as Record<string, number>;
        })(),
    );

    if (!props)
        return null;

    return (<>{Object.entries(props)
        .map(([group, inputs]) => {
            // Get all possible values for this group (from component 0)
            const options = AllPortInfo[cs[0].kind].PositionConfigs
                .map((config, i) => [`${config[group].length}`, i] as const);

            const label = labels?.[group] ?? "Port";

            return (
                <div key={group}>
                    {label} Count
                    <label>
                        <SelectModuleInputField
                            kind="number[]" options={options}
                            props={inputs}
                            getAction={(newConfigs) =>
                                new GroupAction(
                                    newConfigs.map((newConfigID, i) =>
                                        SetPortConfig(circuit, cs[i], newConfigID)),
                                    "Port Count Change"
                                )}
                            onSubmit={({ isFinal, action }) => {
                                renderer.render();
                                if (isFinal)
                                    history.add(action);
                            }} />
                    </label>
                </div>
            );
        })}</>);
}
