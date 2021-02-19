import {V} from "Vector";

import {Component} from "core/models";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const XConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().x,
    getAction: (s, newX) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(newX, s.getPos().y)))
}
const YConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().y,
    getAction: (s, newY) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(s.getPos().x, newY)))
}

export const PositionModule = PopupModule({
    label: "Position",
    modules: [
        CreateModule({
            inputType: "number",
            config: XConfig,
            step: 10,
            alt: "X-Position of object(s)"
        }),
        CreateModule({
            inputType: "number",
            config: YConfig,
            step: 10,
            alt: "Y-Position of object(s)"
        })
    ]
});
