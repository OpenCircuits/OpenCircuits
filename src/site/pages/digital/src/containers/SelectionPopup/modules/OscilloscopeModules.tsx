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


export const OscilloscopePauseButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Pause"
        alt="Pause the Oscilloscope readings"
        getDependencies={(s) => (s instanceof Oscilloscope ? `${s.isPaused()}` : "-")}
        isActive={(selections) => selections.every(s => s instanceof Oscilloscope && !s.isPaused())}
        onClick={(selections) => {
            (selections as Oscilloscope[]).forEach(c => c.pause());
        }}
        {...props} />
);

export const OscilloscopeResumeButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Resume"
        alt="Resume the Oscilloscope readings"
        getDependencies={(s) => (s instanceof Oscilloscope ? `${s.isPaused()}` : "-")}
        isActive={(selections) => selections.every(s => s instanceof Oscilloscope && s.isPaused())}
        onClick={(selections) => {
            (selections as Oscilloscope[]).forEach(c => c.resume());
        }}
        {...props} />
);
