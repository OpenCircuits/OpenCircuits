import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {BUFGate} from "digital/models/ioobjects";

import {Gate} from "digital/models/ioobjects/gates/Gate";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const InputCountModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Gate => (c instanceof Gate && !(c instanceof BUFGate)),
        (c) => ({ numInputs: c.getInputPortCount().getValue() })
    );

    if (!props)
        return null;

    return (<div>
        Input Count
        <label>
            <NumberModuleInputField
                kind="int" min={2} max={8} step={1}
                props={props.numInputs}
                alt="Number of inputs object(s) have"
                getAction={(newCounts) =>
                    new GroupAction(
                        cs.map((o,i) => SetInputPortCount(o, newCounts[i])),
                        "Input Count Module"
                    )}
                onSubmit={({ isFinal, action }) => {
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>);
}
