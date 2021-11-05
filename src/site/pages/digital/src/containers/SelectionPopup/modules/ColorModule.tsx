import {GroupAction} from "core/actions/GroupAction";
import {ColorChangeAction} from "digital/actions/ColorChangeAction";
import {Label, LED} from "digital/models/ioobjects";
import {Wire} from "core/models/Wire";
import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[LED, Label, Wire], string> = {
    types: [LED, Label, Wire],
    valType: "string",
    getProps: (o) => o.getColor(),
    getAction: (s, newCol) => new GroupAction(s.map(o => new ColorChangeAction(o, newCol)))
}

export const ColorModule = PopupModule({
    label: "Color",
    modules: [CreateModule({
        inputType: "color",
        config: Config,
        alt: "Color of object(s)"
    })]
});
