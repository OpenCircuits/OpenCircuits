import {GroupAction} from "core/actions/GroupAction";
import {Encoder} from "digital/models/ioobjects";
import {CoderPortChangeAction} from "digital/actions/ports/CoderPortChangeAction";
import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const Config: ModuleConfig<[Encoder], number> = {
    types: [Encoder],
    valType: "int",
    getProps: (o) => o.getOutputPortCount().getValue(),
    getAction: (s, newCount) => new GroupAction(s.map(o =>
        new CoderPortChangeAction(o, o.getOutputPortCount().getValue(), newCount)))
}

export const OutputCountModule = PopupModule({
    label: "Output Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 2, max: 8,
        alt: "Number of outputs object(s) have"
    })]
});
