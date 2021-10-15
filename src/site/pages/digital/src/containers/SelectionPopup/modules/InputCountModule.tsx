import {GroupAction} from "core/actions/GroupAction";

import {ANDGate, ORGate, XORGate} from "digital/models/ioobjects";
import {NANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {NORGate} from "digital/models/ioobjects/gates/ORGate";
import {XNORGate} from "digital/models/ioobjects/gates/XORGate";
import {Mux} from "digital/models/ioobjects/other/Mux";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[ANDGate, NANDGate, ORGate,
                            NORGate, XORGate, XNORGate], number> = {
    types: [ANDGate, NANDGate, ORGate,
            NORGate, XORGate, XNORGate],
    valType: "int",
    getProps: (o) => (o instanceof Mux ? o.getSelectPortCount() : o.getInputPortCount()).getValue(),
    getAction: (s, newCount) => (
        new GroupAction(s.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue(),  newCount)))
    )
}

export const InputCountModule = PopupModule({
    label: "Input Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 2, max: 8,
        alt: "Number of inputs object(s) have"
    })]
});
