import {GroupAction} from "core/actions/GroupAction";

import {Comparator} from "digital/models/ioobjects";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Comparator], number> = {
    types: [Comparator],
    valType: "int",
    getProps: (o) => o.getInputPortCount().getValue()/2,
    getAction: (s, newCount) =>
        new GroupAction(s.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue()/2, newCount)))
}

export const ComparatorInputCountModule = PopupModule({
    label: "Input Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 1, max: 8,
        alt: "Number of inputs object(s) have"
    })]
});
