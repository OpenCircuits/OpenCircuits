import {GroupAction} from "core/actions/GroupAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";
import {SegmentDisplay} from "digital/models/ioobjects";
import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[SegmentDisplay], number> = {
    types: [SegmentDisplay],
    valType: "int",
    getProps: (o) => o.getSegmentCount(),
    getAction: (s, newCount) => new GroupAction(s.map(o => new InputPortChangeAction(o, o.getSegmentCount(), newCount)))
}

export const SegmentCountModule = PopupModule({
    label: "Segment Count",
    modules: [CreateModule({
        inputType: "select",
        config: Config,
        options: [7, 9, 14, 16],
    })]
});
