import {GroupAction} from "core/actions/GroupAction";

import { Gate } from "digital/models/ioobjects/gates/Gate";
import {Mux} from "digital/models/ioobjects/other/Mux";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";



const Config: ModuleConfig<[Gate], number> = {
    types: [Gate],
    valType: "int",
    getProps: (o) => (o instanceof Mux ? o.getSelectPortCount() : o.getInputPortCount()).getValue(),
    getAction: (s, newCount) => (
        new GroupAction(s.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue(),  newCount)), "Input Count Module")
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
