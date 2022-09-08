import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {Comparator} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const ComparatorInputCountModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Comparator => (c instanceof Comparator),
        (c) => ({ numInputs: c.getInputPortCount().getValue()/2 })
    );

    if (!props)
        return null;

    return (<div>
        Input Count
        <label>
            <NumberModuleInputField
                kind="int" min={1} max={8} step={1}
                props={props.numInputs}
                alt="Number of inputs object(s) have"
                getAction={(newCounts) =>
                    new GroupAction(
                        cs.map((o,i) => SetInputPortCount(o, 2*newCounts[i])),
                        "Comparator Input Count Module"
                    )}
                onSubmit={({ isFinal, action }) => {
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>);
}
