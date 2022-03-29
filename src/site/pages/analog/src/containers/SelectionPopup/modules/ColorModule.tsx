import {GroupAction} from "core/actions/GroupAction";

import {Wire, isNode} from "core/models";

import {ColorChangeAction} from "analog/actions/ColorChangeAction";
import {Label} from "analog/models/eeobjects";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Label, Wire], string> = {
    types: [Label, Wire],
    valType: "string",
    isActive: (selections) => {
        // Make sure that this is only active if all the types are LED/Label/Wire/Node, but not ONLY Nodes
        return selections.all((s) => (isNode(s) || s instanceof Label || s instanceof Wire)) &&
               !selections.all((s) => isNode(s));
    },
    getProps: (o) => (isNode(o) ? undefined : o.getColor()),
    getAction: (s, newCol) => new GroupAction(
        s.filter(o => !isNode(o))
         .map(o => new ColorChangeAction(o, newCol)),
        "Color Module"
    ),
}

export const ColorModule = PopupModule({
    label: "Color",
    modules: [CreateModule({
        inputType: "color",
        config: Config,
        alt: "Color of object(s)",
    })],
});
