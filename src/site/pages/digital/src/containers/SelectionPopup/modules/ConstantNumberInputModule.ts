import {GroupAction} from "core/actions/GroupAction";
import {ConstantNumber} from "digital/models/ioobjects";
import {CreateModule, ModuleConfig, PopupModule} from "shared/containers/SelectionPopup/modules/Module";
import {ConstantNumberChangeAction} from "digital/actions/ConstantNumberChangeAction"


const Config: ModuleConfig<[ConstantNumber], number> = {
    types: [ConstantNumber],
    valType: "int",
    getProps: (o) => o.getInputNum(),
    getAction: (s,newInput) => new GroupAction(s.map(o => new ConstantNumberChangeAction(o,newInput)))
}

export const ConstantNumberInputModule = PopupModule({
    label: "Input Number",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1,
        min: 0,
        max: 15,
        alt: "Constant number input (0-15)"
    })]
});
