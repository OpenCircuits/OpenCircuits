import {CalcPortConfigID, PortInfo} from "core/views/PortInfo";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetPortConfig} from "core/actions/compositions/SetPortConfig";

import {AllComponentInfo} from "core/models/info";
import {AnyComponent}     from "core/models/types";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";


const GetNewPortConfig = (c: AnyComponent, group: number, newAmt: number) => (
    Object.keys(PortInfo[c.kind]).find((c) =>
        (parseInt(c.split(",")[group]) === newAmt)
    )!
);

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
            (c.kind in AllComponentInfo && AllComponentInfo[c.kind].PortInfo.AllowChanges)
        ),
        (c) => (() => {
            const changeGroup = AllComponentInfo[c.kind].PortInfo.ChangeGroup ?? 0;
            const curConfig = CalcPortConfigID(circuit, c);
            const portAmt = parseInt(curConfig.split(",")[changeGroup]);
            return { [`${changeGroup}`]: portAmt } as Record<`${number}`, number>;
        })(),
    );

    if (!props)
        return null;

    return (<>{Object.entries(props)
        .map(([sGroup, inputs]) => {
            const group = parseInt(sGroup);

            // Get all possible values for this group (from component 0)
            const values = Object.keys(PortInfo[cs[0].kind])
                .map((s) => parseInt(s.split(",")[group]));
            const options = values.map((v) => [`${v}`, v] as const);

            const label = labels?.[group] ?? "Port";

            return (
                <div key={group}>
                    {label} Count
                    <label>
                        <SelectModuleInputField
                            kind="number[]" options={options}
                            props={inputs}
                            getAction={(newCounts) =>
                                new GroupAction(
                                    newCounts.map((newAmt, i) =>
                                        SetPortConfig(circuit, cs[i], GetNewPortConfig(cs[i], group, newAmt))),
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
