import {GroupAction} from "core/actions/GroupAction";

import {Mux} from "digital/models/ioobjects/other/Mux";

import {MuxPortChangeAction} from "digital/actions/ports/MuxPortChangeAction";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Mux], number> = {
    types: [Mux],
    valType: "int",
    getProps: (o) => o.getSelectPortCount().getValue(),
    getAction: (s, newCount) =>
        new GroupAction(s.map(o => new MuxPortChangeAction(o, o.getSelectPortCount().getValue(), newCount)))
}

export const SelectPortCountModule = PopupModule({
    label: "Selector Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 1, max: 8,
        alt: "Number of selector ports object(s) have"
    })]
});
