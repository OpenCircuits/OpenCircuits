import {GroupAction} from "core/actions/GroupAction";
import {Oscilloscope} from "digital/models/ioobjects";

import {OscilloscopeSamplesChangeAction} from "digital/actions/OscilloscopeSamplesChangeAction";

import {ButtonPopupModule, CreateModule, ModuleConfig, PopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";


const OscilloscopeSamplesConfig: ModuleConfig<[Oscilloscope], number> = {
    types: [Oscilloscope],
    valType: "int",
    getProps: (o) => o.getNumSamples(),
    getAction: (s, newNumSamples) => new GroupAction(s.map(o => new OscilloscopeSamplesChangeAction(o, newNumSamples)))
}

export const OscilloscopeSamplesModule = PopupModule({
    label: "Samples",
    modules: [CreateModule({
        inputType: "number",
        config: OscilloscopeSamplesConfig,
        step: 10,
        min: 10,
        max: 400,
        alt: "The number of samples that the Oscilloscope takes"
    })]
});

export const ClearOscilloscopeButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Clear"
        alt="Clear the Oscilloscope readings"
        getDependencies={(s) => (s instanceof Oscilloscope ? "1" : "0")}
        isActive={(selections) => selections.every(s => s instanceof Oscilloscope)}
        onClick={(selections) => {
            (selections as Oscilloscope[]).forEach(c => c.reset());
        }}
        {...props} />
);
