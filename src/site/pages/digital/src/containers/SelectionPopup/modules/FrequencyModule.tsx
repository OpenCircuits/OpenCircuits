import {GroupAction} from "core/actions/GroupAction";
import {FrequencyChangeAction} from "digital/actions/FrequencyChangeAction";
import {Clock, Oscilloscope} from "digital/models/ioobjects";
import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Clock, Oscilloscope], number> = {
    types: [Clock, Oscilloscope],
    valType: "int",
    getProps: (o) => o.getFrequency(),
    getAction: (s, newFreq) => new GroupAction(s.map(o => new FrequencyChangeAction(o, newFreq)))
}

export const FrequencyModule = PopupModule({
    label: "Delay",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 50,
        min: 50,
        max: 10000,
        alt: "Delay in milliseconds"
    })]
});
