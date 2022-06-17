import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {Wire} from "core/models/Wire";
import {isNode} from "core/models/Node";

import {ColorChangeAction} from "digital/actions/ColorChangeAction";

import {Label, LED} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {ColorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const ColorModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is LED | Label | Wire => (c instanceof LED || c instanceof Label || c instanceof Wire),
        (c) => ({ color: c.getColor() }),
        [],
        (n) => isNode(n), // Ignore nodes since they are commonly selected w/ wires
    );

    if (!props)
        return null;

    return <div>
        Color
        <label>
            <ColorModuleInputField
                props={props.color}
                getAction={(newCol) =>
                    new GroupAction(
                        cs.filter(o => !isNode(o)).map(o => new ColorChangeAction(o, newCol)),
                        "Color Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }}
                alt="Color of object(s)" />
        </label>
    </div>
}
