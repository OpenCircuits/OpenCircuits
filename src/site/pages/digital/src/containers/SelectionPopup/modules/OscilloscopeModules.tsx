import {GroupAction} from "core/actions/GroupAction";
import {Oscilloscope} from "digital/models/ioobjects";

import {OscilloscopeSamplesChangeAction} from "digital/actions/OscilloscopeSamplesChangeAction";
import {OscilloscopeSizeChangeAction} from "digital/actions/OscilloscopeSizeChangeAction";

import {ButtonPopupModule, CreateModule, ModuleConfig, PopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";
import {V} from "Vector";


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


const OscilloscopeInputCountConfig: ModuleConfig<[Oscilloscope], number> = {
    types: [Oscilloscope],
    valType: "int",
    getProps: (o) => o.getInputPortCount().getValue(),
    getAction: (s, newCount) => (
        new GroupAction(s.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue(),  newCount)))
    )
}

export const OscilloscopeInputCountModule = PopupModule({
    label: "Inputs",
    modules: [CreateModule({
        inputType: "number",
        config: OscilloscopeInputCountConfig,
        step: 1, min: 1, max: 8,
        alt: "Number of inputs for the Oscilloscope"
    })]
});


const OscilloscopeDisplaySizeModuleXConfig: ModuleConfig<[Oscilloscope], number> = {
    types: [Oscilloscope],
    valType: "float",
    getProps: (o) => o.getDisplaySize().x,
    getAction: (s, newW) => (
        new GroupAction(s.map(o => new OscilloscopeSizeChangeAction(o, V(newW, o.getDisplaySize().y))))
    )
}
const OscilloscopeDisplaySizeModuleYConfig: ModuleConfig<[Oscilloscope], number> = {
    types: [Oscilloscope],
    valType: "float",
    getProps: (o) => o.getDisplaySize().y,
    getAction: (s, newH) => (
        new GroupAction(s.map(o => new OscilloscopeSizeChangeAction(o, V(o.getDisplaySize().x, newH))))
    )
}

export const OscilloscopeDisplaySizeModule = PopupModule({
    label: "Display Size",
    modules: [
        CreateModule({
            inputType: "number",
            config: OscilloscopeDisplaySizeModuleXConfig,
            min: 100,
            max: 1000,
            step: 50,
            alt: "Width of display size"
        }),
        CreateModule({
            inputType: "number",
            config: OscilloscopeDisplaySizeModuleYConfig,
            min: 50,
            max: 400,
            step: 50,
            alt: "Height of display size part"
        })
    ]
});