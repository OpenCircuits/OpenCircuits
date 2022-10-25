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
    labels?: Record<number, string>;
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
            return { [`${info.ChangeGroup}`]: CalcPortConfigID(circuit, c) } as Record<`${number}`, string>;
        })(),
    );

    if (!props)
        return null;

    return (<>{Object.entries(props)
        .map(([sGroup, inputs]) => {
            const group = parseInt(sGroup);

            // Get all possible values for this group (from component 0)
            const options = Object.keys(AllPortInfo[cs[0].kind].Positions)
                .map((s) => [s.split(",")[group], s] as const);

            const label = labels?.[group] ?? "Port";

            return (
                <div key={group}>
                    {label} Count
                    <label>
                        <SelectModuleInputField
                            kind="string[]" options={options}
                            props={inputs}
                            getAction={(newConfigs) =>
                                new GroupAction(
                                    newConfigs.map((newConfig, i) =>
                                        SetPortConfig(circuit, cs[i], newConfig)),
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
