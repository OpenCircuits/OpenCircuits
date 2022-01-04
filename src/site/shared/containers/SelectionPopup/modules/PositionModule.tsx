import {V} from "Vector";

import {Component} from "core/models";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {CreateModule, ModuleConfig, PopupModule, UseModuleProps} from "./Module";


const XConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().x/100,
    getAction: (s, newX) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(newX*100, s.getPos().y))),
    getDisplayVal: (v) => parseFloat(v.toFixed(2)),
}
const YConfig: ModuleConfig<[Component], number> = {
    types: [Component],
    valType: "float",
    getProps: (o) => o.getPos().y/100,
    getAction: (s, newY) => new TranslateAction(s,
                                                s.map(s => s.getPos()),
                                                s.map(s => V(s.getPos().x, newY*100))),
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
}) as (props: UseModuleProps) => JSX.Element;