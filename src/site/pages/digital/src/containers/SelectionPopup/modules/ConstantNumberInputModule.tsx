import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {ConstantNumber} from "digital/models/ioobjects";

import {ConstantNumberChangeAction} from "digital/actions/ConstantNumberChangeAction"

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const ConstantNumberInputModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is ConstantNumber => (c instanceof ConstantNumber),
        (c) => ({ inputNum: c.getInputNum() })
    );

    if (!props)
        return null;

    return <div>
        Input Number
        <label>
            <NumberModuleInputField
                kind="int" min={0} max={15} step={1}
                props={props.inputNum}
                getAction={(newInput) =>
                    new GroupAction(
                        cs.map(o => new ConstantNumberChangeAction(o, newInput)),
                        "Constant Number Input Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }}
                alt="Constant number input (0-15)" />
        </label>
    </div>
}
