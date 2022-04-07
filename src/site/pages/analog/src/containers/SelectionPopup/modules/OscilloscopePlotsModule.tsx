import {GroupAction} from "core/actions/GroupAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo"
import {ToggleOscilloscopePlotAction} from "analog/actions/ToggleOscilloscopePlotAction";
import {Oscilloscope} from "analog/models/eeobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {BooleanModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/BooleanModuleInputField";


type Props = {
    info: AnalogCircuitInfo;
}
export const OscilloscopePlotsModule = ({ info }: Props) => {
    const { renderer } = info;

    const curVecs = (info.sim?.hasData() && info.sim?.getFullVecIDs()) || [];
    const [props, os, forceUpdate] = useSelectionProps(
        info,
        (s): s is Oscilloscope => (s instanceof Oscilloscope),
        (o) => ({
            ...Object.fromEntries(curVecs.map(id => [id, false])),
            ...Object.fromEntries(o.getEnabledVecs().map(id => [id, true])),
        }),
        [curVecs.join("|")] // getProps depends on curVecs
    );

    if (!props || !info.sim)
        return null;

    return <div>
        Plots
        <div style={{ margin: "5px" }}>
        {Object.entries(props).map(([key, val]) => (
            <BooleanModuleInputField
                key={`oscilloscope-module-${key}`}
                props={val} text={key.split(".")[1]}
                getAction={(newVal) => new GroupAction(
                    os.map(o => new ToggleOscilloscopePlotAction(o, key as `${string}.${string}`, newVal)
                ))}
                onSubmit={(_) => {
                    renderer.render();
                    // Don't need to add this action to history
                    forceUpdate();
                }} />
        ))}
        </div>
    </div>
}
