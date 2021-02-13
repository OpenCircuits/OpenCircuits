import {GroupAction} from "core/actions/GroupAction";
import {ClockFrequencyChangeAction} from "digital/actions/ClockFrequencyChangeAction";
import {Clock} from "digital/models/ioobjects";
import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const Config: ModuleConfig<[Clock], number> = {
    types: [Clock],
    valType: "int",
    getProps: (o) => o.getFrequency(),
    getAction: (s, newFreq) => new GroupAction(s.map(o => new ClockFrequencyChangeAction(o, newFreq)))
}

export const ClockFrequencyModule = PopupModule({
    label: "Clock Delay",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 100,
        min: 200,
        max: 10000,
        alt: "Clock delay in milliseconds"
    })]
});
