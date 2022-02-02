import {GroupAction} from "core/actions/GroupAction";

import {Decoder} from "digital/models/ioobjects";

import {CoderPortChangeAction} from "digital/actions/ports/CoderPortChangeAction";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Decoder], number> = {
    types: [Decoder],
    valType: "int",
    getProps: (o) => o.getInputPortCount().getValue(),
    getAction: (s, newCount) =>
        new GroupAction(s.map(o => new CoderPortChangeAction(o, o.getInputPortCount().getValue(), newCount)))
}

export const DecoderInputCountModule = PopupModule({
    label: "Input Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 1, max: 8,
        alt: "Number of inputs object(s) have"
    })]
});
