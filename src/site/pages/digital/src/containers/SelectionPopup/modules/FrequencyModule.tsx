import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {FrequencyChangeAction} from "digital/actions/FrequencyChangeAction";

import {Clock, Oscilloscope} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const FrequencyModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Clock | Oscilloscope => (c instanceof Clock || c instanceof Oscilloscope),
        (c) => ({ freq: c.getFrequency() })
    );

    if (!props)
        return null;

    return (<div>
        Delay
        <label>
            <NumberModuleInputField
                kind="int" min={50} max={10000} step={50}
                props={props.freq}
                alt="Delay in milliseconds"
                getAction={(newFreq) =>
                    new GroupAction(
                        cs.map(o => new FrequencyChangeAction(o, newFreq)),
                        "Frequency Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }} />
        </label>
    </div>);
}
