import {GroupAction} from "core/actions/GroupAction";
import {ColorChangeAction} from "digital/actions/ColorChangeAction";
import {Label, LED} from "digital/models/ioobjects";
import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const Config: ModuleConfig<[LED, Label], string> = {
    types: [LED, Label],
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
