import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {LabelTextColorChangeAction} from "digital/actions/LabelTextColorChangeAction";

import {Label} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ColorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const TextColorModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Label => (c instanceof Label),
        (c) => ({ color: c.getTextColor() }),
    );

    if (!props)
        return null;

    return (<div>
        Text Color
        <label>
            <ColorModuleInputField
                props={props.color}
                alt="Text color of object(s)"
                getAction={(newCol) =>
                    new GroupAction(
                        cs.map(o => new LabelTextColorChangeAction(o, newCol)),
                        "Text Color Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }} />
        </label>
    </div>);
}
