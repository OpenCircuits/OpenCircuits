import {GroupAction} from "core/actions/GroupAction";

import {LabelTextColorChangeAction} from "analog/actions/LabelTextColorChangeAction";

import {Label} from "analog/models/eeobjects";

import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";


const Config: ModuleConfig<[Label], string> = {
    types: [Label],
    valType: "string",
    getProps: (o) => o.getTextColor(),
    getAction: (s, newCol) => new GroupAction(
        s.map(o => new LabelTextColorChangeAction(o, newCol)),
        "Text Color Module"
    ),
}

export const TextColorModule = PopupModule({
    label: "Text Color",
    modules: [CreateModule({
        inputType: "color",
        config: Config,
        alt: "Text color of object(s)",
    })],
});
