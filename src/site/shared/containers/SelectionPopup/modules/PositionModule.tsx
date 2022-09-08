import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Translate} from "core/actions/units/Translate";

import {Component} from "core/models";

import {ModuleSubmitInfo}       from "./inputs/ModuleInputField";
import {VectorModuleInputField} from "./inputs/VectorModuleInputField";
import {useSelectionProps}      from "./useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const PositionModule = ({ info }: Props) => {
    const { renderer, history } = info;

    const [props, cs] = useSelectionProps(
        info,
        (s): s is Component => (s instanceof Component),
        (s) => ({ x: s.getPos().x/100, y: s.getPos().y/100 })
    );

    if (!props)
        return null;

    const onSubmit = ({ isFinal, action }: ModuleSubmitInfo) => {
        renderer.render();
        if (isFinal)
            history.add(action);
    }

    return (<div>
        Position
        <label>
            <VectorModuleInputField
                kind="float" step={V(1,1)}
                props={props.x.map((x, i) => V(x, props.y[i]))}
                getAction={(newVals) => Translate(
                    cs,
                    cs.map((_,i) => V(newVals[i].x*100, newVals[i].y*100),
                ))}
                getCustomDisplayVal={(v) => V(
                    parseFloat(v.x.toFixed(2)),
                    parseFloat(v.y.toFixed(2))
                )}
                onSubmit={onSubmit} />
        </label>
    </div>);
}
