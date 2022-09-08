import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

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

    return (<div>
        Segment Count
        <label>
            <SelectModuleInputField
                kind="number[]"
                options={[["7", 7], ["9", 9], ["14", 14], ["16", 16]]}
                props={props.numSegments}
                getAction={(newCounts) =>
                    new GroupAction(
                        cs.map((o,i) => SetInputPortCount(o, newCounts[i])),
                        "Segment Count Module"
                    )}
                onSubmit={({ isFinal, action }) => {
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>);
}
