import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {SegmentDisplay} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const SegmentCountModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is SegmentDisplay => (c instanceof SegmentDisplay),
        (c) => ({ numSegments: c.getSegmentCount() })
    );

    if (!props)
        return null;

    return <div>
        Segment Count
        <label>
            <SelectModuleInputField
                kind="number[]"
                options={[["7", 7], ["9", 9], ["14", 14], ["16", 16]]}
                props={props.numSegments}
                getAction={(newCount) =>
                    new GroupAction(
                        cs.map(o => new InputPortChangeAction(o, o.getSegmentCount(), newCount)),
                        "Segment Count Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }} />
        </label>
    </div>
}
