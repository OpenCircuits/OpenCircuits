import {GroupAction} from "core/actions/GroupAction";
import {SetNameAction} from "core/actions/SetNameAction";
import {IOObject} from "core/models";
import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const Config: ModuleConfig<[IOObject], string> = {
    types: [IOObject],
    valType: "string",
    getProps: (o) => o.getName(),
    getAction: (s, newName) => new GroupAction(s.map(o => new SetNameAction(o, newName)))
}

export const TitleModule = PopupModule({
    label: "",
    modules: [CreateModule({
        inputType: "text",
        config: Config,
        alt: "Name of object(s)"
    })]
});
