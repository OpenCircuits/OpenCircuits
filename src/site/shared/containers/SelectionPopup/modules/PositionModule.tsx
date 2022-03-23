import {V} from "Vector";

import {Component} from "core/models";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {CreateModule, ModuleConfig, PopupModule} from "./Module";


const XConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().x/100,
    getAction: (s, newX, incremented) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(
                                                    // use value as either an increment or new position
                                                    incremented ? s.getPos().x + 100*newX : 100*newX, 
                                                    s.getPos().y
                                                ))),
    getDisplayVal: (v) => parseFloat(v.toFixed(2)),
}
const YConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().y/100,
    getAction: (s, newY, incremented) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(
                                                    s.getPos().x,
                                                    incremented ? s.getPos().y + 100*newY : 100*newY
                                                ))),
    getDisplayVal: (v) => parseFloat(v.toFixed(2)),
}

export const PositionModule = PopupModule({
    label: "Position",
    modules: [
        CreateModule({
            inputType: "number",
            config: XConfig,
            step: 1,
            alt: "X-Position of object(s)"
        }),
        CreateModule({
            inputType: "number",
            config: YConfig,
            step: 1,
            alt: "Y-Position of object(s)"
        })
    ]
});
