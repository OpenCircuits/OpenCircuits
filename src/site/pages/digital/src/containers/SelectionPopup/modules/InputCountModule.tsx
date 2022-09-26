import {CalcPortConfigID, PortInfo} from "core/views/PortInfo";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetPortConfig} from "core/actions/compositions/SetPortConfig";

import {AllComponentInfo} from "core/models/info";
import {AnyComponent}     from "core/models/types";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";


import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";



type Props = {
    info: CircuitInfo;
}
export const InputCountModule = ({ info }: Props) => {
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

    const group = 0;

    const inputs = props[`${group}`];
    if (!inputs)
        return null;

    return (<div>
        Input Count
        <label>
            <NumberModuleInputField
                kind="int" min={2} max={8} step={1}
                props={inputs}
                alt="Number of inputs object(s) have"
                getAction={(newCounts) =>
                    new GroupAction(
                        newCounts.map((newAmt, i) => {
                            const configs = Object.keys(PortInfo[cs[i].kind]);
                            return configs.find((c) =>
                                (parseInt(c.split(",")[group]) === newAmt)
                            )!;
                        }).map((newConfig, i) => SetPortConfig(circuit, cs[i], newConfig)),
                        "Input Count Module"
                    )}
                onSubmit={({ isFinal, action }) => {
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>);
}
