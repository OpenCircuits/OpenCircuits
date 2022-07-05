import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {TranslateAction} from "core/actions/transform/TranslateAction";

import {Component} from "core/models";

import {ModuleSubmitInfo}       from "./inputs/ModuleInputField";
import {NumberModuleInputField} from "./inputs/NumberModuleInputField";
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

    const onSubmit = (info: ModuleSubmitInfo) => {
        renderer.render();
        if (info.isValid && info.isFinal) // Only add final action to history
            history.add(info.action);
    }
    const getAction = (newVal: number, dir: "x" | "y") => (
        new TranslateAction(
            cs,
            cs.map(c => c.getPos()),
            cs.map(c => c.getPos())
                .map(({ x, y }) => V(
                    (dir === "x" ? newVal*100 : x),
                    (dir === "y" ? newVal*100 : y),
                )),
            false,
        )
    );
    const getStepAction = (step: number, dir: "x" | "y") => (
        new TranslateAction(
            cs,
            cs.map(c => c.getPos()),
            cs.map(c => c.getPos())
                .map(({ x, y }) => V(
                    (dir === "x" ? x + step*100 : x),
                    (dir === "y" ? y + step*100 : y),
                )),
            false,
        )
    );

    return (<div>
        Position
        <label>
            <NumberModuleInputField
                kind="float" step={1} alt="X-Position of object(s)"
                props={props.x}
                getAction={(newX) => getAction(newX, "x")}
                getModifierAction={(step) => getStepAction(step, "x")}
                getCustomDisplayVal={(v) => parseFloat(v.toFixed(2))}
                onSubmit={onSubmit} />
            <NumberModuleInputField
                kind="float" step={1} alt="Y-Position of object(s)"
                props={props.y}
                getAction={(newY) => getAction(newY, "y")}
                getModifierAction={(step) => getStepAction(step, "y")}
                getCustomDisplayVal={(v) => parseFloat(v.toFixed(2))}
                onSubmit={onSubmit} />
        </label>
    </div>);
}
