import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {Oscilloscope} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ModuleSubmitInfo}       from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const OscilloscopeModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs, forceUpdate] = useSelectionProps(
        info,
        (o): o is Oscilloscope => (o instanceof Oscilloscope),
        (o) => ({
            numInputs: o.getInputPortCount().getValue(),
        })
    );

    const onSubmit = ({ isFinal, action }: ModuleSubmitInfo) => {
        renderer.render();
        if (isFinal)
            history.add(action);
    }

    if (!props)
        return null;

    return (<>
        <div>
            Inputs
            <label>
                <NumberModuleInputField
                    kind="int" min={1} max={8} step={1}
                    props={props.numInputs}
                    alt="The number of inputs for the Oscilloscope"
                    getAction={(newCounts) =>
                        new GroupAction(
                            cs.map((o,i) => SetInputPortCount(o, newCounts[i])),
                            "Oscilloscope Input Count Change Module"
                        )}
                    onSubmit={onSubmit} />
            </label>
        </div>
        <button type="button"
                title="Clear the Oscilloscope readings"
                onClick={() => {
                    cs.forEach((c) => c.reset());
                    renderer.render();
                    forceUpdate(); // Need to force an update since this isn't changed by an action
                }}>
            Clear
        </button>
    </>);
}
