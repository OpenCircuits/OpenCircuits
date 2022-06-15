import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {MuxPortChangeAction} from "digital/actions/ports/MuxPortChangeAction";

import {Mux} from "digital/models/ioobjects/other/Mux";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const SelectPortCountModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Mux => (c instanceof Mux),
        (c) => ({ numSelects: c.getSelectPortCount().getValue() })
    );

    if (!props)
        return null;

    return <div>
        Selector Count
        <label>
            <NumberModuleInputField
                kind="int" min={1} max={8} step={1}
                props={props.numSelects}
                getAction={(newCount) =>
                    new GroupAction(
                        cs.map(o => new MuxPortChangeAction(o, o.getSelectPortCount().getValue(), newCount)),
                        "Select Count Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }}
                alt="Number of selector ports object(s) have" />
        </label>
    </div>
}
