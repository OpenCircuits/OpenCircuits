import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {OscilloscopeSamplesChangeAction} from "digital/actions/OscilloscopeSamplesChangeAction";
import {OscilloscopeSizeChangeAction} from "digital/actions/OscilloscopeSizeChangeAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {Oscilloscope} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
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
            numSamples: o.getNumSamples(),
            displayWidth: o.getDisplaySize().x,
            displayHeight: o.getDisplaySize().y,
        })
    );

    if (!props)
        return null;

    return <>
        <div>
            Display Size
            <label>
                <NumberModuleInputField
                    kind="float" min={100} max={1000} step={50}
                    props={props.displayWidth}
                    getAction={(newWidth) =>
                        new GroupAction(
                            cs.map(o => new OscilloscopeSizeChangeAction(o, V(newWidth, o.getDisplaySize().y))),
                            "Oscilloscope Width Change Module"
                        )}
                    onSubmit={(info) => {
                        renderer.render();
                        if (info.isValid && info.isFinal)
                            history.add(info.action);
                    }}
                    alt="Width of display size" />
                <NumberModuleInputField
                    kind="float" min={50} max={400} step={50}
                    props={props.displayHeight}
                    getAction={(newHeight) =>
                        new GroupAction(
                            cs.map(o => new OscilloscopeSizeChangeAction(o, V(o.getDisplaySize().x, newHeight))),
                            "Oscilloscope Height Change Module"
                        )}
                    onSubmit={(info) => {
                        renderer.render();
                        if (info.isValid && info.isFinal)
                            history.add(info.action);
                    }}
                    alt="Height of display size" />
            </label>
        </div>

        <div>
            Inputs
            <label>
                <NumberModuleInputField
                    kind="int" min={1} max={8} step={1}
                    props={props.numInputs}
                    getAction={(newCount) =>
                        new GroupAction(
                            cs.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue(), newCount)),
                            "Oscilloscope Input Count Change Module"
                        )}
                    onSubmit={(info) => {
                        renderer.render();
                        if (info.isValid && info.isFinal)
                            history.add(info.action);
                    }}
                    alt="The number of inputs for the Oscilloscope" />
            </label>
        </div>

        <div>
            Samples
            <label>
                <NumberModuleInputField
                    kind="int" min={10} max={400} step={10}
                    props={props.numSamples}
                    getAction={(newNumSamples) =>
                        new GroupAction(
                            cs.map(o => new OscilloscopeSamplesChangeAction(o, newNumSamples)),
                            "Oscilloscope Samples Change Module"
                        )}
                    onSubmit={(info) => {
                        renderer.render();
                        if (info.isValid && info.isFinal)
                            history.add(info.action);
                    }}
                    alt="The number of samples that the Oscilloscope takes" />
            </label>
        </div>

        <button
            title="Clear the Oscilloscope readings"
            onClick={() => {
                cs.forEach(c => c.reset());
                renderer.render();
                forceUpdate(); // Need to force an update since this isn't changed by an action
            }}>
            Clear
        </button>
    </>
}
